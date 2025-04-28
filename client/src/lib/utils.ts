import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

/**
 * Calculate the distance between two coordinates in kilometers using the Haversine formula
 * @param lat1 Latitude of first point in decimal degrees
 * @param lon1 Longitude of first point in decimal degrees
 * @param lat2 Latitude of second point in decimal degrees
 * @param lon2 Longitude of second point in decimal degrees
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: string | number | null, 
  lon1: string | number | null, 
  lat2: string | number | null, 
  lon2: string | number | null
): number | null {
  // If any coordinates are missing, return null
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) {
    return null;
  }
  
  // Convert string inputs to numbers if needed
  const latitude1 = typeof lat1 === 'string' ? parseFloat(lat1) : lat1;
  const longitude1 = typeof lon1 === 'string' ? parseFloat(lon1) : lon1;
  const latitude2 = typeof lat2 === 'string' ? parseFloat(lat2) : lat2;
  const longitude2 = typeof lon2 === 'string' ? parseFloat(lon2) : lon2;
  
  // If any of the parsed values are NaN, return null
  if (isNaN(latitude1) || isNaN(longitude1) || isNaN(latitude2) || isNaN(longitude2)) {
    return null;
  }
  
  // Convert latitude and longitude from degrees to radians
  const toRadians = (degrees: number) => degrees * Math.PI / 180;
  const lat1Rad = toRadians(latitude1);
  const lon1Rad = toRadians(longitude1);
  const lat2Rad = toRadians(latitude2);
  const lon2Rad = toRadians(longitude2);
  
  // Haversine formula
  const dLat = lat2Rad - lat1Rad;
  const dLon = lon2Rad - lon1Rad;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  // Earth's radius in kilometers
  const earthRadius = 6371; 
  const distance = earthRadius * c;
  
  // Return the distance rounded to 1 decimal place
  return Math.round(distance * 10) / 10;
}
