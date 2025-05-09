
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage,memStorage } from '../../../server/storage';

export default async function handler(req: VercelRequest, res:VercelResponse) {
    try {
        const userId = parseInt(req.params.id);
        const followers = await memStorage.getUserFollowers(userId);
        const currentUserId = req.session.userId;

        // Don't return passwords and add youFollow and followsYou properties
        const sanitizedFollowers = await Promise.all(followers.map(async follower => {
            const { password, ...followerWithoutPassword } = follower;

            // Check if the current user follows this follower
            const youFollow = currentUserId ? await memStorage.isFollowing(currentUserId, follower.id) : false;

            // Check if this follower follows the current user (for mutual follows)
            const followsYou = currentUserId ? await memStorage.isFollowing(follower.id, currentUserId) : false;

            return {
                ...followerWithoutPassword,
                youFollow,
                followsYou
            };
        }));

        res.json(sanitizedFollowers);
    } catch (error: any) {
        console.error('Error fetching followers:', error);
        res.status(500).json({ message: error.message || "Error fetching followers" });
    }


}