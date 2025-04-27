import { Heart, Image as ImageIcon } from "lucide-react";
import { Event } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";

interface EventCardProps {
  event: Event;
  onShowDetails: (event: Event, openFullscreen?: boolean) => void;
}

export default function EventCard({ event, onShowDetails }: EventCardProps) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [creator, setCreator] = useState<any>(null);

  // Get image data
  let firstImage = event.image || '';
  let totalImages = 0;
  
  if (event.images) {
    try {
      const imagesArray = JSON.parse(event.images);
      if (imagesArray.length > 0) {
        firstImage = imagesArray[0];
        totalImages = imagesArray.length;
      }
    } catch (e) {
      console.error('Failed to parse images:', e);
    }
  }

  // Fetch creator information
  useQuery({
    queryKey: [`/api/users/${event.userId}`],
    queryFn: async () => {
      if (!event.userId) return null;
      try {
        const response = await fetch(`/api/users/${event.userId}`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setCreator(data);
          return data;
        }
        return null;
      } catch (error) {
        console.error('Error fetching creator:', error);
        return null;
      }
    },
    enabled: !!event.userId,
  });

  // Mutation for favorites
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PUT", `/api/events/${event.id}/favorite`, null);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    }
  });

  // Click handlers
  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShowDetails(event, true);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteMutation.mutate();
  };
  
  const handleCreatorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (event.userId) {
      navigate(`/users/${event.userId}`);
    }
  };

  const getCreatorInitial = () => {
    return creator?.username?.charAt(0).toUpperCase() || `U${event.userId || ''}`;
  };

  // Format image URL
  const getFormattedImageUrl = (url: string) => {
    if (!url) return '';
    
    if (url.startsWith('/uploads')) {
      return `${window.location.origin}${url}`;
    }
    
    return url;
  };

  return (
    <div 
      onClick={() => onShowDetails(event)}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-shadow duration-300 hover:shadow-lg"
    >
      <div className="relative h-40 bg-neutral-200">
        {firstImage ? (
          <img 
            src={getFormattedImageUrl(firstImage)} 
            alt={event.title}
            className="w-full h-full object-cover" 
            onClick={handleImageClick}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={40} className="text-gray-400" />
          </div>
        )}
        
        <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold bg-purple-600 text-white">
          {event.category || 'General'}
        </div>
        
        <div 
          onClick={handleCreatorClick}
          className="absolute top-2 right-2 w-10 h-10 rounded-full overflow-hidden border-2 border-white cursor-pointer shadow-md"
          style={{
            backgroundColor: `hsl(${(event.id || 0) * 40 % 360}, 70%, 45%)`,
          }}
        >
          {creator?.avatar ? (
            <img 
              src={getFormattedImageUrl(creator.avatar)} 
              alt={creator.username || 'Creator'} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
              {getCreatorInitial()}
            </div>
          )}
        </div>
        
        <button
          onClick={handleFavoriteClick}
          className="absolute bottom-2 right-2 bg-white p-1.5 rounded-full shadow hover:bg-gray-100"
        >
          <Heart size={18} className={event.isFavorited ? "text-red-500 fill-red-500" : ""} />
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <div>{event.date}</div>
          <div>{event.location}</div>
        </div>
        
        <h3 className="text-lg font-semibold mb-2 text-gray-800">{event.title}</h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
        
        <div className="flex justify-between pt-2 border-t border-gray-100">
          <div className="text-sm font-semibold text-purple-600">
            {event.isFree ? 'Free' : `$${event.price}`}
          </div>
          
          <div className="text-xs text-gray-500">
            {event.attendees || 0} attending
          </div>
        </div>
      </div>
    </div>
  );
}
