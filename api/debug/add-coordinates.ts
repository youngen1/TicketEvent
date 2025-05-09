import type { VercelRequest, VercelResponse } from '@vercel/node';

import { requireAuth, requireAdmin } from '../../server/utils/authUtils'; // Adjust path
import { createNotifications } from '../../server/create-notifications'; // Adjust path to your function that creates dummy notifications
import { storage } from '../../server/storage';


export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const coordinates = [
            // San Francisco, CA for Tech Innovation Summit
            { id: 1, latitude: '37.7749', longitude: '-122.4194' },

            // Austin, TX for Global Music Festival
            { id: 2, latitude: '30.2672', longitude: '-97.7431' },

            // New York, NY for Art Exhibition
            { id: 3, latitude: '40.7128', longitude: '-74.0060' },

            // London, UK for Digital Skills Workshop
            { id: 4, latitude: '51.5074', longitude: '-0.1278' },

            // Chicago, IL for Startup Competition
            { id: 5, latitude: '41.8781', longitude: '-87.6298' },

            // Paris, France for Culinary Masterclass
            { id: 6, latitude: '48.8566', longitude: '2.3522' },

            // Bali, Indonesia for Wellness Retreat
            { id: 7, latitude: '-8.3405', longitude: '115.0920' }
        ];

        // Update the events with coordinates
        for (const coord of coordinates) {
            try {
                await storage.updateEvent(coord.id, {
                    latitude: coord.latitude,
                    longitude: coord.longitude
                });
                console.log(`Updated event ${coord.id} with coordinates: ${coord.latitude}, ${coord.longitude}`);
            } catch (error) {
                console.error(`Error updating event ${coord.id}:`, error);
            }
        }

        res.json({
            status: 'ok',
            message: 'Coordinates added to mock events',
            coordinates
        });
    } catch (error) {
        console.error('Error updating coordinates:', error);
        res.status(500).json({
            message: 'Error updating coordinates',
            error: String(error)
        });
    }
}