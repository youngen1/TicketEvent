import { Event } from "@shared/schema";
import { Heart, Calendar, MapPin, Users, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface EventDetailsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventDetailsModal({ event, isOpen, onClose }: EventDetailsModalProps) {
  const queryClient = useQueryClient();

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!event) return null;
      const res = await apiRequest("PUT", `/api/events/${event.id}/favorite`, null);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    }
  });

  if (!event) return null;

  // Parse schedule data if available
  let scheduleItems: { time: string; title: string; description?: string }[] = [];
  if (event.schedule) {
    try {
      scheduleItems = JSON.parse(event.schedule);
    } catch (e) {
      console.error("Failed to parse schedule:", e);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-white">
          <div className="h-56 w-full bg-neutral-200">
            {event.video ? (
              <div className="relative w-full h-full">
                <video 
                  src={event.video} 
                  controls 
                  className="w-full h-full object-cover"
                  poster={event.thumbnail || undefined}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : event.image ? (
              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-neutral-300 flex items-center justify-center text-neutral-500">
                No Media Available
              </div>
            )}
          </div>
          <div className="px-4 pt-5 pb-4 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getCategoryStyles(event.category)}`}>
                  {event.category}
                </span>
                <h3 className="mt-2 text-2xl font-bold text-neutral-900 font-heading">
                  {event.title}
                </h3>
              </div>
              <button 
                className="bg-white rounded-full p-1.5 text-neutral-400 hover:text-red-500 focus:outline-none"
                onClick={() => toggleFavoriteMutation.mutate()}
                disabled={toggleFavoriteMutation.isPending}
              >
                <Heart className={event.isFavorite ? "text-red-500 fill-red-500" : ""} size={20} />
              </button>
            </div>
            
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="text-primary" size={20} />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-neutral-500">Date & Time</h4>
                  <p className="mt-1 text-sm text-neutral-900">{event.date} • {event.time}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MapPin className="text-primary" size={20} />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-neutral-500">Location</h4>
                  <p className="mt-1 text-sm text-neutral-900">{event.location}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="text-primary" size={20} />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-neutral-500">Attendees</h4>
                  <p className="mt-1 text-sm text-neutral-900">{event.attendees} registered</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-lg font-medium text-neutral-900 font-heading">About The Event</h4>
              <p className="mt-2 text-neutral-600 whitespace-pre-line">
                {event.description}
              </p>
            </div>
            
            {scheduleItems.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-medium text-neutral-900 font-heading">Schedule</h4>
                <div className="mt-2 border-t border-neutral-200">
                  {scheduleItems.map((item, index) => (
                    <div key={index} className={`py-3 flex ${index > 0 ? 'border-t border-neutral-200' : ''}`}>
                      <div className="text-sm font-medium text-neutral-500 w-24">{item.time}</div>
                      <div>
                        <h5 className="text-sm font-medium text-neutral-900">{item.title}</h5>
                        {item.description && (
                          <p className="text-sm text-neutral-600">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="bg-neutral-50 px-4 py-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button className="bg-primary hover:bg-blue-700 text-white">
              Register Now
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
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
