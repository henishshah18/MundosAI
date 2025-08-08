'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { EnhancedAppointmentDialog } from './enhanced-appointment-dialog'
import { Plus, Calendar } from 'lucide-react'

export function SchedulingHeader() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Appointments
        </h1>
        <p className="text-gray-600 mt-1">Manage your patient appointments and schedules</p>
      </div>
      <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Book New Appointment
      </Button>
      <EnhancedAppointmentDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  )
}
