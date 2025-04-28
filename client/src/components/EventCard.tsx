import { Image as ImageIcon, MapPin, User as UserIcon } from "lucide-react";
import { Event, User } from "@shared/schema";
import { calculateDistance } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";

interface EventCardProps {
  event: Event;
  onShowDetails: (event: Event, openFullscreen?: boolean) => void;
}

export default function EventCard({ event, onShowDetails }: EventCardProps) {
  const [userCoordinates, setUserCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  
  // Fetch host data
  const { data: hostUser, isLoading: isHostLoading } = useQuery<User | null>({
    queryKey: [`/api/users/${event?.userId}`],
    queryFn: async () => {
      if (!event?.userId) return null;
      const res = await apiRequest("GET", `/api/users/${event.userId}`);
      return res.json();
    },
    enabled: !!event?.userId,
  });
  
  // Helper function to get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
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
          // Set default location for testing (Cape Town)
          setUserCoordinates({
            lat: -33.9249,
            lng: 18.4241
          });
        }
      );
    } else {
      // Set default location for testing (Cape Town)
      setUserCoordinates({
        lat: -33.9249,
        lng: 18.4241
      });
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
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {event.description}
        </p>
        
        {/* Host Profile Card */}
        <div className="border-t pt-3 mt-3">
          {isHostLoading ? (
            <div className="flex items-center space-x-2 animate-pulse">
              <div className="bg-gray-200 h-8 w-8 rounded-full"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          ) : hostUser ? (
            <div className="flex items-center space-x-2">
              <Link 
                href={`/users/${hostUser.id}`}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event card click
                }}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <Avatar className="h-8 w-8">
                  {hostUser.avatar ? (
                    <AvatarImage src={hostUser.avatar} alt={hostUser.displayName || hostUser.username} />
                  ) : null}
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials(hostUser.displayName || hostUser.username)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Hosted by {hostUser.displayName || hostUser.username}</p>
                </div>
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="bg-gray-100 h-8 w-8 rounded-full flex items-center justify-center">
                <UserIcon className="h-4 w-4" />
              </div>
              <p className="text-sm">Unknown host</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
