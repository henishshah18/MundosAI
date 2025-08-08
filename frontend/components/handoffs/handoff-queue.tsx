'use client'

import { useDispatch, useSelector } from 'react-redux'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RootState } from '@/lib/store'
import { selectCampaign } from '@/lib/slices/handoffSlice'

export function HandoffQueue() {
  const dispatch = useDispatch()
  const { campaigns, selectedCampaignId } = useSelector((state: RootState) => state.handoffs)

  const handleSelectCampaign = (campaignId: string) => {
    dispatch(selectCampaign(campaignId))
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Handoff Queue</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className={`p-4 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                selectedCampaignId === campaign.id ? 'bg-teal-50' : ''
              }`}
              onClick={() => handleSelectCampaign(campaign.id)}
            >
              <div className="space-y-2">
                <h3 className="font-semibold">{campaign.patientName}</h3>
                <Badge variant="secondary" className="text-xs">
                  {campaign.campaignType}
                </Badge>
                <p className="text-xs text-gray-500">{campaign.handoffTime}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
