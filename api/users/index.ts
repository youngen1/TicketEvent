import {memStorage, storage} from "../../server/storage";
import type { VercelRequest, VercelResponse } from '@vercel/node';
export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        // Get all users
        const allUsers = await Promise.all((await storage.getUsersToFollow()).map(async (user) => {
            // Don't return passwords
            const { password, ...userWithoutPassword } = user;

            // Check if current user is following this user
            const isFollowing = req.session.userId ? await memStorage.isFollowing(req.session.userId, user.id) : false;

            return {
                ...userWithoutPassword,
                isFollowing
            };
        }));

        // Filter out the current user
        const users = allUsers.filter(user => req.session.userId ? user.id !== req.session.userId : true);

        res.json(users);
    } catch (error: any) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: error.message || "Error fetching users" });
    }



}

