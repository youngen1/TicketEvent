
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {memStorage } from "../../server/storage"
import {storage} from "../../server/storage";


export default async function handler(req: VercelRequest, res: VercelResponse){
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        await memStorage.markAllNotificationsAsRead(userId);
        res.json({ success: true });
    } catch (error: any) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ message: error.message || 'Error marking all notifications as read' });
    }

}