'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { CalendarDays } from 'lucide-react'

interface FollowUpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (requiresFollowUp: boolean, followUpDate?: Date) => void
  appointmentName: string
  isCompleted: boolean
}

export function FollowUpDialog({
  open,
  onOpenChange,
  onConfirm,
  appointmentName,
  isCompleted,
}: FollowUpDialogProps) {
  const [requiresFollowUp, setRequiresFollowUp] = useState<boolean | null>(null)
  const [selectedFollowUpDate, setSelectedFollowUpDate] = useState<Date | undefined>(undefined)

  const handleConfirm = () => {
    if (requiresFollowUp === null) {
      // Optionally show a toast or error if no option is selected
      return;
    }
    onConfirm(requiresFollowUp, selectedFollowUpDate);
    // Reset state after confirmation
    setRequiresFollowUp(null);
    setSelectedFollowUpDate(undefined);
  };

  const handleClose = () => {
    setRequiresFollowUp(null);
    setSelectedFollowUpDate(undefined);
    onOpenChange(false);
  };

  const title = isCompleted ? 'Reopen Appointment' : 'Mark Appointment Completed'
  const description = isCompleted
    ? `Are you sure you want to reopen the appointment for ${appointmentName}?`
    : `Marking the appointment for ${appointmentName} as completed. Does the patient require a follow-up?`

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        {!isCompleted && ( // Only show follow-up options if marking as completed
          <div className="grid gap-4 py-4">
            <RadioGroup
              value={requiresFollowUp === true ? 'yes' : requiresFollowUp === false ? 'no' : ''}
              onValueChange={(value) => setRequiresFollowUp(value === 'yes')}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="follow-up-yes" />
                <Label htmlFor="follow-up-yes">Yes, patient requires a follow-up</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="follow-up-no" />
                <Label htmlFor="follow-up-no">No, no follow-up required</Label>
              </div>
            </RadioGroup>

            {requiresFollowUp === true && (
              <div className="space-y-2">
                <Label htmlFor="follow-up-date" className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Select Follow-up Date
                </Label>
                <Calendar
                  mode="single"
                  selected={selectedFollowUpDate}
                  onSelect={setSelectedFollowUpDate}
                  initialFocus
                  className="rounded-md border"
                />
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isCompleted && requiresFollowUp === null} // Disable if not reopening and no follow-up option selected
          >
            {isCompleted ? 'Confirm Reopen' : 'Confirm Completion'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
