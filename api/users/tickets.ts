import type { VercelRequest, VercelResponse } from '@vercel/node';
import {memStorage, storage} from '../../server/storage'; // Adjust path
import { insertEventSchema, type InsertEvent } from '../../shared/schema'; // Adjust path
import { requireAuth } from '../../server/utils/authUtils';

export default async function handler(req: VercelRequest, res: VercelResponse){
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const tickets = await memStorage.getUserTickets(req.session.userId);

        // Fetch event details for each ticket
        const ticketsWithEventDetails = await Promise.all(
            tickets.map(async (ticket) => {
                const event = await storage.getEvent(ticket.eventId);
                return {
                    ...ticket,
                    event: event || null
                };
            })
        );

        res.json(ticketsWithEventDetails);
    } catch (error: any) {
        console.error('Error fetching user tickets:', error);
        res.status(500).json({ message: error.message || "Error fetching user tickets" });
    }

}