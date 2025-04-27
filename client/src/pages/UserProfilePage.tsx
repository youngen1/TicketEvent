import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  CalendarDays, User, Calendar, Clock, MapPin, UserPlus, UserMinus, Users
} from "lucide-react";
import EventCard from "@/components/EventCard";
import EventDetailsModal from "@/components/EventDetailsModal";
import { useLocation, useParams } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Event } from "@shared/schema";

export default function UserProfilePage() {
  const { isAuthenticated, user: currentUser } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const params = useParams();
  const userId = parseInt(params.id);
  const queryClient = useQueryClient();
  
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [showFollowersDialog, setShowFollowersDialog] = useState(false);
  const [showFollowingDialog, setShowFollowingDialog] = useState(false);
  
  // If the ID is invalid, redirect to home
  useEffect(() => {
    if (isNaN(userId)) {
      setLocation("/");
    }
  }, [userId, setLocation]);

  // Handle case where user views their own profile
  useEffect(() => {
    if (currentUser && currentUser.id === userId) {
      setLocation("/profile");
    }
  }, [currentUser, userId, setLocation]);

  // Get user profile data
  const { 
    data: user, 
    isLoading: isUserLoading,
    error: userError
  } = useQuery({
    queryKey: [`/api/users/${userId}`],
    enabled: !isNaN(userId)
  });

  // Get user's events
  const { 
    data: userEvents = [], 
    isLoading: userEventsLoading 
  } = useQuery({
    queryKey: [`/api/users/${userId}/events`],
    enabled: !isNaN(userId)
  });

  // Get user followers
  const { 
    data: followers = [], 
    isLoading: followersLoading 
  } = useQuery({
    queryKey: [`/api/users/${userId}/followers`],
    enabled: !isNaN(userId)
  });

  // Get user following
  const { 
    data: following = [], 
    isLoading: followingLoading 
  } = useQuery({
    queryKey: [`/api/users/${userId}/following`],
    enabled: !isNaN(userId)
  });

  // Follow user mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/users/${userId}/follow`);
      if (!res.ok) {
        throw new Error("Failed to follow user");
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/followers`] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      
      toast({
        title: "Success",
        description: `You are now following ${user?.username}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to follow user",
        variant: "destructive",
      });
    }
  });

  // Unfollow user mutation
  const unfollowMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/users/${userId}/follow`);
      if (!res.ok) {
        throw new Error("Failed to unfollow user");
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/followers`] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      
      toast({
        title: "Success",
        description: `You have unfollowed ${user?.username}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to unfollow user",
        variant: "destructive",
      });
    }
  });

  const handleFollowUnfollow = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "You need to be logged in to follow users",
        variant: "destructive",
      });
      return;
    }

    if (user?.isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  const handleShowDetails = (event: Event) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
  };

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  // Show loading state
  if (isUserLoading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-60">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  // Show error state
  if (userError || !user) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center h-60">
          <h2 className="text-xl font-semibold mb-2">User not found</h2>
          <p className="text-muted-foreground mb-4">
            The user you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => setLocation("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold">{user.username}'s Profile</h1>
        <p className="text-muted-foreground mt-1">
          View {user.username}'s events and activity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.username} />
                  ) : null}
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {getInitials(user.username)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-center text-xl">
                {user.displayName || user.username}
              </CardTitle>
              <CardDescription className="text-center">
                {user.displayName ? `@${user.username}` : "Member since " + new Date(user.createdAt || Date.now()).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => setShowFollowersDialog(true)}
                    className="flex items-center text-sm hover:underline"
                  >
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Followers</span>
                  </button>
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setShowFollowersDialog(true)}>
                    {user.followersCount || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => setShowFollowingDialog(true)}
                    className="flex items-center text-sm hover:underline"
                  >
                    <UserPlus className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Following</span>
                  </button>
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setShowFollowingDialog(true)}>
                    {user.followingCount || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Events</span>
                  </div>
                  <Badge variant="secondary">{userEvents.length}</Badge>
                </div>
                <Separator className="my-4" />
                {isAuthenticated && currentUser && currentUser.id !== userId && (
                  <Button 
                    variant={user.isFollowing ? "outline" : "default"}
                    className="w-full justify-center"
                    onClick={handleFollowUnfollow}
                    disabled={followMutation.isPending || unfollowMutation.isPending}
                  >
                    {followMutation.isPending || unfollowMutation.isPending ? (
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                    ) : user.isFollowing ? (
                      <UserMinus className="mr-2 h-4 w-4" />
                    ) : (
                      <UserPlus className="mr-2 h-4 w-4" />
                    )}
                    {user.isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* User content */}
        <div className="md:col-span-2">
          <Tabs defaultValue="events" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList>
            
            <TabsContent value="events" className="mt-6">
              <h2 className="text-xl font-semibold mb-4">{user.username}'s Events</h2>
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
                      {user.username} hasn't created any events yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userEvents.map((event: Event) => (
                    <div 
                      key={event.id} 
                      className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleShowDetails(event)}
                    >
                      <div 
                        className="h-48 bg-gray-200 bg-cover bg-center" 
                        style={{
                          backgroundImage: `url(${event.image || (event.images ? JSON.parse(event.images)[0] : '/placeholder-event.jpg')})`
                        }}
                      />
                      <div className="p-4">
                        <div className="text-sm text-gray-500">
                          {event.date && (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(event.date).toLocaleDateString()} {event.time && 
                                <><Clock className="h-4 w-4 mx-1" /> {event.time}</>
                              }
                            </div>
                          )}
                        </div>
                        <h3 className="text-lg font-bold mt-1">{event.title}</h3>
                        <p className="text-gray-600 text-sm mt-1 flex items-center">
                          {event.location && <>
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.location}
                          </>}
                        </p>
                        <div className="mt-2 flex justify-between items-center">
                          <Badge variant="secondary">{event.category}</Badge>
                          {event.price && (
                            <span className="text-purple-700 font-bold">
                              {typeof event.price === 'number' ? `R${event.price.toFixed(2)}` : event.price}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Followers Dialog */}
      <Dialog open={showFollowersDialog} onOpenChange={setShowFollowersDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Followers</DialogTitle>
          </DialogHeader>
          <div className="mt-4 max-h-96 overflow-y-auto">
            {followersLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : followers.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                {user.username} doesn't have any followers yet.
              </p>
            ) : (
              <div className="space-y-4">
                {followers.map((follower: any) => (
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
                        <p className="font-medium">{follower.displayName || follower.username}</p>
                        {follower.displayName && <p className="text-sm text-muted-foreground">@{follower.username}</p>}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
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
          </DialogHeader>
          <div className="mt-4 max-h-96 overflow-y-auto">
            {followingLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : following.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                {user.username} isn't following anyone yet.
              </p>
            ) : (
              <div className="space-y-4">
                {following.map((followedUser: any) => (
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
                        <p className="font-medium">{followedUser.displayName || followedUser.username}</p>
                        {followedUser.displayName && <p className="text-sm text-muted-foreground">@{followedUser.username}</p>}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
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
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Event details modal */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
        />
      )}
    </div>
  );
}