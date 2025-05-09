import type { VercelRequest, VercelResponse } from '@vercel/node';
import {memStorage, storage} from "../../server/storage";
import type {InsertEventTicket} from "../../shared/schema";


export default async function handler(req: VercelRequest,res: VercelResponse) {
    try {
        const { eventId, ticketTypeId } = req.body;

        if (!eventId) {
            return res.status(400).json({ message: "Missing eventId" });
        }

        if (!req.session.userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        // Verify the event exists and is free
        const event = await storage.getEvent(parseInt(eventId));
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        if (!event.isFree && parseFloat(event.price || '0') > 0) {
            return res.status(400).json({ message: "This is not a free event" });
        }

        // Check if the user already has a ticket for this event
        const hasTicket = await storage.hasUserPurchasedEventTicket(req.session.userId, parseInt(eventId));
        if (hasTicket) {
            return res.status(400).json({ message: "You cannot buy two tickets for yourself. You already have a ticket for this event." });
        }

        // If ticket type ID is provided, fetch ticket type details
        if (ticketTypeId) {
            const ticketType = await storage.getTicketType(parseInt(ticketTypeId));
            if (!ticketType) {
                return res.status(404).json({ message: "Ticket type not found" });
            }

            // Check if tickets are available
            if (ticketType.quantity <= (ticketType.soldCount || 0)) {
                return res.status(400).json({ message: "This ticket type is sold out" });
            }
        }

        // Generate a unique reference for the free ticket
        const reference = `free-${eventId}-${Date.now()}-${req.session.userId}`;

        // Create a completed ticket for the free event
        const ticket = await memStorage.createTicket({
            userId: req.session.userId,
            eventId: parseInt(eventId),
            quantity: 1,
            ticketTypeId: ticketTypeId ? parseInt(ticketTypeId) : null,
            totalAmount: 0, // Free ticket
            paymentReference: reference,
            paymentStatus: "completed" // Mark as completed since it's free
        } as InsertEventTicket);

        // Return success response
        res.status(201).json({
            success: true,
            message: "Free ticket registered successfully",
            data: { ticket }
        });

    } catch (error: any) {
        console.error('Error registering free ticket:', error);
        res.status(500).json({
            message: error.message || "Error registering free ticket"
        });
    }


}