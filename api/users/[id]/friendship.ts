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

        const otherUserId = parseInt(req.params.id);
        const isFriend = await storage.checkFriendship(userId, otherUserId);

        res.json({ isFriend });
    } catch (error: any) {
        console.error('Error checking friendship status:', error);
        res.status(500).json({ message: error.message || 'Error checking friendship status' });
    }
}