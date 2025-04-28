import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Event, GENDER_RESTRICTION } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Ticket, Calendar, AlertTriangle } from "lucide-react";
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
  
  // Safely handle event date check
  const eventDate = event?.date 
    ? new Date(event.date + 'T' + (event.time || '00:00'))
    : new Date();
  const isPastEvent = eventDate < new Date();
  
  // Safety check for event
  if (!event || typeof event.id !== 'number') {
    return null;
  }

  // Fetch the user's ticket for this event
  const { data: userTicket, error: userTicketError } = useQuery({
    queryKey: ["/api/events", String(event.id), "ticket", user?.id ? String(user.id) : "undefined"],
    enabled: isAuthenticated && !!user?.id,
  });

  // Fetch all ticket purchasers for this event
  const { data: ticketAttendees = [], error: attendeesError } = useQuery<TicketAttendee[]>({
    queryKey: ["/api/events", String(event.id), "tickets", "attendees"],
  });
  
  // Log any errors for debugging
  if (userTicketError) {
    console.error('User ticket error:', userTicketError);
  }
  
  if (attendeesError) {
    console.error('Attendees error:', attendeesError);
  }

  const hasTicket = !!userTicket;
  const attendeeCount = Array.isArray(ticketAttendees) ? ticketAttendees.length : 0;
  const ticketCount = Array.isArray(ticketAttendees) 
    ? ticketAttendees.reduce((sum, attendee) => sum + (attendee.quantity || 0), 0)
    : 0;
    
  // Check if user is restricted by gender
  const isGenderRestricted = () => {
    if (!user || !event.genderRestriction) return false;
    
    if (event.genderRestriction === GENDER_RESTRICTION.MALE_ONLY && user.gender !== 'male') {
      return true;
    }
    
    if (event.genderRestriction === GENDER_RESTRICTION.FEMALE_ONLY && user.gender !== 'female') {
      return true;
    }
    
    return false;
  };
  
  // Check if user is restricted by age
  const isAgeRestricted = () => {
    if (!user || !event.ageRestriction || !Array.isArray(event.ageRestriction) || event.ageRestriction.length === 0) {
      return false;
    }
    
    // If no date of birth, we can't determine age restriction
    if (!user.dateOfBirth) return false;
    
    const birthDate = new Date(user.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    
    // Adjust age if birthday hasn't occurred yet this year
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    // Check against age restriction groups
    if (age < 18 && event.ageRestriction.includes('under 18')) {
      return true;
    }
    
    if (age >= 20 && age < 30 && event.ageRestriction.includes('20s')) {
      return true;
    }
    
    if (age >= 30 && age < 40 && event.ageRestriction.includes('30s')) {
      return true;
    }
    
    if (age >= 40 && event.ageRestriction.includes('40plus')) {
      return true;
    }
    
    return false;
  };
  
  const isRestricted = isAuthenticated && (isGenderRestricted() || isAgeRestricted());

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
                  ) : isAuthenticated && isRestricted ? (
                    <div className="w-full">
                      <Badge variant="outline" className="bg-amber-100 text-amber-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {isGenderRestricted() ? 'You cannot attend (gender restriction)' : 'You cannot attend (age restriction)'}
                      </Badge>
                      <p className="text-sm text-amber-600 mt-2">
                        {isGenderRestricted() ? (
                          `This event is restricted to ${event.genderRestriction === 'male-only' ? 'male' : 'female'} attendees only.`
                        ) : (
                          'You are in an age group that is restricted from attending this event.'
                        )}
                      </p>
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