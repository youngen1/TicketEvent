// api/events/[id]/index.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../server/storage'; // Adjust path
import { insertEventSchema, type Event as EventType, type InsertEvent } from '../../../shared/schema'; // Adjust path
import { requireAuth, requireAdmin } from '../../../server/utils/authUtils'; // Adjust path

// File upload considerations for PUT are the same as for POST /api/events:
// Assume client sends pre-uploaded S3/Cloudinary URL in JSON body for simplicity.

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const eventIdString = req.query.id as string; // 'id' comes from the folder name [id]
    if (!eventIdString) {
        return res.status(400).json({ message: 'Event ID is required in the path.' });
    }
    const eventId = parseInt(eventIdString, 10);
    if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid Event ID format.' });
    }

    // --- Handle GET /api/events/:id ---
    if (req.method === 'GET') {
        try {
            const event = await storage.getEvent(eventId);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }
            // Optionally increment views (if you have such logic)
            // await storage.incrementEventViews(eventId); // Make sure this method exists
            return res.status(200).json(event);
        } catch (error) {
            console.error(`Error fetching event ${eventId}:`, error);
            return res.status(500).json({ message: 'Error fetching event details' });
        }
    }

    // --- Handle PUT /api/events/:id ---
    if (req.method === 'PUT') {
        const authenticatedUser = await requireAuth(req, res);
        if (!authenticatedUser) return; // Handles 401 response

        try {
            const existingEvent = await storage.getEvent(eventId);
            if (!existingEvent) {
                return res.status(404).json({ message: 'Event not found' });
            }

            // Permission check: User must be the event creator or an admin
            if (existingEvent.userId !== authenticatedUser.id && !authenticatedUser.isAdmin) {
                return res.status(403).json({ message: 'You do not have permission to update this event' });
            }

            const requestBody = req.body;
            const updateData: Partial<InsertEvent> = { ...requestBody };

            // Handle file URL from JSON body (Strategy 1 for uploads)
            if (requestBody.video) updateData.video = requestBody.video;
            if (requestBody.images) updateData.images = requestBody.images; // Assuming it's a JSON string of URLs

            // Ensure numeric/boolean fields are correctly typed if coming as strings
            if (requestBody.maxAttendees) updateData.maxAttendees = parseInt(requestBody.maxAttendees, 10);
            if (requestBody.price && typeof requestBody.price === 'string') updateData.price = requestBody.price;
            if (requestBody.isFree !== undefined) updateData.isFree = requestBody.isFree === 'true' || requestBody.isFree === true;
            if (requestBody.featured !== undefined) updateData.featured = requestBody.featured === 'true' || requestBody.featured === true;
            if (requestBody.hasMultipleTicketTypes !== undefined) updateData.hasMultipleTicketTypes = requestBody.hasMultipleTicketTypes === 'true' || requestBody.hasMultipleTicketTypes === true;


            // It's good practice to only allow updating certain fields.
            // For full updates, ensure your schema validates everything.
            // Using .partial() with Zod for updates can be useful if you want to allow partial updates.
            // const validation = insertEventSchema.partial().safeParse(updateData);
            // For this example, we'll assume `updateData` is what you intend to pass to `storage.updateEvent`.
            // `storage.updateEvent` should internally only update fields that are actually present in `updateData`.

            // For simplicity, we're not re-validating the entire schema on PUT here,
            // but in a robust app, you might want to, especially if allowing many fields to change.
            // Or, have a separate updateEventSchema.
            // For now, directly pass filtered updateData.

            // Filter out fields that shouldn't be updated directly or are undefined
            const allowedUpdates: Partial<EventType> = {};
            const updatableFields: (keyof InsertEvent)[] = [
                'title', 'description', 'date', 'time', 'location', 'latitude', 'longitude',
                'image', 'images', 'video', 'featured', 'category', 'maxAttendees',
                'isFree', 'price', 'tags', 'hasMultipleTicketTypes', 'totalTickets', // totalTickets might be auto-calculated
                'genderRestriction', 'ageRestriction'
            ];

            for (const key of updatableFields) {
                if (updateData[key] !== undefined) {
                    (allowedUpdates as any)[key] = updateData[key];
                }
            }

            if (Object.keys(allowedUpdates).length === 0) {
                return res.status(400).json({ message: "No valid fields provided for update." });
            }


            const updatedEvent = await storage.updateEvent(eventId, allowedUpdates);
            return res.status(200).json(updatedEvent);

        } catch (error: any) {
            console.error(`Error updating event ${eventId}:`, error);
            return res.status(500).json({ message: error.message || 'Error updating event' });
        }
    }

    // --- Handle DELETE /api/events/:id ---
    if (req.method === 'DELETE') {
        const authenticatedUser = await requireAuth(req, res);
        if (!authenticatedUser) return;

        try {
            const eventToDelete = await storage.getEvent(eventId);
            if (!eventToDelete) {
                return res.status(404).json({ message: 'Event not found' });
            }

            // Permission check: User must be the event creator or an admin
            if (eventToDelete.userId !== authenticatedUser.id && !authenticatedUser.isAdmin) {
                return res.status(403).json({ message: 'You do not have permission to delete this event' });
            }

            await storage.deleteEvent(eventId);
            // `deleteEvent` in storage should also handle deleting associated comments, tickets, etc.

            return res.status(200).json({ message: 'Event deleted successfully' });
            // Or res.status(204).end(); for No Content response
        } catch (error: any) {
            console.error(`Error deleting event ${eventId}:`, error);
            return res.status(500).json({ message: error.message || 'Error deleting event' });
        }
    }

    // --- Method Not Allowed ---
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}