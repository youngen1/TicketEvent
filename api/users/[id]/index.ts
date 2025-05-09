
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage,memStorage } from '../../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const userId = parseInt(req.params.id);

        if (isNaN(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const user = await storage.getUser(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get followers and following counts
        const followers = await memStorage.getUserFollowers(userId);
        const following = await memStorage.getUserFollowing(userId);

        // Check if current user is following this user (if authenticated)
        let isFollowing = false;
        if (req.session.userId) {
            isFollowing = await memStorage.isFollowing(req.session.userId, userId);
        }

        // Remove sensitive information
        const { password, ...userWithoutPassword } = user;

        // Return user with additional info
        res.json({
            ...userWithoutPassword,
            followersCount: followers.length,
            followingCount: following.length,
            isFollowing
        });
    } catch (error: any) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: error.message || "Error fetching user profile" });
    }

}