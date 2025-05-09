// api/events/[id]/ticket-types.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../server/storage'; // Adjust path
import { insertTicketTypeSchema, type InsertTicketType, type TicketType } from '../../../shared/schema'; // Adjust path
import { getAuthenticatedUser, requireAuth } from '../../../server/utils/authUtils'; // Adjust path

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const eventIdString = req.query.id as string; // 'id' from the dynamic folder name `[id]`
    if (!eventIdString) {
        return res.status(400).json({ message: 'Event ID is required in the path.' });
    }
    const eventId = parseInt(eventIdString, 10);
    if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid Event ID format.' });
    }

    // --- First, ensure the event itself exists for any method ---
    let event;
    try {
        event = await storage.getEvent(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }
    } catch (error) {
        console.error(`Error fetching parent event ${eventId} for ticket types:`, error);
        return res.status(500).json({ message: 'Error validating event for ticket types.' });
    }

    // --- Handle GET /api/events/:id/ticket-types ---
    if (req.method === 'GET') {
        try {
            const ticketTypes = await storage.getEventTicketTypes(eventId);

            // Determine if the requester has permission to see all ticket types (active and inactive)
            // Regular users only see active ticket types.
            let canSeeAllTicketTypes = false;
            const authenticatedUser = await getAuthenticatedUser(req); // Doesn't block if not authenticated

            if (authenticatedUser) {
                if (event.userId === authenticatedUser.id || authenticatedUser.isAdmin) {
                    canSeeAllTicketTypes = true;
                }
            }

            const filteredTicketTypes = canSeeAllTicketTypes
                ? ticketTypes
                : ticketTypes.filter(type => type.isActive);

            return res.status(200).json(filteredTicketTypes);
        } catch (error) {
            console.error(`Error fetching ticket types for event ${eventId}:`, error);
            return res.status(500).json({ message: 'Error fetching ticket types.' });
        }
    }

    // --- Handle POST /api/events/:id/ticket-types ---
    if (req.method === 'POST') {
        const authenticatedUser = await requireAuth(req, res); // User must be authenticated
        if (!authenticatedUser) return; // requireAuth handles 401

        // Permission check: User must be the event owner or an admin
        if (event.userId !== authenticatedUser.id && !authenticatedUser.isAdmin) {
            return res.status(403).json({ message: 'You do not have permission to add ticket types to this event.' });
        }

        try {
            const requestBody = req.body;
            const ticketTypeInput: Omit<InsertTicketType, 'soldCount'> = { // soldCount usually defaults to 0
                eventId: eventId,
                name: requestBody.name,
                description: requestBody.description || null, // Ensure null if empty, or handle in schema
                price: String(requestBody.price), // Drizzle schema might expect string
                quantity: parseInt(requestBody.quantity, 10),
                isActive: requestBody.isActive === undefined ? true : (requestBody.isActive === 'true' || requestBody.isActive === true),
                // soldCount is typically initialized to 0 by storage.createTicketType or DB default
            };

            const validation = insertTicketTypeSchema.safeParse(ticketTypeInput);
            if (!validation.success) {
                return res.status(400).json({
                    message: 'Invalid ticket type data.',
                    errors: validation.error.format(),
                });
            }

            // `validation.data` is the safe data to pass to storage
            const newTicketType = await storage.createTicketType(validation.data as InsertTicketType);

            return res.status(201).json(newTicketType);
        } catch (error: any) {
            console.error(`Error creating ticket type for event ${eventId}:`, error);
            return res.status(500).json({ message: error.message || 'Error creating ticket type.' });
        }
    }

    // --- Method Not Allowed ---
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}