// api/events/[id]/favorite.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
 // Adjust path to your storage.ts
import { requireAuth } from '../../../server/utils/authUtils'; // Adjust path to your authUtils.ts
import { storage } from '../../../server/storage';
// UserFavoriteType is not directly used in this file's logic,
// but it's what storage.toggleUserFavorite will return as part of its object.

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // We'll allow PUT or POST for this action.
    // PUT is idempotent (multiple identical requests have the same effect as one).
    // POST is also commonly used for actions that change state.
    if (req.method !== 'PUT' && req.method !== 'POST') {
        res.setHeader('Allow', ['PUT', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const eventIdString = req.query.id as string; // 'id' comes from the dynamic folder name `[id]`
    if (!eventIdString) {
        return res.status(400).json({ message: 'Event ID is required in the path.' });
    }

    const eventId = parseInt(eventIdString, 10);
    if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid Event ID format.' });
    }

    // Ensure the user is authenticated
    const authenticatedUser = await requireAuth(req, res);
    if (!authenticatedUser) {
        // requireAuth already sent a 401 response and ended the function if not authenticated
        return;
    }

    try {
        // 1. Check if the event actually exists to provide a more specific error if not.
        const eventExists = await storage.getEvent(eventId); // Assuming getEvent just fetches basic event info
        if (!eventExists) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        // 2. Call the storage method to toggle the favorite status for this user and event.
        // This method now handles the logic of checking current status and adding/removing.
        // It should return an object like: { isFavorited: boolean; favoriteEntry: UserFavoriteType | null }
        const result = await storage.toggleUserFavorite(authenticatedUser.id, eventId);

        // 3. Respond to the client with the new favorite status.
        return res.status(200).json({
            eventId: eventId,
            userId: authenticatedUser.id,
            isFavorited: result.isFavorited,
            message: result.isFavorited
                ? 'Event successfully added to favorites.'
                : 'Event successfully removed from favorites.',
            // favoriteEntry: result.favoriteEntry, // Optionally return the full favorite entry if needed by client
        });

    } catch (error) {
        console.error(`Error toggling favorite for user ${authenticatedUser.id} on event ${eventId}:`, error);
        // Check if the error is a known type or has a specific message you want to relay,
        // otherwise, send a generic server error.
        if (error instanceof Error) {
            // You could check for specific error messages from storage if you throw custom errors
            return res.status(500).json({ message: error.message || 'Failed to update favorite status.' });
        }
        return res.status(500).json({ message: 'An unexpected error occurred while updating favorite status.' });
    }
}