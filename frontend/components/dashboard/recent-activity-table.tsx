import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const recentActivity = [
  {
    patientName: 'John Smith',
    campaignType: 'Recovery',
    status: 'Engaged',
    lastUpdated: '2 hours ago'
  },
  {
    patientName: 'Sarah Wilson',
    campaignType: 'Recall',
    status: 'Handoff Required',
    lastUpdated: '4 hours ago'
  },
  {
    patientName: 'Mike Brown',
    campaignType: 'Recovery',
    status: 'Completed',
    lastUpdated: '6 hours ago'
  },
  {
    patientName: 'Emily Johnson',
    campaignType: 'Recall',
    status: 'Declined',
    lastUpdated: '8 hours ago'
  },
  {
    patientName: 'Robert Chen',
    campaignType: 'Recovery',
    status: 'Engaged',
    lastUpdated: '1 day ago'
  }
]

function getStatusColor(status: string) {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-800'
    case 'Engaged':
      return 'bg-blue-100 text-blue-800'
    case 'Handoff Required':
      return 'bg-amber-100 text-amber-800'
    case 'Declined':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function RecentActivityTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Campaign Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient Name</TableHead>
              <TableHead>Campaign Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentActivity.map((activity, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{activity.patientName}</TableCell>
                <TableCell>{activity.campaignType}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(activity.status)}>
                    {activity.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-500">{activity.lastUpdated}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
