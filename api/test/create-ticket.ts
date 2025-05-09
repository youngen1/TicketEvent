import {paystackService} from "../../server/services/paystackService";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {memStorage, storage} from "../../server/storage";
import type {InsertEventTicket} from "../../shared/schema";


export default async function handler(req: VercelRequest,res: VercelResponse) {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const { eventId, quantity = 1, amount = 1500, ticketTypeId } = req.body;

        if (!eventId) {
            return res.status(400).json({ message: "Event ID is required" });
        }

        // Verify event exists
        const event = await storage.getEvent(parseInt(eventId));
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Check if the user already has a ticket for this event
        const hasTicket = await storage.hasUserPurchasedEventTicket(req.session.userId, parseInt(eventId));
        if (hasTicket) {
            return res.status(400).json({
                message: "You cannot buy two tickets for yourself. You already have a ticket for this event."
            });
        }

        // If ticket type ID is provided, fetch ticket type details and validate
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

        console.log('Creating test ticket for event:', eventId, 'with amount:', amount);

        // Create a reference
        const reference = `${eventId}-${Date.now()}-${req.session.userId}-test`;

        // Create the ticket
        const ticket = await memStorage.createTicket({
            userId: req.session.userId,
            eventId: parseInt(eventId),
            quantity: parseInt(quantity.toString()),
            ticketTypeId: ticketTypeId ? parseInt(ticketTypeId) : null,
            totalAmount: parseFloat(amount.toString()),
            paymentReference: reference,
            paymentStatus: "completed"
        } as InsertEventTicket);

        res.json({
            success: true,
            message: "Temporary test ticket created while fixing Paystack integration",
            ticket
        });
    } catch (error: any) {
        console.error('Error creating test ticket:', error);
        res.status(500).json({ message: error.message || "Error creating test ticket" });
    }

}