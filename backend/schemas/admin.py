from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class RecoveryCampaignCreate(BaseModel):
    patient_name: str
    patient_email: EmailStr
    initial_inquiry: Optional[str] = None
    estimated_value: Optional[float] = None


class CampaignRespondRequest(BaseModel):
    message: str
    new_status: str


class AdminAppointmentCreate(BaseModel):
    appointment_date: datetime
    duration_minutes: int
    name: str
    email: EmailStr
    preferred_channel: Optional[str] = None
    service_name: str
    notes: Optional[str] = None


class CompleteAppointmentRequest(BaseModel):
    next_follow_up_date: Optional[datetime] = None


