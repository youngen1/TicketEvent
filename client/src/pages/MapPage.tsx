import { useState } from "react";
import EventMap from "@/components/EventMap";
import { Event } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import EventDetailsModal from "@/components/EventDetailsModal";

export default function MapPage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [mapSelectedEvent, setMapSelectedEvent] = useState<Event | null>(null);
  
  const { data: events = [] } = useQuery({
    queryKey: ["/api/events"],
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
  
  const handleMapEventSelect = (event: Event) => {
    setMapSelectedEvent(event);
  };
  
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-neutral-800 font-heading">Event Map</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Browse events by location
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left sidebar with events */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-4">Event Listing</h3>
              <ScrollArea className="h-[600px] pr-4">
                {events.length === 0 ? (
                  <p className="text-center text-muted-foreground pt-8">No events found</p>
                ) : (
                  <div className="space-y-4">
                    {events.map((event: Event) => (
                      <div
                        key={event.id}
                        className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
                          mapSelectedEvent?.id === event.id ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => handleMapEventSelect(event)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium line-clamp-1">{event.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {event.description}
                            </p>
                          </div>
                          <Badge variant="outline" className={getCategoryStyles(event.category)}>
                            {event.category}
                          </Badge>
                        </div>
                        
                        <Separator className="my-3" />
                        
                        <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                          {event.time && (
                            <div className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              <span>{event.time}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center">
                              <MapPin className="mr-1 h-3 w-3" />
                              <span className="line-clamp-1">{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        
        {/* Right section with map */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Interactive Map</h3>
                {mapSelectedEvent && (
                  <button
                    className="text-sm text-primary hover:underline"
                    onClick={() => handleShowDetails(mapSelectedEvent)}
                  >
                    View Event Details
                  </button>
                )}
              </div>
              <EventMap
                selectedEvent={mapSelectedEvent}
                onEventSelect={handleMapEventSelect}
                height="600px" 
              />
            </CardContent>
          </Card>
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

function getCategoryStyles(category: string): string {
  const styles: Record<string, string> = {
    "Technology": "bg-blue-100 text-blue-800",
    "Business": "bg-green-100 text-green-800",
    "Music": "bg-purple-100 text-purple-800",
    "Art": "bg-yellow-100 text-yellow-800",
    "Education": "bg-indigo-100 text-indigo-800",
    "Sports": "bg-red-100 text-red-800",
  };
  
  return styles[category] || "bg-gray-100 text-gray-800";
}