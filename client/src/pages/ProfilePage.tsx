import { useState, useRef } from "react";
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
import { 
  CalendarDays, User, Settings, Star, Calendar, 
  Clock, MapPin, Upload, Camera, Loader2 
} from "lucide-react";
import EventCard from "@/components/EventCard";
import EventDetailsModal from "@/components/EventDetailsModal";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="my-events">My Events</TabsTrigger>
              <TabsTrigger value="attending">Attending</TabsTrigger>
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