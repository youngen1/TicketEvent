import { useState } from "react";
import { Bell, Users, Calendar, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { NOTIFICATION_TYPE, Notification } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";

export default function NotificationCenter() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  
  // Fetch notifications from the API
  const { 
    data: notifications = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      return apiRequest('GET', '/api/notifications')
        .then(res => res.json());
    },
    enabled: isAuthenticated
  });
  
  // Mutation to mark a notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return apiRequest('PATCH', `/api/notifications/${notificationId}/read`)
        .then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });
  
  // Mutation to mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/notifications/read-all`)
        .then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "Success",
        description: "All notifications marked as read"
      });
    }
  });
  
  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.isRead).length;
  
  // Group notifications by type
  const eventNotifications = notifications.filter(notification => 
    notification.type === NOTIFICATION_TYPE.EVENT_REMINDER || 
    notification.type === NOTIFICATION_TYPE.EVENT_UPDATE ||
    notification.type === NOTIFICATION_TYPE.EVENT_CANCELED ||
    notification.type === NOTIFICATION_TYPE.EVENT_STARTING_TODAY
  );
  
  const socialNotifications = notifications.filter(notification => 
    notification.type === NOTIFICATION_TYPE.NEW_COMMENT || 
    notification.type === NOTIFICATION_TYPE.ATTENDANCE_UPDATE ||
    notification.type === NOTIFICATION_TYPE.NEW_FOLLOWER ||
    notification.type === NOTIFICATION_TYPE.NEW_FRIEND
  );
  
  const activityNotifications = notifications.filter(notification => 
    notification.type === NOTIFICATION_TYPE.FOLLOWED_USER_EVENT || 
    notification.type === NOTIFICATION_TYPE.FOLLOWED_USER_TICKET
  );
  
  const systemNotifications = notifications.filter(notification => 
    notification.type === NOTIFICATION_TYPE.ADMIN_MESSAGE
  );
  
  const handleNotificationClick = (notification: Notification) => {
    // Mark the notification as read
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // Close dropdown
    setIsOpen(false);
    
    // Navigate to the appropriate page based on notification type
    if (notification.eventId) {
      setLocation(`/events/${notification.eventId}`);
    } else if (notification.relatedUserId) {
      setLocation(`/users/${notification.relatedUserId}`);
    }
    
    // Show toast for feedback
    toast({
      title: "Notification",
      description: notification.message,
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
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
          {notification.relatedUserId ? (
            <AvatarImage src={`https://ui-avatars.com/api/?name=User+${notification.relatedUserId}&background=random`} />
          ) : (
            <AvatarFallback className="bg-primary text-white text-xs">
              {getNotificationInitial(notification.type)}
            </AvatarFallback>
          )}
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
    
    // Convert string date to Date object if needed
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const now = new Date();
    const diffInHours = (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const minutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60));
      return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return format(dateObj, 'MMM d');
    }
  }
  
  // Helper to get icon initial for notification avatar
  function getNotificationInitial(type: string) {
    switch (type) {
      case NOTIFICATION_TYPE.EVENT_REMINDER: 
      case NOTIFICATION_TYPE.EVENT_UPDATE:
      case NOTIFICATION_TYPE.EVENT_CANCELED:
      case NOTIFICATION_TYPE.EVENT_STARTING_TODAY:
        return "E"; // Event
      case NOTIFICATION_TYPE.NEW_COMMENT:
        return "C"; // Comment
      case NOTIFICATION_TYPE.ATTENDANCE_UPDATE:
        return "A"; // Attendance
      case NOTIFICATION_TYPE.NEW_FOLLOWER:
      case NOTIFICATION_TYPE.NEW_FRIEND:
        return "F"; // Follower/Friend
      case NOTIFICATION_TYPE.FOLLOWED_USER_EVENT:
      case NOTIFICATION_TYPE.FOLLOWED_USER_TICKET:
        return "U"; // User activity
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
          {notifications.length > 0 && unreadCount > 0 && (
            <button 
              className="text-xs text-blue-600 hover:text-blue-800"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
            >
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
        ) : isLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-neutral-500">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <Bell className="h-10 w-10 mx-auto text-red-300 mb-2" />
            <h3 className="font-medium mb-1">Error loading notifications</h3>
            <p className="text-sm text-neutral-500">
              Please try again later
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
                <DropdownMenuLabel className="text-xs text-neutral-500 font-normal flex items-center">
                  <Calendar className="h-3 w-3 mr-1" /> Event Updates
                </DropdownMenuLabel>
                {eventNotifications.map(renderNotification)}
                <DropdownMenuSeparator />
              </DropdownMenuGroup>
            )}
            
            {socialNotifications.length > 0 && (
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-neutral-500 font-normal flex items-center">
                  <Users className="h-3 w-3 mr-1" /> Social Activity
                </DropdownMenuLabel>
                {socialNotifications.map(renderNotification)}
                <DropdownMenuSeparator />
              </DropdownMenuGroup>
            )}
            
            {activityNotifications.length > 0 && (
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-neutral-500 font-normal flex items-center">
                  <MessageSquare className="h-3 w-3 mr-1" /> Following Activity
                </DropdownMenuLabel>
                {activityNotifications.map(renderNotification)}
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
            
            <DropdownMenuItem 
              className="justify-center text-sm text-neutral-500 hover:text-blue-600"
              onClick={() => setLocation('/notifications')}
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}