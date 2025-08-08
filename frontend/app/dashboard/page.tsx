import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardFilters } from '@/components/dashboard/dashboard-filters'
import { MetricsGrid } from '@/components/dashboard/metrics-grid'
import { ChartsSection } from '@/components/dashboard/charts-section'
import { ActivityTables } from '@/components/dashboard/activity-tables'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader />
      <DashboardFilters />
      <MetricsGrid />
      <ChartsSection />
      <ActivityTables />
    </div>
  )
}
