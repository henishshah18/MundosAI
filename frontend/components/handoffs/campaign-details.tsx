'use client'

import { useSelector } from 'react-redux'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RootState } from '@/lib/store'

export function CampaignDetails() {
  const { campaigns, selectedCampaignId } = useSelector((state: RootState) => state.handoffs)
  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId)

  if (!selectedCampaign) {
    return (
      <Card className="h-fit">
        <CardContent className="py-12 text-center text-gray-500">
          Select a campaign to view details
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
          <h3 className="font-semibold mb-2">Patient Contact</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Phone:</strong> {selectedCampaign.phone}</p>
            <p><strong>Email:</strong> {selectedCampaign.email}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Source/Channel</h3>
          <p className="text-sm text-gray-600">{selectedCampaign.source}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">AI Summary</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {selectedCampaign.aiSummary}
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Chat History</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {selectedCampaign.chatHistory.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.sender === 'AI'
                    ? 'bg-blue-50 border-l-4 border-blue-400'
                    : 'bg-gray-50 border-l-4 border-gray-400'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm">
                    {message.sender}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{message.message}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
