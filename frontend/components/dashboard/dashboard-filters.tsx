'use client'

import { useDispatch, useSelector } from 'react-redux'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { setDateFilter } from '@/lib/slices/dashboardSlice'
import { RootState } from '@/lib/store'

export function DashboardFilters() {
  const dispatch = useDispatch()
  const dateFilter = useSelector((state: RootState) => state.dashboard.dateFilter)

  return (
    <div className="mb-6">
      <Select value={dateFilter} onValueChange={(value) => dispatch(setDateFilter(value))}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filter by Date" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="This Month">This Month</SelectItem>
          <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
          <SelectItem value="Last 6 Months">Last 6 Months</SelectItem>
          <SelectItem value="This Year">This Year</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
