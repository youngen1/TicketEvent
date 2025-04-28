import { Image as ImageIcon, MapPin } from "lucide-react";
import { Event } from "@shared/schema";
import { calculateDistance } from "@/lib/utils";
import { useEffect, useState } from "react";

interface EventCardProps {
  event: Event;
  onShowDetails: (event: Event, openFullscreen?: boolean) => void;
}

export default function EventCard({ event, onShowDetails }: EventCardProps) {
  const [userCoordinates, setUserCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  
  // Get user's current coordinates if available
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  }, []);
  
  // Calculate distance when coordinates are available
  useEffect(() => {
    if (userCoordinates && event.latitude && event.longitude) {
      const calculatedDistance = calculateDistance(
        userCoordinates.lat,
        userCoordinates.lng,
        event.latitude,
        event.longitude
      );
      setDistance(calculatedDistance);
    }
  }, [userCoordinates, event.latitude, event.longitude]);

  // Get image data
  let firstImage = event.image || '';
  
  if (event.images) {
    try {
      const imagesArray = JSON.parse(event.images);
      if (imagesArray.length > 0) {
        firstImage = imagesArray[0];
      }
    } catch (e) {
      console.error('Failed to parse images:', e);
    }
  }

  // Format image URL
  const getFormattedImageUrl = (url: string) => {
    if (!url) return '';
    
    if (url.startsWith('/uploads')) {
      return `${window.location.origin}${url}`;
    }
    
    return url;
  };

  // Format date
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

  return (
    <div 
      className="bg-white rounded-md shadow-sm mb-4 overflow-hidden cursor-pointer"
      onClick={() => onShowDetails(event)}
    >
      {/* Event Image */}
      <div className="w-full h-48 bg-gray-100 relative">
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
        
        {/* Distance badge (if available) */}
        {distance !== null && (
          <div className="absolute bottom-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <MapPin size={12} className="mr-1" />
            <span>{distance} km</span>
          </div>
        )}
      </div>
      
      {/* Event Details */}
      <div className="p-4">
        <div className="flex justify-between mb-2">
          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
            {event.category || 'General'}
          </span>
        </div>
        
        <div className="text-gray-600 text-sm mb-2">
          {formatDate(event.date || '')}
        </div>
        
        <h3 className="font-bold text-xl mb-2 text-gray-800">
          {event.title}
        </h3>
        
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin size={16} className="mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{event.location}</span>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-2">
          {event.description}
        </p>
      </div>
    </div>
  );
}
