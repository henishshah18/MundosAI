from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, HTTPException, Query

from app.db.database import get_database
from app.models.appointment import Appointment, AppointmentStatus, CreatedFrom
from app.models.campaign import CampaignStatus
from app.schemas.public import AppointmentBookingRequest, AppointmentBookingResponse


router = APIRouter(tags=["public"])


@router.get("/availability")
async def get_availability(month: int = Query(..., ge=1, le=12), year: int = Query(..., ge=2000), service_id: str | None = None) -> dict[str, list[str]]:
    # Placeholder until provider schedules are defined
    return {}


@router.post("/appointments/book", response_model=AppointmentBookingResponse)
async def book_appointment(payload: AppointmentBookingRequest) -> AppointmentBookingResponse:
    db = await get_database()

    # Step 1: Identify the patient by email OR phone
    patient = await db["patients"].find_one({"$or": [{"email": payload.email}, {"phone": payload.phone}]})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Step 1c: Find most recent active RE_ENGAGED campaign
    campaign = await db["campaigns"].find_one({"patient_id": patient["_id"], "status": CampaignStatus.RE_ENGAGED.value}, sort=[("updated_at", -1)])
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

    result = await db["appointment"].insert_one(appointment_doc)

    # Step 3: Update campaign status to BOOKING_INITIATED
    await db["campaigns"].update_one({"_id": campaign["_id"]}, {"$set": {"status": CampaignStatus.BOOKING_INITIATED.value}})

    return AppointmentBookingResponse(message="Appointment booked successfully.", appointment_id=str(result.inserted_id))


