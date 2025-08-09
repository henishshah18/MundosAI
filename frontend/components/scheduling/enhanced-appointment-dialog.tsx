'use client'

import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { SlotBookingCalendar } from './slot-booking-calendar'
import { toast } from 'sonner'
import { Calendar, User, Mail, Phone, Stethoscope, UserIcon } from 'lucide-react' // Renamed User to UserIcon to avoid conflict
import api from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'

interface TimeSlot {
  time: string
  available: boolean
  doctor: string
}

interface EnhancedAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EnhancedAppointmentDialog({ open, onOpenChange }: EnhancedAppointmentDialogProps) {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [formData, setFormData] = useState({
    patientName: '',
    email: '',
    phone: '',
    serviceName: '',
    doctor: '', // Added doctor to form data
    notes: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Patient name is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }
    if (!formData.serviceName) {
      newErrors.serviceName = 'Please select a service'
    }
    if (!formData.doctor) { // Validate doctor selection
      newErrors.doctor = 'Please select a doctor'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    if (!selectedDate) {
      toast.error('Please select a date')
      return false
    }
    if (!selectedSlot) {
      toast.error('Please select a time slot')
      return false
    }
    return true
  }

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    }
  }

  const handleBack = () => {
    setCurrentStep(1)
  }

  const handleSubmit = async () => {
    if (!validateStep2()) return

    try {
      // Compose ISO datetime from selectedDate and selectedSlot.time (HH:mm)
      const [h, m] = selectedSlot!.time.split(':').map(Number)
      const apptDate = new Date(selectedDate!)
      apptDate.setHours(h, m, 0, 0)

      await api.post('/api/v1/admin/appointments', {
        appointment_date: apptDate.toISOString(),
        duration_minutes: 45,
        name: formData.patientName,
        email: formData.email,
        preferred_channel: 'email',
        service_name: formData.serviceName,
        notes: formData.notes || undefined,
      })

      await queryClient.invalidateQueries({ queryKey: ['admin', 'appointments'] })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'appointments', 'today'] })

      toast.success('Appointment booked successfully!', {
        description: `${formData.patientName}'s appointment is scheduled for ${selectedDate!.toLocaleDateString()} at ${selectedSlot!.time} with ${formData.doctor}`,
        duration: 5000,
      })

      // Reset form
      setFormData({
        patientName: '',
        email: '',
        phone: '',
        serviceName: '',
        doctor: '',
        notes: ''
      })
      setSelectedDate(undefined)
      setSelectedSlot(null)
      setCurrentStep(1)
      setErrors({})
      onOpenChange(false)
    } catch (e) {
      toast.error('Failed to create appointment', { description: 'Please try again.' })
    }
  }

  const handleClose = () => {
    setFormData({
      patientName: '',
      email: '',
      phone: '',
      serviceName: '',
      doctor: '',
      notes: ''
    })
    setSelectedDate(undefined)
    setSelectedSlot(null)
    setCurrentStep(1)
    setErrors({})
    onOpenChange(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Book New Appointment
          </DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
              currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`flex-1 h-1 rounded ${
              currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'
            }`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
              currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </DialogHeader>

        {currentStep === 1 && (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Patient Information</h3>
              <p className="text-sm text-gray-600">Enter the patient's details and service requirements</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientName" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Patient Name
                </Label>
                <Input
                  id="patientName"
                  placeholder="Enter patient's full name"
                  value={formData.patientName}
                  onChange={(e) => handleInputChange('patientName', e.target.value)}
                  className={errors.patientName ? 'border-red-500' : ''}
                />
                {errors.patientName && (
                  <p className="text-sm text-red-600">{errors.patientName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="patient@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceName" className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Service Type
                </Label>
                <Select value={formData.serviceName} onValueChange={(value) => handleInputChange('serviceName', value)}>
                  <SelectTrigger className={errors.serviceName ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General Checkup">General Checkup</SelectItem>
                    <SelectItem value="Dental Cleaning">Dental Cleaning</SelectItem>
                    <SelectItem value="Physical Therapy">Physical Therapy</SelectItem>
                    <SelectItem value="Consultation">Consultation</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Vaccination">Vaccination</SelectItem>
                    <SelectItem value="Blood Test">Blood Test</SelectItem>
                  </SelectContent>
                </Select>
                {errors.serviceName && (
                  <p className="text-sm text-red-600">{errors.serviceName}</p>
                )}
              </div>

              {/* New Consulting Doctor Field */}
              <div className="space-y-2">
                <Label htmlFor="doctor" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Consulting Doctor
                </Label>
                <Select value={formData.doctor} onValueChange={(value) => handleInputChange('doctor', value)}>
                  <SelectTrigger className={errors.doctor ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr. Johnson">Dr. Johnson</SelectItem>
                    <SelectItem value="Dr. Davis">Dr. Davis</SelectItem>
                    <SelectItem value="Dr. Martinez">Dr. Martinez</SelectItem>
                    <SelectItem value="Dr. Wilson">Dr. Wilson</SelectItem>
                  </SelectContent>
                </Select>
                {errors.doctor && (
                  <p className="text-sm text-red-600">{errors.doctor}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Any special requirements or notes..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Select Date & Time</h3>
              <p className="text-sm text-gray-600">Choose your preferred appointment slot</p>
            </div>

            <SlotBookingCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              selectedSlot={selectedSlot}
              onSlotSelect={setSelectedSlot}
              selectedDoctor={formData.doctor} // Pass the selected doctor for filtering
            />

            {selectedDate && selectedSlot && (
              <>
                <Separator />
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Appointment Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Patient:</strong> {formData.patientName}</p>
                      <p><strong>Service:</strong> {formData.serviceName}</p>
                      <p><strong>Email:</strong> {formData.email}</p>
                    </div>
                    <div>
                      <p><strong>Date:</strong> {selectedDate.toLocaleDateString()}</p>
                      <p><strong>Time:</strong> {selectedSlot.time}</p>
                      <p><strong>Doctor:</strong> {formData.doctor}</p> {/* Display doctor from form data */}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter>
          <div className="flex justify-between w-full">
            <div>
              {currentStep === 2 && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              {currentStep === 1 ? (
                <Button onClick={handleNext}>
                  Next: Select Date & Time
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!selectedDate || !selectedSlot}>
                  Book Appointment
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
