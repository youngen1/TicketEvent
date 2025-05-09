// api/events/[id]/favorite.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {memStorage } from "../../../server/storage"


export default async function handler(req: VercelRequest, res: VercelResponse){
    try {
        const notificationId = parseInt(req.params.id);
        const updatedNotification = await memStorage.markNotificationAsRead(notificationId);
        res.json(updatedNotification);
    } catch (error: any) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: error.message || 'Error marking notification as read' });
    }
}
