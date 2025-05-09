import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage'; // Adjust path
import { insertEventSchema, type InsertEvent } from '../../shared/schema'; // Adjust path
import { requireAuth } from '../../server/utils/authUtils'; // Adjust path




export async function handler(req: VercelRequest,res: VercelResponse)
    {
    // --- Handle GET /api/events ---
    if (req.method === 'GET') {
        try {
            const category = req.query.category as string | undefined;
            const tags = req.query.tags as string | undefined;
            const featured = req.query.featured === 'true' ? true : undefined;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 7;
            const offset = (page - 1) * limit;

            // Assuming storage.getAllEvents can handle these filters
            const allFilteredEvents = await storage.getAllEvents(category, tags, featured);
            const totalCount = allFilteredEvents.length;
            const totalPages = Math.ceil(totalCount / limit);

            // Apply pagination after filtering and getting total count
            const events = allFilteredEvents.slice(offset, offset + limit);

            return res.status(200).json({
                events,
                pagination: { page, limit, totalCount, totalPages, hasMore: page < totalPages },
            });
        } catch (error) {
            console.error('Error fetching events:', error);
            return res.status(500).json({ message: 'Error fetching events' });
        }
    }

    // --- Handle POST /api/events ---
    if (req.method === 'POST') {
        const authenticatedUser = await requireAuth(req, res); // Uses JWT to authenticate
        if (!authenticatedUser) {
            // requireAuth already sent a 401 response if not authenticated
            return;
        }

        try {
            // Assuming JSON body from the client, including a pre-uploaded video URL if applicable
            // and ticketTypes as an array of objects if hasMultipleTicketTypes is true.
            const requestBody = req.body;

            // Prepare event data for validation and creation
            const eventInput: Partial<InsertEvent> = { // Use Partial<InsertEvent> initially
                ...requestBody,
                userId: authenticatedUser.id, // Set by the authenticated user
                // createdById: authenticatedUser.id, // If your schema has this, storage.createEvent might handle it or you set it here
                // `video` field would be part of requestBody if client sends S3 URL
                // `images` field (JSON string of URLs) would also be part of requestBody
            };

            // Ensure numeric fields are numbers if they come as strings from JSON
            if (requestBody.maxAttendees) eventInput.maxAttendees = parseInt(requestBody.maxAttendees, 10);
            if (requestBody.price && typeof requestBody.price === 'string') eventInput.price = requestBody.price; // Keep as string for schema

            // Handle boolean flags that might come as strings
            eventInput.isFree = requestBody.isFree === 'true' || requestBody.isFree === true;
            eventInput.featured = requestBody.featured === 'true' || requestBody.featured === true;
            eventInput.hasMultipleTicketTypes = requestBody.hasMultipleTicketTypes === 'true' || requestBody.hasMultipleTicketTypes === true;


            // Extract ticketTypes if present
            let ticketTypesToCreate: any[] = []; // Define an appropriate type for ticketType
            if (eventInput.hasMultipleTicketTypes && Array.isArray(requestBody.ticketTypes)) {
                ticketTypesToCreate = requestBody.ticketTypes;
            }
            // Remove ticketTypes from eventInput as it's not part of insertEventSchema directly for the event table
            // but handled separately if `hasMultipleTicketTypes` is true.
            const { ticketTypes, ...eventDataForValidation } = eventInput;


            const validation = insertEventSchema.safeParse(eventDataForValidation);
            if (!validation.success) {
                return res.status(400).json({
                    message: 'Invalid event data',
                    errors: validation.error.format(),
                });
            }

            // `validation.data` is now the correctly typed data for storage.createEvent
            const newEvent = await storage.createEvent(validation.data as InsertEvent); // Cast if needed

            // If the event has multiple ticket types, create them
            if (newEvent && eventInput.hasMultipleTicketTypes && ticketTypesToCreate.length > 0) {
                for (const ticketTypeData of ticketTypesToCreate) {
                    // Validate and prepare ticketTypeData here if needed
                    // Example: ensure price and quantity are numbers
                    await storage.createTicketType({
                        eventId: newEvent.id,
                        name: ticketTypeData.name,
                        description: ticketTypeData.description || '',
                        price: String(ticketTypeData.price), // Ensure price is string for schema
                        quantity: parseInt(ticketTypeData.quantity, 10),
                        isActive: ticketTypeData.isActive === undefined ? true : ticketTypeData.isActive,
                        // soldCount: 0, // storage.createTicketType should handle default
                    });
                }
            }

            return res.status(201).json(newEvent);
        } catch (error: any) {
            console.error('Error creating event:', error);
            return res.status(500).json({ message: error.message || 'Error creating event' });
        }
    }


    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}