import type { VercelRequest, VercelResponse } from '@vercel/node';
import {memStorage, storage} from '../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // Trim whitespace from queries to handle spaces properly
        const query = (req.query.query as string || '').trim();
        const locationQuery = (req.query.location as string || '').trim();
        const maxDistance = req.query.maxDistance ? parseFloat(req.query.maxDistance as string) : undefined;

        console.log(`Searching users with query: "${query}", location: "${locationQuery}", maxDistance: ${maxDistance || 'none'}`);

        // Check if we have at least a text query or a location query
        if (!query && !locationQuery) {
            console.log('No search parameters provided');
            return res.json([]);
        }

        // Search users with location filter and distance parameters
        const users = await storage.searchUsers(query, locationQuery, maxDistance);
        console.log(`Found ${users.length} users matching search criteria`);

        // Add isFollowing property if a user is logged in
        const processedUsers = await Promise.all(users.map(async (user) => {
            // Don't return passwords
            const { password, ...userWithoutPassword } = user;

            // Add isFollowing property if a user is logged in
            let isFollowing = false;
            if (req.session.userId) {
                isFollowing = await memStorage.isFollowing(req.session.userId, user.id);
            }

            // Get event count
            const userEvents = await storage.getUserEvents(user.id);
            const eventsCount = userEvents.length;

            return {
                ...userWithoutPassword,
                isFollowing,
                eventsCount
            };
        }));

        res.json(processedUsers);
    } catch (error: any) {
        console.error('Error searching users:', error);
        res.status(500).json({ message: error.message || "Error searching users" });
    }


}