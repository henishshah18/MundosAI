'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, User, CalendarDays } from 'lucide-react'

interface TimeSlot {
  time: string
  available: boolean
  doctor: string
}

interface SlotBookingCalendarProps {
  selectedDate: Date | undefined
  onDateSelect: (date: Date | undefined) => void
  selectedSlot: TimeSlot | null
  onSlotSelect: (slot: TimeSlot | null) => void
  selectedDoctor: string // New prop for filtering slots by doctor
}

const allTimeSlots: TimeSlot[] = [
  { time: '09:00', available: true, doctor: 'Dr. Johnson' },
  { time: '09:30', available: false, doctor: 'Dr. Smith' },
  { time: '10:00', available: true, doctor: 'Dr. Johnson' },
  { time: '10:30', available: true, doctor: 'Dr. Davis' },
  { time: '11:00', available: false, doctor: 'Dr. Martinez' },
  { time: '11:30', available: true, doctor: 'Dr. Wilson' },
  { time: '14:00', available: true, doctor: 'Dr. Johnson' },
  { time: '14:30', available: true, doctor: 'Dr. Smith' },
  { time: '15:00', available: true, doctor: 'Dr. Davis' },
  { time: '15:30', available: false, doctor: 'Dr. Martinez' },
  { time: '16:00', available: true, doctor: 'Dr. Wilson' },
  { time: '16:30', available: true, doctor: 'Dr. Johnson' },
]

export function SlotBookingCalendar({ 
  selectedDate, 
  onDateSelect, 
  selectedSlot, 
  onSlotSelect,
  selectedDoctor // Destructure new prop
}: SlotBookingCalendarProps) {
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null)

  // Filter time slots based on the selected doctor
  const filteredTimeSlots = selectedDoctor
    ? allTimeSlots.filter(slot => slot.doctor === selectedDoctor)
    : allTimeSlots;

  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today || date.getDay() === 0 || date.getDay() === 6 // Disable past dates and weekends
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            disabled={isDateDisabled}
            className="rounded-md border-0 w-full"
          />
        </CardContent>
      </Card>

      {/* Time Slots Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Available Time Slots
            {selectedDate && (
              <Badge variant="secondary" className="ml-auto">
                {filteredTimeSlots.filter(slot => slot.available).length} available
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedDate ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="text-center">
                <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Please select a date first</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {filteredTimeSlots.length === 0 && selectedDoctor ? (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  <div className="text-center">
                    <p className="text-sm">No slots available for {selectedDoctor} on this date.</p>
                  </div>
                </div>
              ) : (
                filteredTimeSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedSlot?.time === slot.time ? "default" : "outline"}
                    className={`w-full justify-start h-auto p-3 ${
                      !slot.available 
                        ? 'opacity-50 cursor-not-allowed' 
                        : selectedSlot?.time === slot.time 
                          ? '' 
                          : hoveredSlot === slot.time 
                            ? 'border-primary/50 bg-primary/5' 
                            : ''
                    }`}
                    disabled={!slot.available}
                    onClick={() => onSlotSelect(slot.available ? slot : null)}
                    onMouseEnter={() => setHoveredSlot(slot.time)}
                    onMouseLeave={() => setHoveredSlot(null)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">{slot.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span className="text-xs text-gray-600">{slot.doctor}</span>
                        {!slot.available && (
                          <Badge variant="destructive" className="text-xs">
                            Booked
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Button>
                ))
              )}
              
              {selectedSlot && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">
                      {selectedSlot.time} with {selectedSlot.doctor}
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Slot selected for {formatDate(selectedDate)}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedDate && (
        <div className="lg:col-span-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm font-medium text-primary">
            Selected: {formatDate(selectedDate)}
          </p>
        </div>
      )}
    </div>
  )
}
