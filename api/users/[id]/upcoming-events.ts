import type { VercelRequest, VercelResponse } from '@vercel/node';
import {memStorage, storage} from '../../../server/storage';

export default async function handler(req: VercelRequest, res:VercelResponse) {
    try {
        const userId = parseInt(req.params.id);

        // Verify user exists
        const user = await storage.getUser(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get upcoming events the user is attending
        const upcomingEvents = await storage.getUpcomingUserEvents(userId);

        res.json(upcomingEvents);
    } catch (error: any) {
        console.error('Error fetching upcoming events:', error);
        res.status(500).json({ message: error.message || "Error fetching upcoming events" });
    }

}