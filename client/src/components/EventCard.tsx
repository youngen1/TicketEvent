import { Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Event } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface EventCardProps {
  event: Event;
  onShowDetails: (event: Event) => void;
}

export default function EventCard({ event, onShowDetails }: EventCardProps) {
  const queryClient = useQueryClient();

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PUT", `/api/events/${event.id}/favorite`, null);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    }
  });

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteMutation.mutate();
  };

  return (
    <Card className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow duration-300">
      <div className="h-40 bg-neutral-200 relative">
        {event.thumbnail && event.thumbnail.length > 0 ? (
          <div className="relative w-full h-full">
            <img 
              src={event.thumbnail.startsWith('/uploads') ? `http://localhost:5000${event.thumbnail}` : event.thumbnail} 
              alt={event.title} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black bg-opacity-50 rounded-full p-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              </div>
            </div>
          </div>
        ) : event.image && event.image.length > 0 ? (
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-neutral-300 flex items-center justify-center text-neutral-500">
            No Media Available
          </div>
        )}
        <div className="absolute top-0 right-0 mt-2 mr-2">
          <button 
            className="bg-white rounded-full p-1.5 text-neutral-500 hover:text-red-500 focus:outline-none"
            onClick={handleFavoriteClick}
            disabled={toggleFavoriteMutation.isPending}
          >
            <Heart className={event.isFavorite ? "text-red-500 fill-red-500" : ""} />
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center mb-2">
          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getCategoryStyles(event.category)}`}>
            {event.category}
          </span>
          <span className="ml-auto text-sm text-neutral-500">
            <span className="inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {event.attendees}
            </span>
          </span>
        </div>
        <h3 className="text-lg font-medium text-neutral-900 mb-1 font-heading">{event.title}</h3>
        <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{event.description}</p>
        <div className="flex items-center text-sm text-neutral-500 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{event.date}</span>
        </div>
        <div className="flex items-center text-sm text-neutral-500 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{event.location}</span>
        </div>
        <div className="mt-4 flex justify-between">
          <Button 
            variant="ghost" 
            className="inline-flex items-center px-3 py-1.5 text-sm text-primary hover:bg-blue-50"
            onClick={() => onShowDetails(event)}
          >
            Details 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Button>
          <Button 
            variant="outline" 
            className="inline-flex items-center px-3 py-1.5 border border-primary text-sm text-primary hover:bg-blue-50"
          >
            Register
          </Button>
        </div>
      </div>
    </Card>
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
