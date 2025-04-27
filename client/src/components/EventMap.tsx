import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { Event } from '@shared/schema';
import 'leaflet/dist/leaflet.css';

// Fix for the marker icon issue with React and webpack
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Interface for geocoded locations
interface GeocodedLocation {
  lat: number;
  lng: number;
  address: string;
  original: string;
}

interface EventMapProps {
  selectedEvent?: Event | null;
  onEventSelect?: (event: Event) => void;
  height?: string;
}

export default function EventMap({ selectedEvent, onEventSelect, height = '400px' }: EventMapProps) {
  const [eventLocations, setEventLocations] = useState<Map<number, GeocodedLocation>>(new Map());
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]); // Default to NYC
  const [mapZoom, setMapZoom] = useState(12);

  // Fetch events
  const { data: events = [] } = useQuery({
    queryKey: ['/api/events'],
  });

  // Geocode a location string to get coordinates
  const geocodeLocation = async (locationStr: string): Promise<GeocodedLocation | null> => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationStr)}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          address: data[0].display_name,
          original: locationStr
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error geocoding location:', error);
      return null;
    }
  };

  // Batch geocode all event locations
  useEffect(() => {
    const geocodeEvents = async () => {
      const newEventLocations = new Map<number, GeocodedLocation>();
      
      // Check if we already have all locations cached
      const missingLocations = events.filter((event: Event) => 
        event.location && !eventLocations.has(event.id)
      );
      
      if (missingLocations.length === 0) return;
      
      for (const event of missingLocations) {
        if (!event.location) continue;
        
        try {
          // Add a delay to avoid rate limiting with the geocoding API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const geocoded = await geocodeLocation(event.location);
          if (geocoded) {
            newEventLocations.set(event.id, geocoded);
          }
        } catch (error) {
          console.error(`Error geocoding location for event ${event.id}:`, error);
        }
      }
      
      // Merge new locations with existing ones
      setEventLocations(prevLocations => {
        const mergedLocations = new Map(prevLocations);
        newEventLocations.forEach((value, key) => {
          mergedLocations.set(key, value);
        });
        return mergedLocations;
      });
    };
    
    if (events.length > 0) {
      geocodeEvents();
    }
  }, [events]);

  // When a selectedEvent is provided, center the map on that event
  useEffect(() => {
    if (selectedEvent && eventLocations.has(selectedEvent.id)) {
      const location = eventLocations.get(selectedEvent.id);
      if (location) {
        setMapCenter([location.lat, location.lng]);
        setMapZoom(14);
      }
    }
  }, [selectedEvent, eventLocations]);

  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {events.map((event: Event) => {
          const location = eventLocations.get(event.id);
          if (!location) return null;
          
          return (
            <Marker 
              key={event.id}
              position={[location.lat, location.lng]}
              icon={defaultIcon}
              eventHandlers={{
                click: () => {
                  if (onEventSelect) {
                    onEventSelect(event);
                  }
                }
              }}
            >
              <Popup>
                <div className="text-sm">
                  <h3 className="font-bold mb-1">{event.title}</h3>
                  <p className="text-xs mb-1">{event.date} • {event.time}</p>
                  <p className="text-xs">{location.address}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}