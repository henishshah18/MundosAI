import { SchedulingHeader } from '@/components/scheduling/scheduling-header'
import { TodaysSchedule } from '@/components/scheduling/todays-schedule'

export default function SchedulingPage() {
  return (
    <div className="space-y-8">
      <SchedulingHeader />
      <TodaysSchedule />
    </div>
  )
}
