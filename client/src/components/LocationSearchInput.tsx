import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface LocationSearchInputProps {
  value: string;
  onChange: (value: string, placeDetails?: google.maps.places.PlaceResult) => void;
  onCoordinatesChange?: (latitude: string, longitude: string) => void;
  placeholder?: string;
}

export default function LocationSearchInput({ 
  value, 
  onChange, 
  onCoordinatesChange,
  placeholder = "Enter location" 
}: LocationSearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { toast } = useToast();
  const [isApiLoaded, setIsApiLoaded] = useState(false);

  useEffect(() => {
    let handleScriptLoad: () => void;

    // Function to initialize Google Places Autocomplete
    const setupAutocomplete = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        initializeAutocomplete();
        setIsApiLoaded(true);
      }
    };

    // Check if the Google Maps API is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setupAutocomplete();
      return;
    }

    // Check if the script is already being loaded
    const existingScript = document.getElementById('google-maps-script') as HTMLScriptElement | null;
    
    if (existingScript) {
      // If it's already loading, wait for it to finish
      handleScriptLoad = () => {
        setupAutocomplete();
      };
      
      existingScript.addEventListener('load', handleScriptLoad);
      return () => {
        if (existingScript) {
          existingScript.removeEventListener('load', handleScriptLoad);
        }
      };
    }

    // Access API key directly from window._env or fall back to hardcoded value
    const apiKey = (window as any)._env?.GOOGLE_MAPS_API_KEY || 'AIzaSyAsvpRyz_UMpIJ63M86Yj-oSEHZlCQlN0o';
    
    // Load the script if it's not already loaded or loading
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    handleScriptLoad = () => {
      setupAutocomplete();
    };
    
    script.addEventListener('load', handleScriptLoad);
    
    script.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to load Google Maps. Please try again.",
        variant: "destructive",
      });
    };
    
    document.head.appendChild(script);
    
    // Cleanup function
    return () => {
      script.removeEventListener('load', handleScriptLoad);
    };
  }, [toast]);

  const initializeAutocomplete = () => {
    if (!inputRef.current) return;
    
    try {
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode', 'establishment'],
      });
      
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        // Extract the latitude and longitude if available
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat().toString();
          const lng = place.geometry.location.lng().toString();
          
          // Call the onCoordinatesChange callback if provided
          if (onCoordinatesChange) {
            onCoordinatesChange(lat, lng);
          }
        }
        
        if (place.formatted_address) {
          onChange(place.formatted_address, place);
        } else if (place.name) {
          onChange(place.name, place);
        }
      });
      
      autocompleteRef.current = autocomplete;
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
    }
  };

  return (
    <Input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full"
    />
  );
}