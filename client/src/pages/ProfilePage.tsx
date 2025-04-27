import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Event } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  CalendarDays, User, Settings, Star, Calendar, 
  Clock, MapPin, Upload, Camera, Loader2, Ticket, CreditCard,
  Users, UserPlus, UserMinus, Search
} from "lucide-react";
import EventCard from "@/components/EventCard";
import EventDetailsModal from "@/components/EventDetailsModal";
import FinanceView from "@/components/FinanceView";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showFollowersDialog, setShowFollowersDialog] = useState(false);
  const [showFollowingDialog, setShowFollowingDialog] = useState(false);
  const [followersSearch, setFollowersSearch] = useState("");
  const [followingSearch, setFollowingSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }
  
  // Mutation for uploading profile photo
  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      // Create form data
      const formData = new FormData();
      formData.append('image', file);
      
      // Upload the image first
      const uploadRes = await apiRequest("POST", "/api/upload/image", formData, true);
      
      if (!uploadRes.ok) {
        throw new Error('Failed to upload image');
      }
      
      const imageData = await uploadRes.json();
      
      // Update user profile with new avatar
      const updateRes = await apiRequest("PUT", "/api/users/profile", {
        avatar: imageData.imageUrl
      });
      
      if (!updateRes.ok) {
        throw new Error('Failed to update profile');
      }
      
      return await updateRes.json();
    },
    onSuccess: (data) => {
      // Invalidate queries to refresh user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      toast({
        title: "Profile Photo Updated",
        description: "Your profile photo has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile photo. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsUploadingPhoto(false);
    }
  });

  // Get user's event history
  const { data: userEvents = [], isLoading: userEventsLoading } = useQuery({
    queryKey: ["/api/users", user?.id, "events"],
  });

  // Get user's upcoming events (events they're attending)
  const { data: upcomingEvents = [], isLoading: upcomingEventsLoading } = useQuery({
    queryKey: ["/api/users", user?.id, "upcoming-events"],
  });
  
  // Get user's purchased tickets
  const { data: userTickets = [], isLoading: userTicketsLoading } = useQuery({
    queryKey: ["/api/users/tickets"],
  });
  
  // Get user's followers
  const { data: followers = [], isLoading: followersLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/followers`],
    enabled: !!user?.id
  });
  
  // Get users followed by the user
  const { data: following = [], isLoading: followingLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/following`],
    enabled: !!user?.id
  });

  const handleShowDetails = (event: Event, openFullscreen = false) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
    
    // If openFullscreen is true, dispatch event after a short delay to ensure modal is open
    if (openFullscreen) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('openEventFullscreen', { 
          detail: { eventId: event.id } 
        }));
      }, 300); // Short delay to ensure modal and images are loaded
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    setLocation("/");
  };

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploadingPhoto(true);
      uploadPhotoMutation.mutate(file);
    }
  };
  
  // Trigger file input click
  const handlePhotoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your event profile
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-center mb-4 relative group">
                <Avatar className="h-24 w-24 relative">
                  {user?.avatar ? (
                    <AvatarImage src={user.avatar} alt={user?.username || "User"} />
                  ) : null}
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {user?.username ? getInitials(user.username) : "U"}
                  </AvatarFallback>
                  
                  {/* Upload overlay */}
                  <div 
                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={handlePhotoUploadClick}
                  >
                    {isUploadingPhoto ? (
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    ) : (
                      <Camera className="h-6 w-6 text-white" />
                    )}
                  </div>
                </Avatar>
                
                {/* Hidden file input */}
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                />
              </div>
              <CardTitle className="text-center text-xl">
                {user?.displayName || user?.username}
              </CardTitle>
              <CardDescription className="text-center">
                {user?.displayName ? `@${user.username}` : "Member since " + new Date(user?.createdAt || Date.now()).toLocaleDateString()}
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
                    <span>Upcoming Events</span>
                  </div>
                  <Badge variant="secondary">{upcomingEvents.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center text-sm hover:underline cursor-pointer"
                    onClick={() => setShowFollowersDialog(true)}
                  >
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Followers</span>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="cursor-pointer"
                    onClick={() => setShowFollowersDialog(true)}
                  >
                    {followers?.length || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center text-sm hover:underline cursor-pointer"
                    onClick={() => setShowFollowingDialog(true)}
                  >
                    <UserPlus className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Following</span>
                  </div>
                  <Badge 
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setShowFollowingDialog(true)}
                  >
                    {following?.length || 0}
                  </Badge>
                </div>
                <Separator className="my-4" />
                <div className="flex flex-col space-y-2">
                  <Button variant="outline" className="justify-start" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="justify-start" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </Button>
                  <Button variant="outline" className="justify-start" size="sm" onClick={handleLogout}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* User content */}
        <div className="md:col-span-2">
          <Tabs defaultValue="my-events" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="my-events">My Events</TabsTrigger>
              <TabsTrigger value="attending">Attending</TabsTrigger>
              <TabsTrigger value="tickets">My Tickets</TabsTrigger>
              <TabsTrigger value="finance">Finance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-events" className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Events You've Created</h2>
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
                      You haven't created any events yet. Create your first event to see it here.
                    </p>
                    <Button className="mt-4" onClick={() => setLocation("/")}>
                      Create an Event
                    </Button>
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
              <h2 className="text-xl font-semibold mb-4">Events You're Attending</h2>
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
                      You're not attending any upcoming events. Browse events and RSVP to see them here.
                    </p>
                    <Button className="mt-4" onClick={() => setLocation("/events")}>
                      Browse Events
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event: Event) => (
                    <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start">
                        <div 
                          className="w-full sm:w-24 h-24 bg-muted rounded-md flex-shrink-0 bg-cover bg-center"
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
            
            <TabsContent value="tickets" className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Your Purchased Tickets</h2>
              {userTicketsLoading ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Loading tickets...</p>
                </div>
              ) : userTickets.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <Ticket className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium">No tickets purchased</h3>
                    <p className="text-muted-foreground text-center mt-1 max-w-md">
                      You haven't purchased any tickets yet. Browse events and buy tickets to see them here.
                    </p>
                    <Button className="mt-4" onClick={() => setLocation("/events")}>
                      Browse Events
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {userTickets.map((ticket: any) => (
                    <Card key={ticket.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start">
                        {ticket.event && (
                          <div 
                            className="w-full sm:w-24 h-24 bg-muted rounded-md flex-shrink-0 bg-cover bg-center"
                            style={{ 
                              backgroundImage: `url(${
                                ticket.event.image || 
                                (ticket.event.images ? JSON.parse(ticket.event.images)[0] : '/placeholder-event.jpg')
                              })` 
                            }}
                            onClick={() => ticket.event && handleShowDetails(ticket.event, true)}
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 
                                className="font-medium text-lg hover:text-primary cursor-pointer" 
                                onClick={() => ticket.event && handleShowDetails(ticket.event)}
                              >
                                {ticket.event ? ticket.event.title : "Event unavailable"}
                              </h3>
                              <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-muted-foreground mt-1">
                                {ticket.event && (
                                  <>
                                    <div className="flex items-center">
                                      <Calendar className="mr-1 h-4 w-4" />
                                      <span>{new Date(ticket.event.date).toLocaleDateString()}</span>
                                    </div>
                                    {ticket.event.time && (
                                      <div className="flex items-center">
                                        <Clock className="mr-1 h-4 w-4" />
                                        <span>{ticket.event.time}</span>
                                      </div>
                                    )}
                                    {ticket.event.location && (
                                      <div className="flex items-center">
                                        <MapPin className="mr-1 h-4 w-4" />
                                        <span>{ticket.event.location}</span>
                                      </div>
                                    )}
                                  </>
                                )}
                                <div className="flex items-center mt-1">
                                  <CreditCard className="mr-1 h-4 w-4" />
                                  <span>Purchase: {new Date(ticket.purchaseDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center mt-1">
                                  <Ticket className="mr-1 h-4 w-4" />
                                  <span>Quantity: {ticket.quantity || 1}</span>
                                </div>
                              </div>
                            </div>
                            <Badge>{ticket.paymentStatus || "completed"}</Badge>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {ticket.event && (
                              <Button variant="outline" size="sm" onClick={() => handleShowDetails(ticket.event)}>
                                View Event
                              </Button>
                            )}
                            <Badge variant="outline" className="px-3 py-1 flex items-center gap-1">
                              <CreditCard className="h-3 w-3" />
                              ${ticket.totalAmount}
                            </Badge>
                            <Badge variant="secondary" className="px-3 py-1">
                              Ref: {ticket.paymentReference.substring(0, 10)}...
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="finance" className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Financial Overview</h2>
              {user?.id ? (
                <FinanceView userId={user.id} />
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Unable to load financial data.</p>
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
      
      {/* Followers Dialog */}
      <Dialog open={showFollowersDialog} onOpenChange={setShowFollowersDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Followers</DialogTitle>
            <div className="relative mt-3">
              <Input
                placeholder="Search followers"
                value={followersSearch}
                onChange={(e) => setFollowersSearch(e.target.value)}
                className="w-full pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </DialogHeader>
          <div className="mt-4 max-h-96 overflow-y-auto">
            {followersLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : followers.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                You don't have any followers yet.
              </p>
            ) : (
              <div className="space-y-4">
                {followers
                  .filter((follower: any) => {
                    const searchTerm = followersSearch.toLowerCase();
                    return (
                      follower.username.toLowerCase().includes(searchTerm) ||
                      (follower.displayName && follower.displayName.toLowerCase().includes(searchTerm))
                    );
                  })
                  .map((follower: any) => (
                    <div key={follower.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          {follower.avatar ? (
                            <AvatarImage src={follower.avatar} alt={follower.username} />
                          ) : null}
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(follower.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center">
                            <p className="font-medium">{follower.displayName || follower.username}</p>
                            {follower.isFollowing && 
                              <Badge variant="outline" className="ml-2 text-xs py-0">Follows you</Badge>
                            }
                          </div>
                          {follower.displayName && <p className="text-sm text-muted-foreground">@{follower.username}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {follower.youFollow ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Unfollow logic would go here
                            }}
                          >
                            Following
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Follow logic would go here
                            }}
                          >
                            Follow
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowFollowersDialog(false);
                            setLocation(`/users/${follower.id}`);
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Following Dialog */}
      <Dialog open={showFollowingDialog} onOpenChange={setShowFollowingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Following</DialogTitle>
            <div className="relative mt-3">
              <Input
                placeholder="Search following"
                value={followingSearch}
                onChange={(e) => setFollowingSearch(e.target.value)}
                className="w-full pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </DialogHeader>
          <div className="mt-4 max-h-96 overflow-y-auto">
            {followingLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : following.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                You aren't following anyone yet.
              </p>
            ) : (
              <div className="space-y-4">
                {following
                  .filter((followedUser: any) => {
                    const searchTerm = followingSearch.toLowerCase();
                    return (
                      followedUser.username.toLowerCase().includes(searchTerm) ||
                      (followedUser.displayName && followedUser.displayName.toLowerCase().includes(searchTerm))
                    );
                  })
                  .map((followedUser: any) => (
                    <div key={followedUser.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          {followedUser.avatar ? (
                            <AvatarImage src={followedUser.avatar} alt={followedUser.username} />
                          ) : null}
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(followedUser.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center">
                            <p className="font-medium">{followedUser.displayName || followedUser.username}</p>
                            {followedUser.followsYou && 
                              <Badge variant="outline" className="ml-2 text-xs py-0">Follows you</Badge>
                            }
                          </div>
                          {followedUser.displayName && <p className="text-sm text-muted-foreground">@{followedUser.username}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Unfollow logic would go here
                          }}
                        >
                          Following
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowFollowingDialog(false);
                            setLocation(`/users/${followedUser.id}`);
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}