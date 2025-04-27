import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import EventCard from "@/components/EventCard";
import EventDetailsModal from "@/components/EventDetailsModal";
import { Event } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Search, Filter, ChevronRight, Calendar, MapPin, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("featured");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Force a fresh fetch of events when the page loads
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/events"] });
  }, [queryClient]);

  const { data: allEvents, isLoading, error } = useQuery({
    queryKey: ["/api/events"],
    staleTime: 0, // Always consider the data stale to force refetch
  });

  // Convert data to typed array
  const events: Event[] = allEvents as Event[] || [];
  
  // Log for debugging
  useEffect(() => {
    console.log("Events loaded:", events.length);
    if (error) {
      console.error("Error loading events:", error);
      toast({
        title: "Error loading events",
        description: "There was a problem loading the events. Please try again.",
        variant: "destructive",
      });
    }
  }, [events, error, toast]);

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

  // Filter events based on search query
  const filteredEvents = events.filter((event) => {    
    if (!searchQuery) return true;
    
    const searchTerms = searchQuery.toLowerCase();
    return (
      (event.title?.toLowerCase().includes(searchTerms)) ||
      (event.description?.toLowerCase().includes(searchTerms)) ||
      (event.location?.toLowerCase().includes(searchTerms)) ||
      (event.category?.toLowerCase().includes(searchTerms))
    );
  });

  // Get featured events
  const featuredEvents = events.filter(event => event.featured);
  
  // Get upcoming events (events with dates in the future)
  const today = new Date().toISOString().split('T')[0];
  const upcomingEvents = events.filter(event => event.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Get events by category
  const getEventsByCategory = (category: string) => {
    return events.filter(event => event.category === category);
  };

  // Skeleton loaders
  const renderFeaturedSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-[400px] rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-6 w-1/3" />
          <div className="flex space-x-3 mt-4">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderCategorySkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-7 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[280px] rounded-lg" />
        ))}
      </div>
    </div>
  );

  // Show a message when no events are found
  const renderEmptyState = (message = "No events found") => {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-300">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
          <path d="M8 14h.01" />
          <path d="M12 14h.01" />
          <path d="M16 14h.01" />
          <path d="M8 18h.01" />
          <path d="M12 18h.01" />
          <path d="M16 18h.01" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-neutral-900">{message}</h3>
        <p className="mt-1 text-sm text-neutral-500">
          {searchQuery 
            ? "Try a different search term or clear your filters."
            : "Check back later for upcoming events."}
        </p>
      </div>
    );
  };

  // Function to render the featured event section
  const renderFeaturedSection = () => {
    if (isLoading) return renderFeaturedSkeleton();
    if (featuredEvents.length === 0) return renderEmptyState("No featured events");

    const featuredEvent = featuredEvents[0];
    
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-neutral-900">Featured Event</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-xl overflow-hidden shadow-sm">
          <div className="aspect-video md:aspect-auto md:h-full overflow-hidden relative">
            <img 
              src={featuredEvent.image || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80'} 
              alt={featuredEvent.title} 
              className="object-cover w-full h-full" 
            />
            <div className="absolute top-4 left-4">
              <Badge variant="outline" className="bg-black/50 text-white border-0 backdrop-blur-sm">
                {featuredEvent.category}
              </Badge>
            </div>
          </div>
          <div className="p-6 flex flex-col">
            <div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">{featuredEvent.title}</h3>
              <p className="text-neutral-600 line-clamp-3 mb-4">{featuredEvent.description}</p>
              
              <div className="space-y-2 text-sm text-neutral-500 mb-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-neutral-400" />
                  <span>{new Date(featuredEvent.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                  {featuredEvent.time && <span className="ml-1">at {featuredEvent.time}</span>}
                </div>
                
                {featuredEvent.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-neutral-400" />
                    <span>{featuredEvent.location}</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-neutral-400" />
                  <span>
                    {featuredEvent.attendees || 0} attending
                    {featuredEvent.maxAttendees && 
                      ` · ${featuredEvent.maxAttendees - (featuredEvent.attendees || 0)} spots left`
                    }
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-auto flex flex-wrap gap-3">
              <Button 
                variant="default"
                onClick={() => handleShowDetails(featuredEvent)}
                className="flex-1 sm:flex-none"
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render events categorized by their categories
  const renderCategorizedEvents = () => {
    if (isLoading) {
      return (
        <div className="space-y-12">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="mb-8">
              {renderCategorySkeleton()}
            </div>
          ))}
        </div>
      );
    }

    // Get unique categories
    const categories = [...new Set(events.map(event => event.category))].filter(Boolean);
    
    if (categories.length === 0) return null;
    
    return (
      <div className="space-y-12 mt-8">
        {categories.map(category => {
          const categoryEvents = getEventsByCategory(category || '');
          if (!categoryEvents.length) return null;
          
          return (
            <div key={category} className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-neutral-900">{category} Events</h2>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark">
                  <Link href={`/events?category=${category}`} className="flex items-center">
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoryEvents.slice(0, 4).map(event => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onShowDetails={handleShowDetails} 
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render calendar section with upcoming events
  const renderUpcomingEvents = () => {
    if (isLoading) return renderCategorySkeleton();
    if (upcomingEvents.length === 0) return renderEmptyState("No upcoming events");
    
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-neutral-900">Upcoming Events</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {upcomingEvents.slice(0, 8).map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              onShowDetails={handleShowDetails} 
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-8 mb-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight mb-4">
            Discover Amazing Events Near You
          </h1>
          <p className="text-lg text-neutral-700 mb-6">
            Browse and join the best events in your area. From tech conferences to music festivals,
            find something for everyone.
          </p>
          <div className="relative max-w-xl">
            <Input
              type="text"
              placeholder="Search for events..."
              className="w-full pl-12 pr-4 py-3 text-lg shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-neutral-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs 
        defaultValue="featured" 
        className="space-y-6"
        value={currentTab}
        onValueChange={setCurrentTab}
      >
        <TabsList className="bg-transparent border-b border-neutral-200 w-full justify-start mb-6 p-0 h-auto">
          <TabsTrigger 
            value="featured" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-4 py-2"
          >
            Featured
          </TabsTrigger>
          <TabsTrigger 
            value="upcoming" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-4 py-2"
          >
            Upcoming
          </TabsTrigger>
          <TabsTrigger 
            value="categories" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-4 py-2"
          >
            Categories
          </TabsTrigger>
        </TabsList>
        
        {searchQuery ? (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Search Results</h2>
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredEvents.map(event => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onShowDetails={handleShowDetails} 
                  />
                ))}
              </div>
            ) : (
              renderEmptyState(`No results found for "${searchQuery}"`)
            )}
          </div>
        ) : (
          <>
            <TabsContent value="featured" className="p-0 m-0">
              {renderFeaturedSection()}
              {renderUpcomingEvents()}
            </TabsContent>
            
            <TabsContent value="upcoming" className="p-0 m-0">
              {renderUpcomingEvents()}
            </TabsContent>
            
            <TabsContent value="categories" className="p-0 m-0">
              {renderCategorizedEvents()}
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </main>
  );
}
