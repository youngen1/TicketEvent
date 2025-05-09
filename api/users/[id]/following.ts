
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { memStorage } from '../../../server/storage';

export default async function handler(req: VercelRequest, res:VercelResponse) {
    try {
        const userId = parseInt(req.params.id);
        const following = await memStorage.getUserFollowing(userId);
        const currentUserId = req.session.userId;

        // Don't return passwords and add youFollow and followsYou properties
        const sanitizedFollowing = await Promise.all(following.map(async user => {
            const { password, ...userWithoutPassword } = user;

            // Check if the current user follows this user (should always be true for following)
            const youFollow = currentUserId ? await memStorage.isFollowing(currentUserId, user.id) : false;

            // Check if this user follows the current user (for mutual follows)
            const followsYou = currentUserId ? await memStorage.isFollowing(user.id, currentUserId) : false;

            return {
                ...userWithoutPassword,
                youFollow,
                followsYou
            };
        }));

        res.json(sanitizedFollowing);
    } catch (error: any) {
        console.error('Error fetching following:', error);
        res.status(500).json({ message: error.message || "Error fetching following" });
    }

}