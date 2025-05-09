
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage,memStorage } from '../../../server/storage';

export default async function handler(req: VercelRequest, res:VercelResponse) {
    try {
        const userToCheckId = parseInt(req.params.id);
        const currentUserId = req.session.userId;

        if (!currentUserId) {
            return res.json(false);
        }

        if (currentUserId === userToCheckId) {
            return res.json(false); // Cannot follow yourself
        }

        const isFollowing = await storage.isFollowing(currentUserId, userToCheckId);
        res.json(isFollowing);
    } catch (error: any) {
        console.error('Error checking follow status:', error);
        res.status(500).json({ message: error.message || "Error checking follow status" });
    }


}