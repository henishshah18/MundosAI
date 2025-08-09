from __future__ import annotations

from datetime import datetime, timezone
from math import ceil
from typing import Any, Dict, List

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query

from backend.db.database import get_database
from backend.repositories.base import BaseRepository
from backend.models.campaign import CampaignType, CampaignStatus
from backend.models.patient import PatientType, ChannelType
from backend.models.appointment import AppointmentStatus, CreatedFrom
from backend.schemas.admin import (
    RecoveryCampaignCreate,
    CampaignRespondRequest,
    AdminAppointmentCreate,
    CompleteAppointmentRequest,
)
from backend.services.security import get_current_user


router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(get_current_user)])


@router.get("/dashboard-stats")
async def dashboard_stats() -> Dict[str, Any]:
    db = await get_database()
    repo = BaseRepository(db)

    # KPIs
    now = datetime.now(timezone.utc)
    start_month = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
    next_month = datetime(now.year + (now.month // 12), ((now.month % 12) + 1), 1, tzinfo=timezone.utc)

    booked_month = 0
    for appt in await repo.find_many("appointments", {}):
        ts = appt.get("appointment_date")
        if isinstance(ts, str):
            try:
                ts = datetime.fromisoformat(ts)
            except Exception:
                ts = None
        if ts and start_month <= ts.replace(tzinfo=timezone.utc) < next_month:
            if appt.get("status") == "booked":
                booked_month += 1

    handoffs = await repo.count_many("campaigns", {"status": CampaignStatus.HANDOFF_REQUIRED.value})
    active_recovery = await repo.count_many(
        "campaigns",
        {
            "campaign_type": CampaignType.RECOVERY.value,
            "status": {"$in": [CampaignStatus.ATTEMPTING_RECOVERY.value, CampaignStatus.RE_ENGAGED.value]},
        },
    )

    total_recovery = await repo.count_many("campaigns", {"campaign_type": CampaignType.RECOVERY.value})
    recovered = await repo.count_many("campaigns", {"status": CampaignStatus.RECOVERED.value})
    recovery_rate = (recovered / total_recovery * 100.0) if total_recovery else 0.0

    total_recall = await repo.count_many("campaigns", {"campaign_type": CampaignType.RECALL.value})
    recall_recovered = await repo.count_many(
        "campaigns",
        {
            "campaign_type": CampaignType.RECALL.value,
            "status": CampaignStatus.RECOVERED.value,
        },
    )
    recall_rate = (recall_recovered / total_recall * 100.0) if total_recall else 0.0

    return {
        "kpis": {
            "appointments_booked_month": booked_month,
            "handoffs_requiring_action": handoffs,
            "active_recovery_campaigns": active_recovery,
        },
        "conversion_rates": {
            "recovery_rate_percent": round(recovery_rate, 1),
            "recall_rate_percent": round(recall_rate, 1),
        },
    }


@router.get("/campaigns")
async def list_campaigns(
    status: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
) -> Dict[str, Any]:
    db = await get_database()
    repo = BaseRepository(db)
    query: Dict[str, Any] = {}
    if status:
        query["status"] = status

    items: List[Dict[str, Any]] = await repo.find_many("campaigns", query, sort=[("updated_at", -1)])
    total = len(items)
    start = (page - 1) * limit
    end = start + limit
    page_items = items[start:end]

    results: List[Dict[str, Any]] = []
    for c in page_items:
        patient = await repo.find_one("patients", {"_id": c.get("patient_id")})
        results.append(
            {
                "campaign_id": str(c.get("_id")),
                "patient_name": (patient or {}).get("name", "Unknown"),
                "campaign_type": c.get("campaign_type"),
                "status": c.get("status"),
                "last_updated": c.get("updated_at"),
            }
        )

    return {
        "pagination": {
            "total_items": total,
            "total_pages": ceil(total / limit) if limit else 1,
            "current_page": page,
        },
        "campaigns": results,
    }


@router.get("/campaigns/{campaign_id}")
async def campaign_details(campaign_id: str) -> Dict[str, Any]:
    db = await get_database()
    repo = BaseRepository(db)
    try:
        oid = ObjectId(campaign_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid campaign_id")

    campaign = await repo.find_one("campaigns", {"_id": oid})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    messages = await repo.find_many("interactions", {"campaign_id": oid})
    history = [
        {
            "direction": m.get("direction"),
            "content": m.get("content"),
            "timestamp": m.get("timestamp"),
        }
        for m in messages
    ]

    patient = await repo.find_one("patients", {"_id": campaign.get("patient_id")})
    details = {
        "campaign_id": str(campaign.get("_id")),
        "patient_name": (patient or {}).get("name", "Unknown"),
        "status": campaign.get("status"),
        "engagement_summary": campaign.get("engagement_summary"),
    }
    return {"campaign_details": details, "conversation_history": history}


@router.get("/appointments")
async def list_appointments(
    start_date: str | None = None,
    end_date: str | None = None,
    provider_id: str | None = None,  # Placeholder: provider not modeled yet
) -> Dict[str, Any]:
    db = await get_database()
    repo = BaseRepository(db)
    start_dt = datetime.fromisoformat(start_date) if start_date else None
    end_dt = datetime.fromisoformat(end_date) if end_date else None

    results: List[Dict[str, Any]] = []
    for appt in await repo.find_many("appointments", {}):
        ts = appt.get("appointment_date")
        if isinstance(ts, str):
            try:
                ts = datetime.fromisoformat(ts)
            except Exception:
                ts = None
        if start_dt and (not ts or ts < start_dt):
            continue
        if end_dt and (not ts or ts > end_dt):
            continue

        patient = await repo.find_one("patients", {"_id": appt.get("patient_id")})
        results.append(
            {
                "appointment_id": str(appt.get("_id", "")),
                "patient_name": (patient or {}).get("name", "Unknown"),
                "appointment_date": appt.get("appointment_date"),
                "service_name": appt.get("service_name"),
                "status": appt.get("status"),
            }
        )

    return {"appointments": results}


# Milestone 6: Write operations


@router.post("/campaigns/recovery")
async def create_recovery_campaign(payload: RecoveryCampaignCreate) -> Dict[str, str]:
    db = await get_database()
    repo = BaseRepository(db)
    # Create patient
    patient_doc = {
        "name": payload.patient_name,
        "email": str(payload.patient_email),
        "phone": "",
        "patient_type": PatientType.COLD_LEAD.value,
        "preferred_channel": [ChannelType.email.value],
    }
    presult_id = await repo.insert_one("patients", patient_doc)

    # Create campaign
    campaign_doc = {
        "patient_id": presult_id,
        "campaign_type": CampaignType.RECOVERY.value,
        "status": CampaignStatus.ATTEMPTING_RECOVERY.value,
        "engagement_summary": payload.initial_inquiry,
    }
    cresult_id = await repo.insert_one("campaigns", campaign_doc)
    return {"message": "Recovery campaign created successfully.", "campaign_id": str(cresult_id)}


@router.post("/campaigns/{campaign_id}/respond")
async def respond_to_campaign(campaign_id: str, payload: CampaignRespondRequest) -> Dict[str, str]:
    db = await get_database()
    repo = BaseRepository(db)
    try:
        oid = ObjectId(campaign_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid campaign_id")

    # Create outgoing interaction
    interaction = {
        "campaign_id": oid,
        "direction": "outgoing",
        "content": payload.message,
    }
    await repo.insert_one("interactions", interaction)

    # Update campaign status
    await repo.update_one("campaigns", {"_id": oid}, {"$set": {"status": payload.new_status}})
    return {"message": "Response sent successfully."}


@router.post("/appointments")
async def create_admin_appointment(payload: AdminAppointmentCreate) -> Dict[str, Any]:
    db = await get_database()
    repo = BaseRepository(db)
    patient = await repo.find_one("patients", {"email": str(payload.email)})
    if not patient:
        # create patient
        patient_doc = {
            "name": payload.name,
            "email": str(payload.email),
            "phone": "",
            "patient_type": PatientType.EXISTING.value,
            "preferred_channel": [payload.preferred_channel or "email"],
        }
        patient_id = await repo.insert_one("patients", patient_doc)
    else:
        patient_id = patient["_id"]

    appt_doc = {
        "patient_id": patient_id,
        "campaign_id": None,
        "appointment_date": payload.appointment_date,
        "duration_minutes": payload.duration_minutes,
        "status": AppointmentStatus.booked.value,
        "service_name": payload.service_name,
        "notes": payload.notes,
        "created_from": CreatedFrom.MANUAL_ADMIN.value,
    }
    appt_id = await repo.insert_one("appointments", appt_doc)
    appt_doc["_id"] = appt_id
    return appt_doc


@router.post("/appointments/{appointment_id}/complete")
async def complete_appointment(appointment_id: str, payload: CompleteAppointmentRequest) -> Dict[str, str]:
    db = await get_database()
    repo = BaseRepository(db)
    # Accept both ObjectId and string ids for tests/fakes
    oid = None
    try:
        oid = ObjectId(appointment_id)
    except Exception:
        oid = None

    appointment = None
    if oid is not None:
        appointment = await repo.find_one("appointments", {"_id": oid})
    if appointment is None:
        appointment = await repo.find_one("appointments", {"_id": appointment_id})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Step 1: update appointment status
    if oid is not None:
        await repo.update_one("appointments", {"_id": oid}, {"$set": {"status": AppointmentStatus.completed.value}})
    else:
        await repo.update_one("appointments", {"_id": appointment_id}, {"$set": {"status": AppointmentStatus.completed.value}})

    # Step 2: update campaign status to RECOVERED if campaign_id exists
    campaign_id = appointment.get("campaign_id")
    if campaign_id:
        await repo.update_one("campaigns", {"_id": campaign_id}, {"$set": {"status": CampaignStatus.RECOVERED.value}})

    # Step 3: handle future recall
    if payload.next_follow_up_date is not None:
        patient_id = appointment.get("patient_id")
        await repo.update_one("patients", {"_id": patient_id}, {"$set": {"next_follow_up_date": payload.next_follow_up_date}})

    return {"message": "Appointment completed."}


@router.delete("/appointments/{appointment_id}")
async def delete_appointment(appointment_id: str) -> Dict[str, str]:
    db = await get_database()
    repo = BaseRepository(db)
    # Accept either ObjectId hex or raw string ids for robustness
    query: Dict[str, Any]
    try:
        query = {"_id": ObjectId(appointment_id)}
    except Exception:
        query = {"_id": appointment_id}

    await repo.delete_one("appointments", query)
    return {"message": "Appointment deleted."}



