import type { VercelRequest, VercelResponse } from '@vercel/node';
import {memStorage, storage} from '../../../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const eventId = parseInt(req.params.id);
        const userId = parseInt(req.params.userId);

        // Verify the requesting user is the same as the userId parameter
        if (req.session.userId !== userId) {
            return res.status(403).json({ message: "Not authorized to view this ticket" });
        }

        // Find tickets for this user and event
        const tickets = await memStorage.getUserTickets(userId);
        const eventTicket = tickets.find(ticket =>
            ticket.eventId === eventId && ticket.paymentStatus === 'completed'
        );

        res.json(eventTicket || null);
    } catch (error: any) {
        console.error('Error fetching user event ticket:', error);
        res.status(500).json({ message: error.message || "Error fetching user event ticket" });
    }



}