import type { VercelRequest, VercelResponse } from '@vercel/node';
import {memStorage, storage} from '../../../server/storage';



export default async function handler(req: VercelRequest, res: VercelResponse){
    try {
        const eventId = parseInt(req.params.id);
        const event = await storage.getEvent(eventId);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        const tickets = await memStorage.getEventTickets(eventId);

        // Filter tickets to completed only
        const completedTickets = tickets.filter(ticket =>
            ticket.paymentStatus === 'completed'
        );

        // Create a map to deduplicate users and sum up their tickets
        const attendeeMap = new Map();

        for (const ticket of completedTickets) {
            const user = await storage.getUser(ticket.userId);
            if (!user) continue;

            if (!attendeeMap.has(user.id)) {
                attendeeMap.set(user.id, {
                    id: ticket.id,
                    userId: user.id,
                    username: user.username,
                    displayName: user.displayName || user.username,
                    avatar: user.avatar,
                    quantity: ticket.quantity,
                    purchaseDate: ticket.purchaseDate
                });
            } else {
                // Update existing attendee's ticket count
                const attendee = attendeeMap.get(user.id);
                attendee.quantity += ticket.quantity;
            }
        }

        res.json(Array.from(attendeeMap.values()));
    } catch (error: any) {
        console.error('Error fetching ticket attendees:', error);
        res.status(500).json({ message: error.message || "Error fetching ticket attendees" });
    }


}