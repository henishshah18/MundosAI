from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, HTTPException, Query

from backend.db.database import get_database
from backend.repositories.base import BaseRepository
from backend.models.appointment import Appointment, AppointmentStatus, CreatedFrom
from backend.models.campaign import CampaignStatus
from backend.schemas.public import AppointmentBookingRequest, AppointmentBookingResponse


router = APIRouter(tags=["public"])


@router.get("/availability")
async def get_availability(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000),
    service_id: str | None = None,
) -> dict[str, list[str]]:
    # Simple generated schedule: Mon-Fri, 09:00-16:30 every 30 minutes
    from calendar import monthrange

    num_days = monthrange(year, month)[1]
    slots_by_date: dict[str, list[str]] = {}
    for day in range(1, num_days + 1):
        dt = datetime(year, month, day)
        # Skip weekends
        if dt.weekday() >= 5:
            continue
        times: list[str] = []
        for hour in range(9, 17):
            for minute in (0, 30):
                times.append(f"{hour:02d}:{minute:02d}")
        slots_by_date[dt.date().isoformat()] = times
    return slots_by_date


@router.post("/appointments/book", response_model=AppointmentBookingResponse)
async def book_appointment(payload: AppointmentBookingRequest) -> AppointmentBookingResponse:
    db = await get_database()
    repo = BaseRepository(db)

    # Step 1: Identify the patient by email OR phone
    patient = await repo.find_one("patients", {"$or": [{"email": payload.email}, {"phone": payload.phone}]})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Step 1c: Find most recent active RE_ENGAGED campaign
    # Use repository to emulate a sorted find_one
    campaigns = await repo.find_many(
        "campaigns",
        {"patient_id": patient["_id"], "status": CampaignStatus.RE_ENGAGED.value},
        sort=[("updated_at", -1)],
        limit=1,
    )
    campaign = campaigns[0] if campaigns else None
    if not campaign:
        raise HTTPException(status_code=404, detail="Active re-engaged campaign not found")

    # Step 2: Create the appointment document
    appointment_doc = Appointment(
        patient_id=patient["_id"],
        campaign_id=campaign["_id"],
        appointment_date=payload.appointment_date,
        duration_minutes=payload.duration_minutes or 45,
        status=AppointmentStatus.booked,
        service_name=payload.service_name,
        notes=None,
        created_from=CreatedFrom.AI_AGENT_FORM,
    ).model_dump(by_alias=True)

    inserted_id = await repo.insert_one("appointments", appointment_doc)

    # Step 3: Update campaign status to BOOKING_INITIATED
    await repo.update_one("campaigns", {"_id": campaign["_id"]}, {"$set": {"status": CampaignStatus.BOOKING_INITIATED.value}})

    return AppointmentBookingResponse(message="Appointment booked successfully.", appointment_id=str(inserted_id))


