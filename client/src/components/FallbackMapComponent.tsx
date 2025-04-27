import React from 'react';
import { Event } from '@shared/schema';

interface FallbackMapComponentProps {
  selectedEvent?: Event | null;
  onEventSelect?: (event: Event) => void;
  events?: Event[];
  height?: string;
  address: string;
  onAddressSelect?: (place: any) => void;
  isSelectable?: boolean;
}

/**
 * A simple fallback map component when Google Maps can't be loaded
 */
function FallbackMapComponent({
  selectedEvent,
  events = [],
  height = '400px',
  address,
  isSelectable = false
}: FallbackMapComponentProps) {
  return (
    <div 
      className="flex flex-col items-center justify-center bg-gray-100 rounded-lg border border-gray-200"
      style={{ height, width: '100%' }}
    >
      <div className="text-center p-4">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="48" 
          height="48" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="mx-auto mb-4 text-gray-400"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        
        {selectedEvent ? (
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{selectedEvent.title}</h3>
            <p className="text-gray-500">{selectedEvent.location}</p>
          </div>
        ) : address ? (
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">Location</h3>
            <p className="text-gray-500">{address}</p>
          </div>
        ) : (
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">Map Unavailable</h3>
            <p className="text-gray-500">
              {events.length > 0 
                ? `${events.length} event location(s)` 
                : 'No location data available'}
            </p>
          </div>
        )}
        
        {isSelectable && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">Enter a location in the field above</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FallbackMapComponent;