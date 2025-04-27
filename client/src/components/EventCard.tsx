import { Heart, Image as ImageIcon } from "lucide-react";
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

  // Click handlers
  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShowDetails(event, true);
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

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day} ${month} ${year} ${hours}:${minutes}`;
    } catch (error) {
      return dateString;
    }
  };

  // Get creator initials for avatar
  const getCreatorInitials = () => {
    return event.userId ? `R${event.userId}` : 'R1';
  };

  return (
    <div 
      onClick={() => onShowDetails(event)}
      className="bg-white shadow-sm overflow-hidden cursor-pointer mb-4 border border-gray-100"
    >
      {/* Event Image with Avatar */}
      <div className="relative">
        {firstImage ? (
          <img 
            src={getFormattedImageUrl(firstImage)} 
            alt={event.title}
            className="w-full h-48 object-cover" 
            onClick={handleImageClick}
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center bg-gray-200">
            <ImageIcon size={40} className="text-gray-400" />
          </div>
        )}

        {/* Creator Avatar */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            handleCreatorClick(e);
          }}
          className="absolute top-2 right-2 w-12 h-12 rounded-full overflow-hidden border-2 border-white cursor-pointer shadow-md"
          style={{
            backgroundColor: `rgb(${event.userId && event.userId % 3 === 0 ? '148, 49, 167' : event.userId && event.userId % 2 === 0 ? '239, 68, 68' : '59, 130, 246'})`
          }}
        >
          <div className="w-full h-full flex items-center justify-center text-white font-bold">
            {getCreatorInitials()}
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        {/* Creator Initials and Category Row */}
        <div className="flex justify-between items-center mb-2">
          <div 
            className="text-white text-sm font-semibold bg-purple-600 w-10 h-10 rounded flex items-center justify-center"
            onClick={handleCreatorClick}
          >
            {getCreatorInitials()}
          </div>
          
          <div className="px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
            {event.category || 'General'}
          </div>
        </div>
        
        {/* Date */}
        <div className="text-gray-600 text-sm mb-1">
          {formatDate(event.date || '')}
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-800 mb-1">
          {event.title}
        </h3>
        
        {/* Location */}
        <div className="text-gray-600 mb-2">
          {event.location}
        </div>
        
        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {event.description}
        </p>
      </div>
    </div>
  );
}
