import { useState, useCallback, memo, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Event } from '@shared/schema';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem'
};

const defaultCenter = {
  lat: -33.918861,
  lng: 18.423300 // Cape Town, South Africa
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true
};

interface GoogleMapComponentProps {
  selectedEvent?: Event | null;
  onEventSelect?: (event: Event) => void;
  events?: Event[];
  height?: string;
  address?: string;
  onAddressSelect?: (place: google.maps.places.PlaceResult) => void;
  isSelectable?: boolean;
}

// Cache for geocoded locations
const geocodeCache: Record<string, google.maps.LatLngLiteral> = {};

function GoogleMapComponent({
  selectedEvent,
  onEventSelect,
  events = [],
  height = '400px',
  address,
  onAddressSelect,
  isSelectable = false
}: GoogleMapComponentProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeMarker, setActiveMarker] = useState<number | null>(null);
  const [center, setCenter] = useState(defaultCenter);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setMap(map);
    
    // If we have a specific address, try to geocode it and center the map
    if (address) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          setCenter({ lat: location.lat(), lng: location.lng() });
          map.setCenter(location);
          map.setZoom(15);
        }
      });
    }
    
    // If we have the search box functionality enabled
    if (isSelectable) {
      const input = document.getElementById('pac-input') as HTMLInputElement;
      if (input) {
        const searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
        
        searchBox.addListener('places_changed', () => {
          const places = searchBox.getPlaces();
          if (places && places.length > 0) {
            const place = places[0];
            if (place.geometry && place.geometry.location) {
              map.setCenter(place.geometry.location);
              map.setZoom(15);
              
              if (onAddressSelect) {
                onAddressSelect(place);
              }
            }
          }
        });
        
        searchBoxRef.current = searchBox;
      }
    }
  }, [address, isSelectable, onAddressSelect]);

  const onUnmount = useCallback(() => {
    setMap(null);
    mapRef.current = null;
  }, []);

  const geocodeEventLocations = useCallback(async () => {
    const geocoder = new google.maps.Geocoder();
    
    for (const event of events) {
      if (!event.location || geocodeCache[event.location]) continue;
      
      try {
        await new Promise<void>((resolve, reject) => {
          geocoder.geocode({ address: event.location }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const location = results[0].geometry.location;
              geocodeCache[event.location!] = { lat: location.lat(), lng: location.lng() };
              resolve();
            } else {
              console.error(`Geocoding failed for location: ${event.location}, status: ${status}`);
              resolve(); // Still resolve to continue with other locations
            }
          });
        });
      } catch (error) {
        console.error(`Error geocoding location for event ${event.id}:`, error);
      }
    }
  }, [events]);

  // Geocode event locations once map is loaded
  if (isLoaded && map && events.length > 0) {
    geocodeEventLocations();
  }

  const handleMarkerClick = (eventId: number) => {
    setActiveMarker(activeMarker === eventId ? null : eventId);
    const event = events.find(e => e.id === eventId);
    if (event && onEventSelect) {
      onEventSelect(event);
    }
  };

  if (!isLoaded) {
    return <div className="flex items-center justify-center" style={{ height }}>Loading Maps...</div>;
  }

  return (
    <div style={{ height, width: '100%', position: 'relative' }}>
      {isSelectable && (
        <input
          id="pac-input"
          className="controls"
          type="text"
          placeholder="Search for a location"
          style={{
            boxSizing: 'border-box',
            border: '1px solid transparent',
            width: '240px',
            height: '32px',
            padding: '0 12px',
            borderRadius: '3px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
            fontSize: '14px',
            outline: 'none',
            textOverflow: 'ellipsis',
            position: 'absolute',
            left: '50%',
            marginLeft: '-120px',
            marginTop: '10px',
            zIndex: 1
          }}
        />
      )}
      
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {events.map(event => {
          if (!event.location || !geocodeCache[event.location]) return null;
          
          const position = geocodeCache[event.location];
          
          return (
            <Marker
              key={event.id}
              position={position}
              onClick={() => handleMarkerClick(event.id)}
            >
              {activeMarker === event.id && (
                <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                  <div className="p-2">
                    <h3 className="font-bold text-sm">{event.title}</h3>
                    <p className="text-xs mt-1">{event.location}</p>
                    <p className="text-xs mt-1">{new Date(event.date).toLocaleDateString()} • {event.time}</p>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          );
        })}
        
        {/* If we have a specific address to show (for event creation/edit) */}
        {address && geocodeCache[address] && (
          <Marker position={geocodeCache[address]} />
        )}
      </GoogleMap>
    </div>
  );
}

export default memo(GoogleMapComponent);