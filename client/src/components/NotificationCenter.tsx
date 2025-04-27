import { useState } from "react";
import { Bell } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { NOTIFICATION_TYPE, Notification } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function NotificationCenter() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  // Dummy notifications for demo purposes
  const mockNotifications: Notification[] = [
    {
      id: 1,
      userId: 1,
      type: NOTIFICATION_TYPE.EVENT_REMINDER,
      title: "Event Reminder",
      message: "Your event 'Workshop' is starting in 1 hour",
      eventId: 1,
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    },
    {
      id: 2,
      userId: 1,
      type: NOTIFICATION_TYPE.NEW_COMMENT,
      title: "New Comment",
      message: "Someone commented on your event",
      eventId: 2,
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    },
    {
      id: 3,
      userId: 1,
      type: NOTIFICATION_TYPE.ATTENDANCE_UPDATE,
      title: "Attendance Update",
      message: "5 people are now attending your event",
      eventId: 1,
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
    }
  ];
  
  // Filter mockNotifications for authenticated users, empty for unauthenticated
  const notifications = isAuthenticated ? mockNotifications : [];
  
  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.isRead).length;
  
  // Group notifications by type
  const eventNotifications = notifications.filter(notification => 
    notification.type === NOTIFICATION_TYPE.EVENT_REMINDER || 
    notification.type === NOTIFICATION_TYPE.EVENT_UPDATE ||
    notification.type === NOTIFICATION_TYPE.EVENT_CANCELED
  );
  
  const socialNotifications = notifications.filter(notification => 
    notification.type === NOTIFICATION_TYPE.NEW_COMMENT || 
    notification.type === NOTIFICATION_TYPE.ATTENDANCE_UPDATE
  );
  
  const systemNotifications = notifications.filter(notification => 
    notification.type === NOTIFICATION_TYPE.ADMIN_MESSAGE
  );
  
  const handleNotificationClick = (notification: Notification) => {
    // For demo, just update the UI state and close dropdown
    setIsOpen(false);
    
    // In real implementation, would mark as read and navigate to related event
    toast({
      title: "Notification clicked",
      description: `You clicked: ${notification.title}`,
    });
  };

  const renderNotification = (notification: Notification) => {
    // Common rendering logic for all notification types
    return (
      <DropdownMenuItem
        key={notification.id}
        className={cn(
          "flex items-start gap-2 p-3 cursor-pointer",
          !notification.isRead && "bg-muted/50"
        )}
        onClick={() => handleNotificationClick(notification)}
      >
        <Avatar className="h-8 w-8 mt-1">
          <AvatarFallback className="bg-primary text-white text-xs">
            {getNotificationInitial(notification.type)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex justify-between">
            <span className="font-medium">{notification.title}</span>
            <span className="text-xs text-neutral-500">
              {formatNotificationDate(notification.createdAt)}
            </span>
          </div>
          <p className="text-sm text-neutral-600">{notification.message}</p>
          {!notification.isRead && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 mt-1 text-xs">
              New
            </Badge>
          )}
        </div>
      </DropdownMenuItem>
    );
  };

  // Helper to format notification dates in a human-readable way
  function formatNotificationDate(date: Date | null) {
    if (!date) return "";
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const minutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  }
  
  // Helper to get icon initial for notification avatar
  function getNotificationInitial(type: string) {
    switch (type) {
      case NOTIFICATION_TYPE.EVENT_REMINDER: 
      case NOTIFICATION_TYPE.EVENT_UPDATE:
      case NOTIFICATION_TYPE.EVENT_CANCELED:
        return "E"; // Event
      case NOTIFICATION_TYPE.NEW_COMMENT:
        return "C"; // Comment
      case NOTIFICATION_TYPE.ATTENDANCE_UPDATE:
        return "A"; // Attendance
      case NOTIFICATION_TYPE.ADMIN_MESSAGE:
        return "S"; // System
      default:
        return "N"; // Notification
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="relative" asChild>
        <button className="relative p-2 rounded-full hover:bg-neutral-100 transition-colors outline-none">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[70vh] overflow-y-auto">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {notifications.length > 0 && (
            <button className="text-xs text-blue-600 hover:text-blue-800">
              Mark all as read
            </button>
          )}
        </DropdownMenuLabel>
        
        {!isAuthenticated ? (
          <div className="p-4 text-center">
            <Bell className="h-10 w-10 mx-auto text-neutral-300 mb-2" />
            <h3 className="font-medium mb-1">No notifications</h3>
            <p className="text-sm text-neutral-500">
              Sign in to see your notifications
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center">
            <Bell className="h-10 w-10 mx-auto text-neutral-300 mb-2" />
            <h3 className="font-medium mb-1">No notifications</h3>
            <p className="text-sm text-neutral-500">
              You don't have any notifications yet
            </p>
          </div>
        ) : (
          <>
            {eventNotifications.length > 0 && (
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-neutral-500 font-normal">
                  Event Updates
                </DropdownMenuLabel>
                {eventNotifications.map(renderNotification)}
                <DropdownMenuSeparator />
              </DropdownMenuGroup>
            )}
            
            {socialNotifications.length > 0 && (
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-neutral-500 font-normal">
                  Social Activity
                </DropdownMenuLabel>
                {socialNotifications.map(renderNotification)}
                <DropdownMenuSeparator />
              </DropdownMenuGroup>
            )}
            
            {systemNotifications.length > 0 && (
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-neutral-500 font-normal">
                  System Notices
                </DropdownMenuLabel>
                {systemNotifications.map(renderNotification)}
              </DropdownMenuGroup>
            )}
            
            <DropdownMenuItem className="justify-center text-sm text-neutral-500 hover:text-blue-600">
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}