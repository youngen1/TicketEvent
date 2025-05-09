import type { VercelRequest, VercelResponse } from '@vercel/node';

import {paystackService} from "../../server/services/paystackService";
import {storage} from "../../server/storage";

export default async function handler(req: VercelRequest, res:VercelResponse) {
    try {
        const userId = parseInt(req.params.userId);

        // Ensure user isn't trying to ban themselves
        if (userId === req.session.userId) {
            return res.status(400).json({ message: 'You cannot ban your own account' });
        }

        const user = await storage.getUser(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Toggle ban status
        const isBanned = user.isBanned || false;
        const updatedUser = await storage.updateUser(userId, {
            isBanned: !isBanned
        });

        res.json({
            id: updatedUser.id,
            username: updatedUser.username,
            isBanned: updatedUser.isBanned || false
        });
    } catch (error) {
        console.error('Error toggling user ban status:', error);
        res.status(500).json({ message: 'Error updating user ban status' });
    }
}