import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import EventDetailsModal from "@/components/EventDetailsModal";
import { CalendarSearch, MapPin, Clock } from "lucide-react";

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

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

  // Filter events for the selected date
  const dateString = date ? date.toISOString().split('T')[0] : '';
  const eventsForSelectedDate = events.filter((event: Event) => {
    return event.date === dateString;
  });

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-neutral-800 font-heading">Event Calendar</h2>
        <p className="mt-1 text-sm text-neutral-600">
          View and manage your events by date
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/2">
          <Card>
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:w-1/2">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center mb-4">
                <CalendarSearch className="mr-2 h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">
                  Events for {date?.toLocaleDateString()}
                </h3>
              </div>

              {eventsForSelectedDate.length > 0 ? (
                <div className="space-y-4">
                  {eventsForSelectedDate.map((event: Event) => (
                    <div
                      key={event.id}
                      className="border rounded-md p-4 hover:shadow-md cursor-pointer"
                      onClick={() => handleShowDetails(event)}
                    >
                      <div className="flex justify-between">
                        <h4 className="font-medium text-neutral-900">
                          {event.title}
                        </h4>
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getCategoryStyles(event.category)}`}>
                          {event.category}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 line-clamp-2 my-2">
                        {event.description}
                      </p>
                      <div className="flex items-center text-sm text-neutral-500 mt-2">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="mr-4">{event.time}</span>
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <CalendarSearch className="mx-auto h-12 w-12 mb-4 text-neutral-300" />
                  <p>No events scheduled for this date</p>
                  <p className="text-sm mt-1">Select another date or create a new event</p>
                </div>
              )}
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
