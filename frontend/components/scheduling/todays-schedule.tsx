'use client'

import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Trash2, Phone, Mail, Clock, User, MoreHorizontal, CalendarCheck } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { RootState } from '@/lib/store'
import { toggleAppointmentComplete, deleteAppointment } from '@/lib/slices/appointmentSlice'
import { toast } from 'sonner'
import { ConfirmationDialog } from './confirmation-dialog'
import { FollowUpDialog } from './follow-up-dialog'

export function TodaysSchedule() {
  const dispatch = useDispatch()
  const appointments = useSelector((state: RootState) => state.appointments.appointments)
  const today = new Date().toISOString().split('T')[0]
  const todaysAppointments = appointments.filter(apt => apt.date === today)

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [appointmentToDelete, setAppointmentToDelete] = useState<{ id: string; patientName: string } | null>(null)

  const [isFollowUpDialogOpen, setIsFollowUpDialogOpen] = useState(false)
  const [appointmentForFollowUp, setAppointmentForFollowUp] = useState<{ id: string; patientName: string; completed: boolean } | null>(null)

  const handleToggleCompleteClick = (id: string, patientName: string, completed: boolean) => {
    setAppointmentForFollowUp({ id, patientName, completed })
    setIsFollowUpDialogOpen(true)
  }

  const handleFollowUpDecision = (requiresFollowUp: boolean, followUpDate?: Date) => {
    if (appointmentForFollowUp) {
      const payload: { id: string; followUpDate?: string | null } = { id: appointmentForFollowUp.id };

      if (!appointmentForFollowUp.completed && requiresFollowUp && followUpDate) {
        payload.followUpDate = followUpDate.toISOString().split('T')[0];
      } else if (appointmentForFollowUp.completed) {
        payload.followUpDate = null; // Clear follow-up date if reopening
      }

      dispatch(toggleAppointmentComplete(payload));
      
      if (appointmentForFollowUp.completed) { // If reopening
        toast.success('Appointment reopened!', {
          description: `${appointmentForFollowUp.patientName}'s appointment status updated.`,
          duration: 3000,
        })
      } else { // If marking as completed
        if (requiresFollowUp && followUpDate) {
          toast.success('Appointment completed and follow-up scheduled!', {
            description: `${appointmentForFollowUp.patientName}'s appointment marked complete. Follow-up set for ${followUpDate.toLocaleDateString()}.`,
            duration: 5000,
          })
        } else {
          toast.success('Appointment completed!', {
            description: `${appointmentForFollowUp.patientName}'s appointment status updated.`,
            duration: 3000,
          })
        }
      }
      setAppointmentForFollowUp(null)
      setIsFollowUpDialogOpen(false)
    }
  }

  const handleDeleteClick = (id: string, patientName: string) => {
    setAppointmentToDelete({ id, patientName })
    setIsDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (appointmentToDelete) {
      dispatch(deleteAppointment(appointmentToDelete.id))
      toast.success(`${appointmentToDelete.patientName}'s appointment has been deleted.`, {
        duration: 3000,
      })
      setAppointmentToDelete(null)
      setIsDeleteConfirmOpen(false)
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getServiceColor = (service: string) => {
    const colors: Record<string, string> = {
      'General Checkup': 'bg-blue-100 text-blue-800',
      'Dental Cleaning': 'bg-green-100 text-green-800',
      'Physical Therapy': 'bg-purple-100 text-purple-800',
      'Consultation': 'bg-orange-100 text-orange-800',
      'Follow-up': 'bg-gray-100 text-gray-800',
      'Vaccination': 'bg-red-100 text-red-800',
      'Blood Test': 'bg-yellow-100 text-yellow-800',
    }
    return colors[service] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Today's Schedule</h2>
      {todaysAppointments.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            <img src="/simple-monthly-calendar.png" alt="Calendar icon" className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            No appointments scheduled for today
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {todaysAppointments.map((appointment) => (
            <Card key={appointment.id} className={`hover:shadow-md transition-all duration-200 ${
              appointment.completed ? 'opacity-75 bg-gray-50' : 'bg-white'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(appointment.patientName)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`font-semibold text-lg ${
                          appointment.completed ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}>
                          {appointment.patientName}
                        </h3>
                        <Badge className={getServiceColor(appointment.serviceName)}>
                          {appointment.serviceName}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span><strong>Time:</strong> {appointment.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span><strong>Doctor:</strong> {appointment.doctor}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span className="truncate">{appointment.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{appointment.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild disabled={appointment.completed}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => handleToggleCompleteClick(appointment.id, appointment.patientName, appointment.completed)}
                        disabled={appointment.completed}
                      >
                        <CalendarCheck className="mr-2 h-4 w-4" />
                        {appointment.completed ? 'Reopen' : 'Mark Completed'}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick(appointment.id, appointment.patientName)}
                        className="text-red-600 focus:text-red-600"
                        disabled={appointment.completed}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {appointmentToDelete && (
        <ConfirmationDialog
          open={isDeleteConfirmOpen}
          onOpenChange={setIsDeleteConfirmOpen}
          onConfirm={confirmDelete}
          title="Confirm Deletion"
          description={`Are you sure you want to delete the appointment for ${appointmentToDelete.patientName}? This action cannot be undone.`}
          confirmButtonText="Delete"
          confirmButtonVariant="destructive"
        />
      )}

      {appointmentForFollowUp && (
        <FollowUpDialog
          open={isFollowUpDialogOpen}
          onOpenChange={setIsFollowUpDialogOpen}
          onConfirm={handleFollowUpDecision}
          appointmentName={appointmentForFollowUp.patientName}
          isCompleted={appointmentForFollowUp.completed}
        />
      )}
    </div>
  )
}
