'use client'

import { useDispatch, useSelector } from 'react-redux'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Trash2, Phone, Mail, Clock, User, Calendar } from 'lucide-react'
import { RootState } from '@/lib/store'
import { toggleAppointmentComplete, deleteAppointment } from '@/lib/slices/appointmentSlice'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'

export default function AllAppointments() {
const dispatch = useDispatch()
const queryClient = useQueryClient()
const { data } = useQuery({
  queryKey: ['admin', 'appointments'],
  queryFn: async () => {
    const res = await api.get('/api/v1/admin/appointments')
    return res.data as { appointments: { appointment_id: string; patient_name: string; appointment_date: string; service_name: string; status: string }[] }
  },
})
const appointments = (data?.appointments ?? []).map((a) => ({
  id: a.appointment_id,
  patientName: a.patient_name,
  email: '',
  phone: '',
  serviceName: a.service_name,
  date: a.appointment_date?.split('T')[0] ?? '',
  time: a.appointment_date ? new Date(a.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
  doctor: '',
  completed: a.status === 'completed',
}))

const handleToggleComplete = (id: string) => {
  const appointment = appointments.find(apt => apt.id === id)
  if (appointment) {
    const run = async () => {
      await api.post(`/api/v1/admin/appointments/${id}/complete`, { next_follow_up_date: null })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'appointments'] })
    }
    run().catch(() => {})
    toast.success(
      appointment.completed ? 'Appointment reopened' : 'Appointment completed!',
      {
        description: `${appointment.patientName}'s appointment status updated.`,
        duration: 3000,
      }
    )
  }
}

const handleDelete = (id: string) => {
  const appointment = appointments.find(apt => apt.id === id)
  if (appointment) {
    toast.promise(
      (async () => {
        await api.delete(`/api/v1/admin/appointments/${id}`)
        await queryClient.invalidateQueries({ queryKey: ['admin', 'appointments'] })
        return appointment
      })(),
      {
        loading: 'Deleting appointment...',
        success: (data: any) => `${data.patientName}'s appointment has been deleted`,
        error: 'Failed to delete appointment',
      }
    )
  }
}

const handleReschedule = (id: string) => {
const appointment = appointments.find(apt => apt.id === id)
if (appointment) {
  toast.info('Reschedule feature coming soon!', {
    description: `Will reschedule ${appointment.patientName}'s appointment`,
  })
}
}

const handleContact = (appointment: any, method: 'phone' | 'email') => {
if (method === 'phone') {
  toast.success('Calling patient...', {
    description: `Dialing ${appointment.phone}`,
    duration: 2000,
  })
} else {
  toast.success('Opening email client...', {
    description: `Composing email to ${appointment.email}`,
    duration: 2000,
  })
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
<div>
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-semibold">All Appointments</h2>
    <Badge variant="secondary" className="text-sm">
      {appointments.length} total appointments
    </Badge>
  </div>
  
  <div className="space-y-4">
    {appointments.length === 0 ? (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No appointments yet</h3>
          <p className="text-gray-500">Book your first appointment to get started</p>
        </CardContent>
      </Card>
    ) : (
      appointments.map((appointment) => (
        <Card key={appointment.id} className={`hover:shadow-md transition-all duration-200 ${
          appointment.completed ? 'opacity-75 bg-gray-50' : 'bg-white'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <Checkbox
                  checked={appointment.completed}
                  onCheckedChange={() => handleToggleComplete(appointment.id)}
                  className="mt-1"
                />
                
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
                    {appointment.completed && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Completed
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span><strong>Date & Time:</strong> {appointment.date} at {appointment.time}</span>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleContact(appointment, 'email')}
                        >
                          <Mail className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{appointment.phone}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleContact(appointment, 'phone')}
                        >
                          <Phone className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleDelete(appointment.id)}
                title="Delete appointment"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))
    )}
  </div>
</div>
)
}
