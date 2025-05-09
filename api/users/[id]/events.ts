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

        // Get events created by the user
        const events = await storage.getUserEvents(userId);

        res.json(events);
    } catch (error: any) {
        console.error('Error fetching user events:', error);
        res.status(500).json({ message: error.message || "Error fetching user events" });
    }

}