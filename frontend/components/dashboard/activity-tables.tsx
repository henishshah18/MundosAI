import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MoreHorizontal, Phone, Mail, MessageSquare } from 'lucide-react'

const recentActivity = [
  {
    id: '1',
    patientName: 'Sarah Johnson',
    campaignType: 'Recovery',
    status: 'attempting_recovery',
    lastUpdated: '2 hours ago',
    method: 'SMS'
  },
  {
    id: '2',
    patientName: 'Michael Chen',
    campaignType: 'Recall',
    status: 'handoff_required',
    lastUpdated: '4 hours ago',
    method: 'Phone'
  },
  {
    id: '3',
    patientName: 'Emily Rodriguez',
    campaignType: 'Recovery',
    status: 'recovered',
    lastUpdated: '6 hours ago',
    method: 'Email'
  },
  {
    id: '4',
    patientName: 'David Wilson',
    campaignType: 'Recall',
    status: 'recovery_declined',
    lastUpdated: '8 hours ago',
    method: 'Phone'
  },
  {
    id: '5',
    patientName: 'Lisa Thompson',
    campaignType: 'Recovery',
    status: 're_engaged',
    lastUpdated: '1 day ago',
    method: 'SMS'
  },
  {
    id: '6',
    patientName: 'Robert Martinez',
    campaignType: 'Recall',
    status: 'booking_initiated',
    lastUpdated: '1 day ago',
    method: 'Email'
  },
  {
    id: '7',
    patientName: 'Jennifer Davis',
    campaignType: 'Recovery',
    status: 'recovery_failed',
    lastUpdated: '2 days ago',
    method: 'Phone'
  }
]

function getCampaignStatusColor(status: string) {
  switch (status) {
    case 'recovered':
      return 'bg-green-100 text-green-800 border-green-200'
    case 're_engaged':
    case 'booking_initiated':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'handoff_required':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'recovery_declined':
    case 'recovery_failed':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'attempting_recovery':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

function getCampaignStatusLabel(status: string) {
  switch (status) {
    case 'attempting_recovery':
      return 'Attempting Recovery'
    case 're_engaged':
      return 'Re-engaged'
    case 'booking_initiated':
      return 'Booking Initiated'
    case 'handoff_required':
      return 'Handoff Required'
    case 'recovered':
      return 'Recovered'
    case 'recovery_failed':
      return 'Recovery Failed'
    case 'recovery_declined':
      return 'Recovery Declined'
    default:
      return status
  }
}

function getMethodIcon(method: string) {
  switch (method) {
    case 'Phone':
      return <Phone className="h-4 w-4" />
    case 'Email':
      return <Mail className="h-4 w-4" />
    case 'SMS':
      return <MessageSquare className="h-4 w-4" />
    default:
      return <MessageSquare className="h-4 w-4" />
  }
}

export function ActivityTables() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-1 gap-6 mb-8">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Recent Campaign Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivity.map((activity) => (
                <TableRow key={activity.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {activity.patientName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{activity.patientName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{activity.campaignType}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCampaignStatusColor(activity.status)}>
                      {getCampaignStatusLabel(activity.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getMethodIcon(activity.method)}
                      <span className="text-sm">{activity.method}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">{activity.lastUpdated}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
