import type { VercelRequest, VercelResponse } from '@vercel/node';

import { requireAuth, requireAdmin } from '../../server/utils/authUtils'; // Adjust path
import { createNotifications } from '../../server/create-notifications'; // Adjust path to your function that creates dummy notifications
import { storage } from '../../server/storage';


export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const friends = await storage.getFriends(userId);

        // Don't return passwords
        const sanitizedFriends = friends.map(friend => {
            const { password, ...userWithoutPassword } = friend;
            return userWithoutPassword;
        });

        res.json(sanitizedFriends);
    } catch (error: any) {
        console.error('Error fetching friends:', error);
        res.status(500).json({ message: error.message || 'Error fetching friends' });
    }
}