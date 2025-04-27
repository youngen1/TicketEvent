import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Ticket, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

interface TicketAttendee {
  id: number;
  userId: number;
  username: string;
  displayName: string;
  avatar: string | null;
  quantity: number;
  purchaseDate: string;
}

export default function EventAttendance({ event }: EventAttendanceProps) {
  const { user, isAuthenticated } = useAuth();
  const [showAttendees, setShowAttendees] = useState(false);
  
  const eventDate = new Date(event.date + 'T' + (event.time || '00:00'));
  const isPastEvent = eventDate < new Date();

  // Fetch the user's ticket for this event
  const { data: userTicket } = useQuery({
    queryKey: ["/api/events", event.id, "ticket", user?.id],
    enabled: isAuthenticated && !!user?.id,
  });

  // Fetch all ticket purchasers for this event
  const { data: ticketAttendees = [] } = useQuery<TicketAttendee[]>({
    queryKey: ["/api/events", event.id, "tickets", "attendees"],
  });

  const hasTicket = !!userTicket;
  const attendeeCount = Array.isArray(ticketAttendees) ? ticketAttendees.length : 0;
  const ticketCount = Array.isArray(ticketAttendees) 
    ? ticketAttendees.reduce((sum, attendee) => sum + (attendee.quantity || 0), 0)
    : 0;

  return (
    <>
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Attendees</h3>
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-1 text-primary" />
                <span className="font-semibold">{attendeeCount}</span>
                <span className="text-muted-foreground ml-1">
                  {attendeeCount === 1 ? 'person' : 'people'} ({ticketCount} {ticketCount === 1 ? 'ticket' : 'tickets'})
                </span>
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
                  {hasTicket ? (
                    <div className="w-full">
                      <Badge className="bg-green-100 text-green-800">
                        <Ticket className="h-3 w-3 mr-1" />
                        You have a ticket for this event
                      </Badge>
                    </div>
                  ) : (
                    <div className="w-full">
                      <p className="text-sm text-muted-foreground">
                        {event.isFree ? 
                          "Get a free ticket to attend this event" : 
                          "Purchase a ticket to attend this event"}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {ticketAttendees.length > 0 && (
              <div className="mt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary" 
                  onClick={() => setShowAttendees(true)}
                >
                  <Users className="h-4 w-4 mr-1" />
                  View all attendees ({ticketAttendees.length})
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
              {attendeeCount} {attendeeCount === 1 ? 'person' : 'people'} with {ticketCount} {ticketCount === 1 ? 'ticket' : 'tickets'}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[300px] mt-4">
            <div className="space-y-4">
              {ticketAttendees.length > 0 ? (
                <div>
                  <h4 className="text-sm font-medium mb-2">Ticket Holders</h4>
                  <div className="space-y-3">
                    {ticketAttendees.map((attendee) => (
                      <div key={attendee.id} className="flex items-center space-x-3">
                        <Avatar>
                          {attendee.avatar ? (
                            <AvatarImage src={attendee.avatar} alt={attendee.displayName || attendee.username} />
                          ) : (
                            <AvatarFallback className="bg-green-100 text-green-800">
                              {attendee.username ? attendee.username.substring(0, 2).toUpperCase() : "U"}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-medium">{attendee.displayName || attendee.username}</p>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                            <Ticket className="h-3 w-3 mr-1" />
                            {attendee.quantity} {attendee.quantity === 1 ? 'ticket' : 'tickets'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Ticket className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
                  <p className="text-muted-foreground">No ticket holders yet.</p>
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