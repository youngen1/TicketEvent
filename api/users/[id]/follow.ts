import type { VercelRequest, VercelResponse } from '@vercel/node';
import {memStorage, storage} from '../../../server/storage';

export default async function handler(req: VercelRequest, res:VercelResponse) {
    if (req.method === "POST") {
        try {
            if (!req.session.userId) {
                return res.status(401).json({message: "Not authenticated"});
            }

            const followingId = parseInt(req.params.id);

            // Check if user is trying to follow themselves
            if (req.session.userId === followingId) {
                return res.status(400).json({message: "Cannot follow yourself"});
            }

            // Check if user to follow exists
            const userToFollow = await storage.getUser(followingId);
            if (!userToFollow) {
                return res.status(404).json({message: "User to follow not found"});
            }

            // Follow the user
            await memStorage.followUser(req.session.userId, followingId);

            res.json({success: true, message: "User followed successfully"});
        } catch (error: any) {
            console.error('Error following user:', error);
            res.status(500).json({message: error.message || "Error following user"});
        }

    } else if(req.method === "DELETE"){
        try {
            if (!req.session.userId) {
                return res.status(401).json({ message: "Not authenticated" });
            }

            const followingId = parseInt(req.params.id);

            // Check if user to unfollow exists
            const userToUnfollow = await storage.getUser(followingId);
            if (!userToUnfollow) {
                return res.status(404).json({ message: "User to unfollow not found" });
            }

            // Unfollow the user
            await memStorage.unfollowUser(req.session.userId, followingId);

            res.json({ success: true, message: "User unfollowed successfully" });
        } catch (error: any) {
            console.error('Error unfollowing user:', error);
            res.status(500).json({ message: error.message || "Error unfollowing user" });
        }
   }



}