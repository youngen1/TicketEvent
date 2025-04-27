import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Users, UserPlus, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

interface EventAttendanceProps {
  event: Event;
}

const ATTENDANCE_STATUS = {
  ATTENDING: "attending",
  NOT_ATTENDING: "not_attending",
  MAYBE: "maybe",
} as const;

type AttendanceStatus = typeof ATTENDANCE_STATUS[keyof typeof ATTENDANCE_STATUS];

export default function EventAttendance({ event }: EventAttendanceProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showAttendees, setShowAttendees] = useState(false);
  
  const eventDate = new Date(event.date + 'T' + (event.time || '00:00'));
  const isPastEvent = eventDate < new Date();

  // Fetch the current user's attendance status for this event
  const { data: userAttendance } = useQuery({
    queryKey: ["/api/events", event.id, "attendance", user?.id],
    enabled: isAuthenticated && !!user?.id,
  });

  // Fetch all attendees for this event
  const { data: attendees = [] } = useQuery({
    queryKey: ["/api/events", event.id, "attendees"],
  });

  // Update attendance status mutation
  const updateAttendanceMutation = useMutation({
    mutationFn: async (status: AttendanceStatus) => {
      return apiRequest(`/api/events/${event.id}/attendance`, {
        method: "POST",
        body: JSON.stringify({
          status,
          userId: user?.id,
          eventId: event.id,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "RSVP Updated",
        description: "Your attendance status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events", event.id, "attendance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", event.id, "attendees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update attendance status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAttendance = (status: AttendanceStatus) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to RSVP for this event.",
        variant: "destructive",
      });
      return;
    }
    updateAttendanceMutation.mutate(status);
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case ATTENDANCE_STATUS.ATTENDING:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Attending</Badge>;
      case ATTENDANCE_STATUS.NOT_ATTENDING:
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Not Attending</Badge>;
      case ATTENDANCE_STATUS.MAYBE:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Maybe</Badge>;
      default:
        return null;
    }
  };

  const attendingCount = attendees.filter((a: any) => a.status === ATTENDANCE_STATUS.ATTENDING).length;
  const maybeCount = attendees.filter((a: any) => a.status === ATTENDANCE_STATUS.MAYBE).length;

  return (
    <>
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">RSVP</h3>
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-1 text-primary" />
                <span className="font-semibold">{attendingCount}</span>
                <span className="text-muted-foreground ml-1">going</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-2">
              {isPastEvent ? (
                <div className="w-full">
                  <Badge variant="outline" className="bg-muted">
                    <Calendar className="h-3 w-3 mr-1" />
                    This event has already passed
                  </Badge>
                </div>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant={userAttendance?.status === ATTENDANCE_STATUS.ATTENDING ? "default" : "outline"}
                    className={userAttendance?.status === ATTENDANCE_STATUS.ATTENDING ? "bg-green-600 hover:bg-green-700" : ""}
                    onClick={() => handleAttendance(ATTENDANCE_STATUS.ATTENDING)}
                    disabled={updateAttendanceMutation.isPending || !isAuthenticated}
                  >
                    <Check className="h-4 w-4 mr-1" /> Going
                  </Button>
                  <Button
                    size="sm"
                    variant={userAttendance?.status === ATTENDANCE_STATUS.MAYBE ? "default" : "outline"}
                    className={userAttendance?.status === ATTENDANCE_STATUS.MAYBE ? "bg-amber-500 hover:bg-amber-600" : ""}
                    onClick={() => handleAttendance(ATTENDANCE_STATUS.MAYBE)}
                    disabled={updateAttendanceMutation.isPending || !isAuthenticated}
                  >
                    Maybe
                  </Button>
                  <Button
                    size="sm"
                    variant={userAttendance?.status === ATTENDANCE_STATUS.NOT_ATTENDING ? "default" : "outline"}
                    className={userAttendance?.status === ATTENDANCE_STATUS.NOT_ATTENDING ? "bg-red-500 hover:bg-red-600" : ""}
                    onClick={() => handleAttendance(ATTENDANCE_STATUS.NOT_ATTENDING)}
                    disabled={updateAttendanceMutation.isPending || !isAuthenticated}
                  >
                    <X className="h-4 w-4 mr-1" /> Can't Go
                  </Button>
                </>
              )}
            </div>
            
            {!isAuthenticated && (
              <p className="text-sm text-muted-foreground">
                Please log in to RSVP for this event
              </p>
            )}
            
            {attendees.length > 0 && (
              <div className="mt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary" 
                  onClick={() => setShowAttendees(true)}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  View all attendees ({attendees.length})
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={showAttendees} onOpenChange={setShowAttendees}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Event Attendees</DialogTitle>
            <DialogDescription>
              {attendingCount} attending · {maybeCount} maybe
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[300px] mt-4">
            <div className="space-y-4">
              {attendees.length > 0 ? (
                <>
                  {/* Attending section */}
                  {attendees.filter((a: any) => a.status === ATTENDANCE_STATUS.ATTENDING).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Attending</h4>
                      <div className="space-y-3">
                        {attendees
                          .filter((a: any) => a.status === ATTENDANCE_STATUS.ATTENDING)
                          .map((attendee: any) => (
                            <div key={attendee.id} className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback className="bg-green-100 text-green-800">
                                  {attendee.username ? attendee.username.substring(0, 2).toUpperCase() : "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{attendee.username || "Anonymous"}</p>
                                {getStatusBadge(attendee.status)}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Maybe section */}
                  {attendees.filter((a: any) => a.status === ATTENDANCE_STATUS.MAYBE).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Maybe</h4>
                      <div className="space-y-3">
                        {attendees
                          .filter((a: any) => a.status === ATTENDANCE_STATUS.MAYBE)
                          .map((attendee: any) => (
                            <div key={attendee.id} className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback className="bg-yellow-100 text-yellow-800">
                                  {attendee.username ? attendee.username.substring(0, 2).toUpperCase() : "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{attendee.username || "Anonymous"}</p>
                                {getStatusBadge(attendee.status)}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Not attending section */}
                  {attendees.filter((a: any) => a.status === ATTENDANCE_STATUS.NOT_ATTENDING).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Not Attending</h4>
                      <div className="space-y-3">
                        {attendees
                          .filter((a: any) => a.status === ATTENDANCE_STATUS.NOT_ATTENDING)
                          .map((attendee: any) => (
                            <div key={attendee.id} className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback className="bg-red-100 text-red-800">
                                  {attendee.username ? attendee.username.substring(0, 2).toUpperCase() : "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{attendee.username || "Anonymous"}</p>
                                {getStatusBadge(attendee.status)}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
                  <p className="text-muted-foreground">No attendees yet. Be the first to RSVP!</p>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAttendees(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}