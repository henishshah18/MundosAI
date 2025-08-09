'use client'

import { useSelector } from 'react-redux'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RootState } from '@/lib/store'
import { TrendingUp, TrendingDown, Activity, Phone, Users, AlertTriangle, CheckCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export function MetricsGrid() {
  const fallback = useSelector((state: RootState) => state.dashboard.metrics)
  const { data } = useQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: async () => (await api.get('/api/v1/admin/dashboard-stats')).data as {
      kpis: { appointments_booked_month: number; handoffs_requiring_action: number; active_recovery_campaigns: number }
      conversion_rates: { recovery_rate_percent: number; recall_rate_percent: number }
    },
  })
  const metrics = {
    activeRecoveryCampaigns: data?.kpis.active_recovery_campaigns ?? fallback.activeRecoveryCampaigns,
    activeRecallCampaigns: fallback.activeRecallCampaigns,
    engagedLeads: fallback.engagedLeads,
    humanHandoffQueue: data?.kpis.handoffs_requiring_action ?? fallback.humanHandoffQueue,
    recoveries: fallback.recoveries,
    recoveryRate: data?.conversion_rates.recovery_rate_percent ?? fallback.recoveryRate,
    recallRate: data?.conversion_rates.recall_rate_percent ?? fallback.recallRate,
  }

  const metricCards = [
    {
      title: 'Active Recovery Campaigns',
      value: metrics.activeRecoveryCampaigns,
      description: 'Currently running',
      icon: Activity,
      trend: '+12%',
      trendUp: true,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Recall Campaigns',
      value: metrics.activeRecallCampaigns,
      description: 'Currently running',
      icon: Phone,
      trend: '+8%',
      trendUp: true,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Engaged Leads',
      value: metrics.engagedLeads,
      description: 'This month',
      icon: Users,
      trend: '+23%',
      trendUp: true,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Human Handoff Queue',
      value: metrics.humanHandoffQueue,
      description: 'Requiring attention',
      icon: AlertTriangle,
      trend: '-15%',
      trendUp: false,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      title: 'Recoveries',
      value: metrics.recoveries,
      description: 'This month',
      icon: CheckCircle,
      trend: '+18%',
      trendUp: true,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Recovery Rate',
      value: `${metrics.recoveryRate}%`,
      description: 'This month',
      icon: TrendingUp,
      trend: '+5.1%',
      trendUp: true,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Recall Rate',
      value: `${metrics.recallRate}%`,
      description: 'This month',
      icon: TrendingUp,
      trend: '+3.2%',
      trendUp: true,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
      {metricCards.map((metric, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {metric.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${metric.bgColor}`}>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metric.value}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {metric.description}
              </p>
              <div className={`flex items-center text-xs ${
                metric.trendUp ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.trendUp ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {metric.trend}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
