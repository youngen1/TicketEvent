import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Event, User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarDays, Users, Star, Heart, Calendar, 
  Clock, MapPin, UserPlus, UserMinus, Loader2
} from "lucide-react";
import EventCard from "@/components/EventCard";
import EventDetailsModal from "@/components/EventDetailsModal";
import UserProfileSummary from "@/components/UserProfileSummary";
import { useLocation, useParams } from "wouter";

// Define types for API responses
type UserEventsResponse = Event[];
type UserFollowersResponse = User[];
type UserFollowingResponse = User[];
type UpcomingEventsResponse = Event[];

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id ? parseInt(params.id) : undefined;
  const { user: currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  // Get profile user data
  const { data: profileUser, isLoading: profileUserLoading } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });
  
  // Check if the current user is following this user
  const { data: isFollowing = false } = useQuery<boolean>({
    queryKey: [`/api/users/${userId}/is-following`],
    enabled: !!userId && !!currentUser?.id && userId !== currentUser?.id,
  });
  
  // Get user's event history
  const { data: userEvents = [] as Event[], isLoading: userEventsLoading } = useQuery<UserEventsResponse>({
    queryKey: [`/api/users/${userId}/events`],
    enabled: !!userId,
  });
  
  // Get user's followers
  const { data: followers = [] as User[], isLoading: followersLoading } = useQuery<UserFollowersResponse>({
    queryKey: [`/api/users/${userId}/followers`],
    enabled: !!userId,
  });
  
  // Get users followed by the user
  const { data: following = [] as User[], isLoading: followingLoading } = useQuery<UserFollowingResponse>({
    queryKey: [`/api/users/${userId}/following`],
    enabled: !!userId,
  });
  
  // Get user's upcoming events (events they're attending)
  const { data: upcomingEvents = [] as Event[], isLoading: upcomingEventsLoading } = useQuery<UpcomingEventsResponse>({
    queryKey: [`/api/users/${userId}/upcoming-events`],
    enabled: !!userId,
  });
  
  if (!userId || profileUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!profileUser) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
          <p className="text-muted-foreground mb-6">The user you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => setLocation('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }
  
  const isOwnProfile = currentUser?.id === profileUser.id;
  
  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to follow users",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const endpoint = `/api/users/${profileUser.id}/follow`;
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(endpoint, { method });
      
      if (!res.ok) {
        throw new Error(`Failed to ${isFollowing ? 'unfollow' : 'follow'} user`);
      }
      
      // Invalidate the queries to refresh data
      // This would be better handled in a mutation with react-query
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
      toast({
        title: "Success",
        description: `You are now ${isFollowing ? 'no longer following' : 'following'} ${profileUser.displayName || profileUser.username}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleShowDetails = (event: Event, openFullscreen = false) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
    
    // If openFullscreen is true, dispatch event after a short delay to ensure modal is open
    if (openFullscreen) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('openEventFullscreen', { 
          detail: { eventId: event.id } 
        }));
      }, 300);
    }
  };
  
  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };
  
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{profileUser.displayName || profileUser.username}'s Profile</h1>
        <p className="text-muted-foreground mt-1">
          {isOwnProfile ? "Your public profile" : `View ${profileUser.displayName || profileUser.username}'s profile`}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  {profileUser.avatar ? (
                    <AvatarImage src={profileUser.avatar} alt={profileUser.username} />
                  ) : null}
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {getInitials(profileUser.username)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-center text-xl">
                {profileUser.displayName || profileUser.username}
              </CardTitle>
              <CardDescription className="text-center">
                {profileUser.displayName ? `@${profileUser.username}` : "Member since " + new Date(profileUser.createdAt || Date.now()).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Events Created</span>
                  </div>
                  <Badge variant="secondary">{userEvents.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <Star className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Events Attending</span>
                  </div>
                  <Badge variant="secondary">{upcomingEvents.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Followers</span>
                  </div>
                  <Badge variant="secondary">{followers.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <UserPlus className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Following</span>
                  </div>
                  <Badge variant="secondary">{following.length}</Badge>
                </div>
                
                {!isOwnProfile && (
                  <div className="mt-6">
                    <Button
                      className="w-full"
                      variant={isFollowing ? "outline" : "default"}
                      onClick={handleFollowToggle}
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="mr-2 h-4 w-4" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Follow
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* User content */}
        <div className="md:col-span-2">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="attending">Attending</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="mt-6">
              <UserProfileSummary 
                user={profileUser}
                stats={{
                  eventsCreated: userEvents.length || 0,
                  eventsAttended: upcomingEvents.length || 0,
                  averageRating: 4.5 // This would come from an API call in production
                }}
              />
            </TabsContent>
            
            <TabsContent value="events" className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Events Created</h2>
              {userEventsLoading ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Loading events...</p>
                </div>
              ) : userEvents.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <Calendar className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium">No events created yet</h3>
                    <p className="text-muted-foreground text-center mt-1 max-w-md">
                      {isOwnProfile 
                        ? "You haven't created any events yet."
                        : `${profileUser.displayName || profileUser.username} hasn't created any events yet.`
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userEvents.map((event: Event) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      onShowDetails={handleShowDetails}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="attending" className="mt-6">
              <h2 className="text-xl font-semibold mb-4">
                {isOwnProfile ? "Events You're Attending" : `Events ${profileUser.displayName || profileUser.username} is Attending`}
              </h2>
              {upcomingEventsLoading ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Loading events...</p>
                </div>
              ) : upcomingEvents.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <Calendar className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium">No upcoming events</h3>
                    <p className="text-muted-foreground text-center mt-1 max-w-md">
                      {isOwnProfile 
                        ? "You're not attending any upcoming events."
                        : `${profileUser.displayName || profileUser.username} isn't attending any upcoming events.`
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event: Event) => (
                    <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start">
                        <div 
                          className="w-full sm:w-24 h-24 bg-muted rounded-md flex-shrink-0 bg-cover bg-center cursor-pointer"
                          style={{ backgroundImage: `url(${event.image || (event.images ? JSON.parse(event.images)[0] : '/placeholder-event.jpg')})` }}
                          onClick={() => handleShowDetails(event, true)}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-lg hover:text-primary cursor-pointer" onClick={() => handleShowDetails(event)}>
                                {event.title}
                              </h3>
                              <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-muted-foreground mt-1">
                                <div className="flex items-center">
                                  <Calendar className="mr-1 h-4 w-4" />
                                  <span>{new Date(event.date).toLocaleDateString()}</span>
                                </div>
                                {event.time && (
                                  <div className="flex items-center">
                                    <Clock className="mr-1 h-4 w-4" />
                                    <span>{event.time}</span>
                                  </div>
                                )}
                                {event.location && (
                                  <div className="flex items-center">
                                    <MapPin className="mr-1 h-4 w-4" />
                                    <span>{event.location}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Badge variant="secondary">{event.category}</Badge>
                          </div>
                          <div className="mt-2">
                            <Button variant="outline" size="sm" onClick={() => handleShowDetails(event)}>
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <EventDetailsModal
        event={selectedEvent}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
}