'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api'

interface CampaignDetailsProps {
  selectedCampaignId: string | null
}

export function CampaignDetails({ selectedCampaignId }: CampaignDetailsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'campaign-details', selectedCampaignId],
    enabled: !!selectedCampaignId,
    queryFn: async () => {
      const res = await api.get(`/api/v1/admin/campaigns/${selectedCampaignId}`)
      return res.data as {
        campaign_details: {
          campaign_id: string
          patient_name: string
          status: string
          engagement_summary?: string
        }
        conversation_history: { direction: string; content: string; timestamp?: string }[]
      }
    },
  })
  const selectedCampaign = data?.campaign_details
  const chatHistory = data?.conversation_history ?? []

  if (!selectedCampaign) {
    return (
      <Card className="h-fit">
        <CardContent className="py-12 text-center text-gray-500">
          {isLoading ? 'Loading...' : 'Select a campaign to view details'}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{selectedCampaign.patientName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">AI Summary</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {selectedCampaign.engagement_summary ?? 'No summary'}
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Chat History</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {chatHistory.map((message, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg ${
                  message.direction === 'outgoing'
                    ? 'bg-blue-50 border-l-4 border-blue-400'
                    : 'bg-gray-50 border-l-4 border-gray-400'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm">
                    {message.direction === 'outgoing' ? 'AI' : 'Patient'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{message.content}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
