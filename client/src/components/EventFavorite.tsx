import { useState } from "react";
import { Event } from "@shared/schema";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface EventFavoriteProps {
  event: Event;
  size?: 'sm' | 'default';
  variant?: 'ghost' | 'outline';
  showText?: boolean;
}

export default function EventFavorite({ 
  event,
  size = 'default',
  variant = 'ghost',
  showText = false
}: EventFavoriteProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // In a real implementation, this would track actual favorite state
  // For now, just use a local state as placeholder
  const [isFavorite, setIsFavorite] = useState(false);
  
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to save events to your favorites",
        variant: "destructive",
      });
      return;
    }
    
    // Toggle the local state
    setIsFavorite(!isFavorite);
    
    // In a real implementation, this would call an API
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite 
        ? `${event.title} has been removed from your favorites` 
        : `${event.title} has been added to your favorites`,
      variant: "default",
    });
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      className="gap-1 group"
      onClick={handleToggleFavorite}
    >
      <Heart 
        className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-neutral-600 group-hover:text-red-500'} transition-colors`} 
      />
      {showText && (
        <span className={isFavorite ? 'text-red-500' : ''}>
          {isFavorite ? 'Saved' : 'Save'}
        </span>
      )}
    </Button>
  );
}