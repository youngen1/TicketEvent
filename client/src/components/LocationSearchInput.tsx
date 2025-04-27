import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface LocationSearchInputProps {
  value: string;
  onChange: (value: string, placeDetails?: google.maps.places.PlaceResult) => void;
  placeholder?: string;
}

export default function LocationSearchInput({ 
  value, 
  onChange, 
  placeholder = "Enter location" 
}: LocationSearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { toast } = useToast();
  const [isApiLoaded, setIsApiLoaded] = useState(false);

  useEffect(() => {
    // Check if the Google Maps API is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      initializeAutocomplete();
      return;
    }

    // Check if the script is already being loaded
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      // If it's already loading, wait for it to finish
      const handleScriptLoad = () => {
        initializeAutocomplete();
        existingScript.removeEventListener('load', handleScriptLoad);
      };
      existingScript.addEventListener('load', handleScriptLoad);
      return;
    }

    // Load the script if it's not already loaded or loading
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setIsApiLoaded(true);
      initializeAutocomplete();
    };
    
    script.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to load Google Maps. Please try again.",
        variant: "destructive",
      });
    };
    
    document.head.appendChild(script);
    
    return () => {
      // Cleanup - remove event listeners but don't remove the script
      // as other components might be using it
      if (existingScript) {
        existingScript.removeEventListener('load', initializeAutocomplete);
      }
    };
  }, []);

  const initializeAutocomplete = () => {
    if (!inputRef.current) return;
    
    try {
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode', 'establishment'],
      });
      
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
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