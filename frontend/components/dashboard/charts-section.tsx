'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts'

const recoveryVsRecallData = [
  { month: 'Jul', recovery: 65, recall: 70, target: 75 },
  { month: 'Aug', recovery: 72, recall: 68, target: 75 },
  { month: 'Sep', recovery: 68, recall: 75, target: 75 },
  { month: 'Oct', recovery: 75, recall: 72, target: 75 },
  { month: 'Nov', recovery: 70, recall: 78, target: 75 },
  { month: 'Dec', recovery: 78, recall: 74, target: 75 },
  { month: 'Jan', recovery: 82, recall: 80, target: 75 },
]

const failureAnalysisData = [
  { name: 'No Response', value: 60, color: '#EF4444' }, // Using destructive color
  { name: 'Service Declined', value: 40, color: '#2D8B9B' }, // Using primary color
]

const monthlyTrendData = [
  { month: 'Jul', recoveries: 32, appointments: 28, revenue: 38000 },
  { month: 'Aug', recoveries: 38, appointments: 35, revenue: 42000 },
  { month: 'Sep', recoveries: 35, appointments: 32, revenue: 39000 },
  { month: 'Oct', recoveries: 45, appointments: 41, revenue: 48000 },
  { month: 'Nov', recoveries: 40, appointments: 38, revenue: 44000 },
  { month: 'Dec', recoveries: 42, appointments: 39, revenue: 45000 },
  { month: 'Jan', recoveries: 48, appointments: 44, revenue: 52000 },
]

export function ChartsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Recovery vs. Recall Performance</CardTitle>
          <CardDescription>Monthly conversion rate comparison with targets</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={recoveryVsRecallData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="recovery" fill="#2D8B9B" name="Recovery" radius={[2, 2, 0, 0]} />
              <Bar dataKey="recall" fill="#10B981" name="Recall" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Campaign Failure Analysis</CardTitle>
          <CardDescription>Breakdown of unsuccessful campaign reasons</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={failureAnalysisData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {failureAnalysisData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Monthly Performance Trends</CardTitle>
          <CardDescription>Recoveries and appointments over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="recoveries" stackId="1" stroke="#2D8B9B" fill="#2D8B9B" fillOpacity={0.6} />
              <Area type="monotone" dataKey="appointments" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
