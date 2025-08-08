import { HandoffQueue } from '@/components/handoffs/handoff-queue'
import { CampaignDetails } from '@/components/handoffs/campaign-details'

export default function HandoffsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <HandoffQueue />
          </div>
          <div className="lg:col-span-2">
            <CampaignDetails />
          </div>
        </div>
      </div>
    </div>
  )
}
