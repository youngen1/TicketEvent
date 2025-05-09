import type { VercelRequest, VercelResponse } from '@vercel/node';
import {memStorage, storage} from '../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        console.log("Fetching all users");
        // Get all users
        const allUsers = await storage.getAllUsers();

        // Process users to add additional info and remove sensitive data
        const processedUsers = await Promise.all(allUsers.map(async (user) => {
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

        console.log(`Returning ${processedUsers.length} users from /api/users/all`);
        res.json(processedUsers);
    } catch (error: any) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: error.message || "Error fetching all users" });
    }


}