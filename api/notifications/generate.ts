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

        const user = await storage.getUser(userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        await createNotifications();

        res.json({
            success: true,
            message: 'Dummy notifications created successfully'
        });
    } catch (error: any) {
        console.error('Error creating dummy notifications:', error);
        res.status(500).json({ message: error.message || 'Error creating dummy notifications' });
    }
}