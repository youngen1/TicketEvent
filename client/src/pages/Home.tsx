import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import EventCard from "@/components/EventCard";
import EventDetailsModal from "@/components/EventDetailsModal";
import { Event } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Search, Plus, Share2, User, Ticket, DollarSign, KeyRound, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";

// Category options based on the EventCircle.site
const CATEGORIES = [
  "Recreational",
  "Religious",
  "Sports",
  "Cultural",
  "Concert",
  "Conference",
  "Workshop",
  "Meetup",
  "Party"
];

// Date filter options
const DATE_FILTERS = [
  "Today",
  "Upcoming"
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("Upcoming");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [location, navigate] = useLocation();

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

  // Handle category selection
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // Filter events based on all selected filters
  const filteredEvents = events.filter((event) => {    
    // Search query filter
    const matchesSearch = !searchQuery 
      ? true
      : (event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         event.location?.toLowerCase().includes(searchQuery.toLowerCase()));

    // Location filter
    const matchesLocation = locationFilter === "all-locations" || !locationFilter 
      ? true 
      : event.location?.toLowerCase().includes(locationFilter.toLowerCase());

    // Category filter
    const matchesCategory = selectedCategories.length === 0 
      ? true 
      : event.category && selectedCategories.includes(event.category);

    // Date filter
    let matchesDateFilter = true;
    const today = new Date().toISOString().split('T')[0];
    
    if (dateFilter === "Today") {
      matchesDateFilter = event.date === today;
    } else if (dateFilter === "Upcoming") {
      matchesDateFilter = event.date >= today;
    }

    return matchesSearch && matchesLocation && matchesCategory && matchesDateFilter;
  });

  // Sort events by date (upcoming first)
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    return a.date.localeCompare(b.date);
  });

  // Generate initials for user avatar badge
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  // Get avatar URL for a user
  const getUserAvatar = (userId?: number | null, fallbackName: string = 'User') => {
    // In a real application, you would fetch the user's profile photo from the server
    // For this demo, we'll use a placeholder service based on user ID
    return `https://ui-avatars.com/api/?name=${fallbackName}&background=8B5CF6&color=fff`;
  };

  // Skeleton loader for event cards
  const renderEventSkeletons = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );

  // Show a message when no events are found
  const renderEmptyState = () => {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="64" 
          height="64" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-gray-300"
        >
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
        <h3 className="mt-4 text-lg font-medium text-gray-900">No events found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {searchQuery || selectedCategories.length > 0 || locationFilter
            ? "Try changing your filters or search term."
            : "No events are currently available."}
        </p>
      </div>
    );
  };

  // Event list rendering
  const renderEventList = () => {
    if (isLoading) return renderEventSkeletons();
    if (sortedEvents.length === 0) return renderEmptyState();

    return (
      <div className="space-y-4">
        {sortedEvents.map(event => (
          <div 
            key={event.id} 
            className="bg-white rounded-lg shadow overflow-hidden"
            onClick={() => handleShowDetails(event)}
          >
            <div className="relative">
              <img
                src={event.image || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80'}
                alt={event.title}
                className="w-full h-48 object-cover"
              />
              {/* Profile circle in top right corner */}
              <div className="absolute top-2 right-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden border-2 border-white">
                  <img 
                    src={getUserAvatar(event.userId, event.category || "Event")} 
                    alt="Organizer" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {/* Category badge */}
              <div className="absolute top-4 right-12">
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                  {event.category || "Event"}
                </Badge>
              </div>
              {/* Removed R1, R2 code badges as requested */}
            </div>
            <div className="p-4">
              <div className="text-sm text-gray-500">
                {event.date && (
                  <div>
                    {format(new Date(event.date), "dd MMM yyyy")} {event.time}
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold mt-1">{event.title}</h3>
              <p className="text-gray-600 text-sm mt-1">
                {event.location || "Location not specified"}
              </p>
              <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                {event.description}
              </p>
              
              {/* Price display in right corner - in Rands */}
              {event.price && (
                <div className="mt-3 text-right">
                  <span className="text-purple-700 font-bold">
                    {(() => {
                      const price = typeof event.price === 'string' ? parseFloat(event.price) : event.price;
                      if (!isNaN(price)) {
                        return `R${price.toFixed(2)}`;
                      } else {
                        return event.price.toString().startsWith('R') ? event.price : `R${event.price}`;
                      }
                    })()}
                  </span>
                </div>
              )}
              
              <div className="mt-2 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {event.attendees ? (
                    `${event.attendees} ${event.attendees === 1 ? 'person' : 'people'} joined`
                  ) : (
                    "No one has joined yet"
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-purple-600 border-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Share functionality would go here
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-lg mx-auto py-4 px-4 bg-gray-50 min-h-screen">
      {/* User info and header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-800 rounded-full overflow-hidden mr-3">
            <img 
              src={getUserAvatar(1, "Your Profile")} 
              alt="Your Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Your Name</h2>
            <p className="text-sm text-gray-600">username</p>
          </div>
        </div>
      </div>

      {/* Events header with Add Event button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        </div>
        <Button className="bg-purple-500 hover:bg-purple-600">
          <Plus className="h-5 w-5 mr-1" /> Add Event
        </Button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        {/* Search input */}
        <div className="relative mb-4">
          <Input
            type="text"
            placeholder="Search by location"
            className="pl-10 pr-4 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Location Dropdown */}
        <div className="mb-4">
          <Select
            value={locationFilter}
            onValueChange={setLocationFilter}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Search by Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-locations">All Locations</SelectItem>
              {events
                .map(e => e.location)
                .filter((location, index, array) => 
                  location && array.indexOf(location) === index
                )
                .map(location => (
                  <SelectItem key={location} value={location || "unknown-location"}>
                    {location}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>

        {/* Categories */}
        <div className="mb-4">
          <h3 className="font-medium text-gray-700 mb-2">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(category => (
              <Badge
                key={category}
                variant={selectedCategories.includes(category) ? "default" : "outline"}
                className={`cursor-pointer rounded-full px-3 py-1 font-normal ${
                  selectedCategories.includes(category) 
                    ? "bg-purple-100 text-purple-800 hover:bg-purple-200" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => toggleCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Date Filter */}
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Date Filter</h3>
          <div className="flex flex-wrap gap-2">
            {DATE_FILTERS.map(filter => (
              <Badge
                key={filter}
                variant={dateFilter === filter ? "default" : "outline"}
                className={`cursor-pointer rounded-full px-3 py-1 font-normal ${
                  dateFilter === filter 
                    ? "bg-purple-100 text-purple-800 hover:bg-purple-200" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setDateFilter(filter)}
              >
                {filter}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Events List */}
      {renderEventList()}

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
}
