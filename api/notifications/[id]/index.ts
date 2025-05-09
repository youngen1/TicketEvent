import type { VercelRequest, VercelResponse } from '@vercel/node';

import { requireAuth, requireAdmin } from '../../server/utils/authUtils'; // Adjust path
import { createNotifications } from '../../server/create-notifications'; // Adjust path to your function that creates dummy notifications
import { storage } from '../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const notificationId = parseInt(req.params.id);
        await storage.deleteNotification(notificationId);
        res.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: error.message || 'Error deleting notification' });
    }
}