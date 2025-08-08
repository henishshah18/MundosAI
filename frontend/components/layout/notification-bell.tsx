'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Bell, Clock, User, Calendar, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

const notifications = [
  {
    id: 1,
    type: 'appointment',
    title: 'Upcoming Appointment',
    message: 'Sarah Johnson has an appointment in 30 minutes',
    time: '5 min ago',
    icon: Calendar,
    unread: true
  },
  {
    id: 2,
    type: 'handoff',
    title: 'Handoff Required',
    message: 'Michael Chen requires human intervention',
    time: '15 min ago',
    icon: AlertTriangle,
    unread: true
  },
  {
    id: 3,
    type: 'campaign',
    title: 'Campaign Update',
    message: 'Recovery campaign completed successfully',
    time: '1 hour ago',
    icon: User,
    unread: false
  }
]

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = notifications.filter(n => n.unread).length

  const handleNotificationClick = (notification: any) => {
    toast.info(notification.title, {
      description: notification.message,
    })
    setIsOpen(false)
  }

  const handleMarkAllRead = () => {
    toast.success('All notifications marked as read')
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-gray-100">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-500">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-xs h-6">
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="p-3 cursor-pointer hover:bg-gray-50"
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start space-x-3 w-full">
                <div className={`p-2 rounded-full ${
                  notification.type === 'appointment' ? 'bg-blue-100' :
                  notification.type === 'handoff' ? 'bg-amber-100' : 'bg-green-100'
                }`}>
                  <notification.icon className={`h-4 w-4 ${
                    notification.type === 'appointment' ? 'text-blue-600' :
                    notification.type === 'handoff' ? 'text-amber-600' : 'text-green-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notification.title}
                    </p>
                    {notification.unread && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full ml-2" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {notification.time}
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
