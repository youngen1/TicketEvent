import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import EventCard from "@/components/EventCard";
import EventDetailsModal from "@/components/EventDetailsModal";
import { Event } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { 
  Search, Plus, Share2, User, Calendar, CreditCard, 
  Lock, LogOut, Bell
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import NotificationCenter from "@/components/NotificationCenter";

// Import standardized categories from schema
import { EVENT_CATEGORIES } from "@shared/schema";

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
  
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [location, navigate] = useLocation();

  // Force a fresh fetch of events when the page loads
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 7; // Default 7 events per page
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, locationFilter, selectedCategories, dateFilter]);
  
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/events"] });
  }, [queryClient]);
  
  // Define the type for the events API response
  interface EventsResponse {
    events: Event[];
    pagination: {
      page: number;
      totalPages: number;
      hasMore: boolean;
      totalCount: number;
      limit: number;
    };
  }

  const { data: eventsData, isLoading, error } = useQuery<EventsResponse>({
    queryKey: ["/api/events", { 
      page: currentPage, 
      limit: eventsPerPage,
      category: selectedCategories.length === 1 ? selectedCategories[0] : undefined
    }],
    staleTime: 0, // Always consider the data stale to force refetch
  });

  // Convert data to typed array
  const events: Event[] = eventsData?.events || [];
  const pagination = eventsData?.pagination || { 
    page: 1, 
    totalPages: 1, 
    hasMore: false,
    totalCount: 0,
    limit: eventsPerPage
  };
  
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

  // Handle user search when search query is active
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  
  // Search for users when search query changes
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      setIsSearchingUsers(true);
      fetch(`/api/users/search?query=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => {
          setUserSearchResults(data || []);
          setIsSearchingUsers(false);
        })
        .catch(err => {
          console.error("Error searching users:", err);
          setIsSearchingUsers(false);
        });
    } else {
      setUserSearchResults([]);
    }
  }, [searchQuery]);

  // Apply filters only on the events loaded on the current page
  // When filters change, we'll stay on the same page but show filtered results
  const filteredEvents = Array.isArray(events) ? events.filter((event) => {    
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
  }) : [];

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

  // Pagination navigation
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
  };
  
  // Render pagination controls
  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    
    return (
      <div className="mt-6">
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1"
          >
            Previous
          </Button>
          
          {/* Page numbers */}
          <div className="flex space-x-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 ${currentPage === page ? 'bg-purple-600' : ''}`}
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
            className="px-3 py-1"
          >
            Next
          </Button>
        </div>
        
        {/* Page info */}
        <div className="text-center text-sm text-gray-500 mt-2">
          Showing {events.length} of {pagination.totalCount} events
        </div>
      </div>
    );
  };

  // Event list rendering
  const renderEventList = () => {
    if (isLoading) return renderEventSkeletons();
    if (sortedEvents.length === 0) return renderEmptyState();

    return (
      <div>
        <div className="space-y-4">
          {sortedEvents.map(event => (
            <EventCard 
              key={event.id}
              event={event}
              onShowDetails={handleShowDetails}
            />
          ))}
        </div>
        
        {/* Pagination */}
        {renderPagination()}
      </div>
    );
  };

  return (
    <div className="max-w-lg mx-auto py-4 px-4 bg-gray-50 min-h-screen">
      {/* User info and header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="w-10 h-10 bg-gray-800 rounded-full overflow-hidden mr-3 cursor-pointer">
                <img 
                  src={getUserAvatar(user?.id || 1, user?.displayName || user?.username || "Your Profile")} 
                  alt="Your Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <div className="px-4 py-3">
                <p className="text-sm font-medium leading-none">{user?.displayName || user?.username || 'Admin'}</p>
                <p className="text-xs leading-none text-muted-foreground mt-1">{user?.username || 'admin'}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="w-full">
                  <User className="h-4 w-4 mr-2" /> Your Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/tickets" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" /> My Tickets
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/finance" className="w-full">
                  <CreditCard className="h-4 w-4 mr-2" /> Finance
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/change-password" className="w-full">
                  <Lock className="h-4 w-4 mr-2" /> Change Password
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600 w-full">
                <LogOut className="h-4 w-4 mr-2" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{user?.displayName || user?.username || "Your Name"}</h2>
            <p className="text-sm text-gray-600">{user?.username || "username"}</p>
          </div>
        </div>
        <div className="flex items-center">
          <NotificationCenter />
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
            placeholder="Search events, users, or locations"
            className="pl-10 pr-4 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          
          {/* User search results */}
          {userSearchResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg py-1 max-h-60 overflow-auto">
              <h3 className="px-4 py-2 text-sm font-medium text-gray-700 border-b">Users</h3>
              {userSearchResults.map(user => (
                <Link 
                  key={user.id} 
                  href={`/user/${user.id}`}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden mr-3">
                    <img 
                      src={user.avatar || getUserAvatar(user.id, user.displayName || user.username)} 
                      alt={user.displayName || user.username} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{user.displayName || user.username}</p>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {isSearchingUsers && searchQuery.trim().length > 2 && (
            <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg p-4 text-center">
              <div className="animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent text-purple-600 rounded-full" role="status" aria-label="loading">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">Searching for users...</p>
            </div>
          )}
        </div>



        {/* Categories */}
        <div className="mb-4">
          <h3 className="font-medium text-gray-700 mb-2">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {EVENT_CATEGORIES.map(category => (
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
