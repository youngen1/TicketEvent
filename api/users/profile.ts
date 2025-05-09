import type { VercelRequest, VercelResponse } from '@vercel/node';
import {memStorage, storage} from '../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const userData = req.body;

        if (!req.session.userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const updatedUser = await storage.updateUser(req.session.userId, userData);

        // Return the updated user without the password
        const { password, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
    } catch (error: any) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: error.message || "Error updating user profile" });
    }

}