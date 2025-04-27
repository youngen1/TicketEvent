import { Image as ImageIcon } from "lucide-react";
import { Event } from "@shared/schema";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import "./EventCard.css";

interface EventCardProps {
  event: Event;
  onShowDetails: (event: Event, openFullscreen?: boolean) => void;
}

export default function EventCard({ event, onShowDetails }: EventCardProps) {
  const [, navigate] = useLocation();

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

  // Fetch creator information if available
  const { data: creator } = useQuery({
    queryKey: [`/api/users/${event.userId}`],
    queryFn: async () => {
      try {
        if (!event.userId) return null;
        const response = await fetch(`/api/users/${event.userId}`);
        if (response.ok) {
          return response.json();
        }
        return null;
      } catch (error) {
        console.error("Error fetching creator:", error);
        return null;
      }
    },
    enabled: !!event.userId,
  });

  // Get profile photo URL for creator
  const getProfilePhotoUrl = () => {
    // For this implementation, use real profile photos from an API
    return `https://randomuser.me/api/portraits/${event.userId && event.userId % 2 === 0 ? 'women' : 'men'}/${(event.userId || 1) % 99}.jpg`;
  };

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

  // Get creator initials for avatar fallback
  const getCreatorInitials = () => {
    return creator?.username?.charAt(0).toUpperCase() || `R${event.userId || 1}`;
  };

  return (
    <div 
      className="event-card" 
      onClick={() => onShowDetails(event)}
    >
      <div className="event-image">
        {firstImage ? (
          <img 
            src={getFormattedImageUrl(firstImage)} 
            alt={event.title}
            onClick={handleImageClick}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <ImageIcon size={40} className="text-gray-400" />
          </div>
        )}
        
        {/* Creator avatar with profile photo */}
        <div 
          className="creator-avatar"
          onClick={handleCreatorClick}
          style={{
            backgroundImage: `url(${getProfilePhotoUrl()})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      </div>
      
      <div className="event-content">
        <div className="event-header">
          {/* Creator badge with profile photo */}
          <div 
            className="creator-badge" 
            onClick={handleCreatorClick}
            style={{
              backgroundImage: `url(${getProfilePhotoUrl()})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'transparent'
            }}
          >
            {getCreatorInitials()}
          </div>
          <div className="category-badge">
            {event.category || 'General'}
          </div>
        </div>
        
        <div className="event-date">
          {formatDate(event.date || '')}
        </div>
        
        <h3 className="event-title">
          {event.title}
        </h3>
        
        <div className="event-location">
          {event.location}
        </div>
        
        <p className="event-description">
          {event.description}
        </p>
      </div>
    </div>
  );
}
