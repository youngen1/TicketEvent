import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { Heart } from "lucide-react";
import EventCard from "@/components/EventCard";
import EventDetailsModal from "@/components/EventDetailsModal";
import { useAuth } from "@/contexts/AuthContext";

export default function FavoritesPage() {
  const { isAuthenticated } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  // In reality, this would fetch actual favorites
  // For now, just use the regular events endpoint as a placeholder
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['/api/events'],
    enabled: isAuthenticated,
  });
  
  // Simulate favorites with first 3 events
  // In a real implementation, this would be actual user favorites
  const favoriteEvents = events.slice(0, 3);
  
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
  
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-800 font-heading">Saved Events</h1>
        <p className="mt-1 text-neutral-600">
          Events you've saved for later
        </p>
      </div>
      
      {!isAuthenticated ? (
        <div className="py-32 text-center">
          <Heart className="h-16 w-16 mx-auto text-neutral-300 mb-4" />
          <h2 className="text-2xl font-medium text-neutral-700 mb-2">
            You haven't saved any events yet
          </h2>
          <p className="text-neutral-500 mb-6 max-w-md mx-auto">
            Log in to save your favorite events and access them from anywhere.
          </p>
        </div>
      ) : isLoading ? (
        <div className="py-32 text-center">
          <p className="text-neutral-600">Loading your saved events...</p>
        </div>
      ) : favoriteEvents.length === 0 ? (
        <div className="py-32 text-center">
          <Heart className="h-16 w-16 mx-auto text-neutral-300 mb-4" />
          <h2 className="text-2xl font-medium text-neutral-700 mb-2">
            You haven't saved any events yet
          </h2>
          <p className="text-neutral-500 mb-6 max-w-md mx-auto">
            Click the heart icon on any event to add it to your favorites.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteEvents.map((event: Event) => (
            <EventCard
              key={event.id}
              event={event}
              onShowDetails={handleShowDetails}
            />
          ))}
        </div>
      )}
      
      <EventDetailsModal
        event={selectedEvent}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
}