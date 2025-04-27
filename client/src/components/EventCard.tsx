import { Heart, Image as ImageIcon, User } from "lucide-react";
import { Event } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface EventCardProps {
  event: Event;
  onShowDetails: (event: Event, openFullscreen?: boolean) => void;
}

export default function EventCard({ event, onShowDetails }: EventCardProps) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

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

  // Format image URL
  const getFormattedImageUrl = (url: string) => {
    if (!url) return '';
    
    if (url.startsWith('/uploads')) {
      return `${window.location.origin}${url}`;
    }
    
    return url;
  };

  // Generate creator initials for avatar
  const getCreatorInitial = () => {
    return `U${event.userId || ''}`;
  };

  // Generate creator color based on userId
  const getCreatorColor = () => {
    const colors = [
      '#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33F0',
      '#33FFF0', '#F0FF33', '#FF3333', '#33FF33', '#3333FF'
    ];
    
    if (!event.userId) return colors[0];
    return colors[event.userId % colors.length];
  };

  return (
    <div 
      onClick={() => onShowDetails(event)}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-lg"
    >
      {/* Image Section */}
      <div 
        className="h-40 bg-neutral-200 relative" 
        onClick={handleImageClick}
      >
        {firstImage ? (
          <img 
            src={getFormattedImageUrl(firstImage)} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={40} className="text-gray-400" />
          </div>
        )}
        
        {/* Multiple images indicator */}
        {totalImages > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center">
            <ImageIcon size={12} className="mr-1" />
            <span>{totalImages}</span>
          </div>
        )}
        
        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow hover:bg-gray-100"
        >
          <Heart size={18} />
        </button>
      </div>
      
      {/* Content Section */}
      <div className="p-4">
        {/* Category and Attendees Row */}
        <div className="flex justify-between items-center mb-3">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryStyles(event.category || '')}`}>
            {event.category || 'General'}
          </span>
          
          <span className="text-xs text-gray-500 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {event.attendees || 0}
          </span>
        </div>
        
        {/* Creator Row - SIMPLIFIED AND GUARANTEED TO SHOW */}
        <div className="flex items-center mb-3">
          <div 
            onClick={handleCreatorClick} 
            className="flex items-center cursor-pointer"
          >
            <div 
              style={{backgroundColor: getCreatorColor()}}
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2"
            >
              {getCreatorInitial()}
            </div>
            <span className="text-xs text-gray-600">
              by Event Creator {event.userId}
            </span>
          </div>
        </div>
        
        {/* Event Title */}
        <h3 className="font-bold text-gray-800 mb-1">
          {event.title}
        </h3>
        
        {/* Event Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {event.description}
        </p>
        
        {/* Date */}
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {event.date}
        </div>
        
        {/* Location */}
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {event.location}
        </div>
        
        {/* Buttons */}
        <div className="flex justify-between pt-2 border-t border-gray-100">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onShowDetails(event);
            }}
            className="text-blue-600 text-sm font-medium flex items-center hover:text-blue-800"
          >
            Details
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
          
          <button 
            onClick={(e) => e.stopPropagation()}
            className="border border-blue-600 text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50"
          >
            Register
          </button>
        </div>
      </div>
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
