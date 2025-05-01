import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import EventCard from "@/components/EventCard";
import EventDetailsModal from "@/components/EventDetailsModal";
import { Event } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Search, Filter, ArrowDownAZ } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 12;

  // Get events from API
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });
  
  // Define handleShowDetails with useCallback to prevent unnecessary recreation
  const handleShowDetails = useCallback((event: Event, openFullscreen = false) => {
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
  }, []);
  
  // Listen for custom event to open event by ID from deep links
  useEffect(() => {
    const handleOpenEventById = (e: CustomEvent<{eventId: number}>) => {
      const { eventId } = e.detail;
      
      // Find the event by ID
      const event = events.find((event) => event.id === eventId);
      if (event) {
        handleShowDetails(event);
      }
    };
    
    window.addEventListener('openEventById', handleOpenEventById as EventListener);
    
    return () => {
      window.removeEventListener('openEventById', handleOpenEventById as EventListener);
    };
  }, [events, handleShowDetails]); // Re-run effect when events array or handler changes

  const filteredEvents = events.filter((event) => {
    const titleMatch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const descriptionMatch = event.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const locationMatch = event.location?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    
    return titleMatch || descriptionMatch || locationMatch;
  });

  // Calculate pagination
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const renderPagination = () => {
    return (
      <div className="mt-10 flex items-center justify-between">
        <div className="text-sm text-neutral-700">
          Showing <span className="font-medium">{indexOfFirstEvent + 1}</span> to{" "}
          <span className="font-medium">
            {Math.min(indexOfLastEvent, filteredEvents.length)}
          </span>{" "}
          of <span className="font-medium">{filteredEvents.length}</span> results
        </div>
        <div className="flex items-center">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="mr-3"
          >
            Previous
          </Button>
          <div className="hidden md:flex">
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  className={`mr-2 ${
                    currentPage === pageNum
                      ? "bg-primary text-white"
                      : "text-neutral-700"
                  }`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  const renderEventSkeletons = () => {
    return Array.from({ length: 12 }).map((_, index) => (
      <div key={index} className="bg-white overflow-hidden shadow-sm rounded-lg">
        <Skeleton className="h-40 w-full" />
        <div className="p-4">
          <div className="flex items-center mb-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-10 ml-auto" />
          </div>
          <Skeleton className="h-6 w-3/4 mb-1" />
          <Skeleton className="h-12 w-full mb-3" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-3" />
          <div className="mt-4 flex justify-between">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>
    ));
  };

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="px-4 py-6 sm:px-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-neutral-800 font-heading">All Events</h2>
            <p className="mt-1 text-sm text-neutral-600">Browse and discover events from all categories</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-neutral-400" />
              </div>
            </div>
            <div className="inline-flex rounded-md shadow-sm">
              <Button variant="outline" className="inline-flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" className="ml-2 inline-flex items-center">
                <ArrowDownAZ className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="px-4 sm:px-0 mb-6">
        <div className="flex flex-wrap gap-2">
          <Button variant="default" className="bg-primary text-white">All</Button>
          <Button variant="outline">Technology</Button>
          <Button variant="outline">Business</Button>
          <Button variant="outline">Music</Button>
          <Button variant="outline">Art</Button>
          <Button variant="outline">Education</Button>
          <Button variant="outline">Sports</Button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="px-4 sm:px-0">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading
            ? renderEventSkeletons()
            : currentEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onShowDetails={handleShowDetails} 
                />
              ))}
        </div>

        {!isLoading && renderPagination()}
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </main>
  );
}
