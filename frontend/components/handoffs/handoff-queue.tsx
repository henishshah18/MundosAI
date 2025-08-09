'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

interface HandoffQueueProps {
  selectedCampaignId: string | null
  onSelectCampaign: (id: string) => void
}

interface CampaignListItem {
  campaign_id: string
  patient_name: string
  campaign_type: string
  status: string
  last_updated?: string
}

export function HandoffQueue({ selectedCampaignId, onSelectCampaign }: HandoffQueueProps) {
  const { data } = useQuery({
    queryKey: ['admin', 'campaigns'],
    queryFn: async () => {
      const res = await api.get('/api/v1/admin/campaigns', { params: { status: 'HANDOFF_REQUIRED' } })
      return res.data as { campaigns: CampaignListItem[] }
    },
  })
  const campaigns = data?.campaigns ?? []

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Handoff Queue</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {campaigns.map((campaign) => (
            <div
              key={campaign.campaign_id}
              className={`p-4 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                selectedCampaignId === campaign.campaign_id ? 'bg-teal-50' : ''
              }`}
              onClick={() => onSelectCampaign(campaign.campaign_id)}
            >
              <div className="space-y-2">
                <h3 className="font-semibold">{campaign.patient_name}</h3>
                <Badge variant="secondary" className="text-xs">
                  {campaign.campaign_type}
                </Badge>
                <p className="text-xs text-gray-500">{campaign.last_updated ?? ''}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
