import type { VercelRequest, VercelResponse } from '@vercel/node';

import {paystackService} from "../../server/services/paystackService";
import {storage} from "../../server/storage";
import type {InsertUser} from "../../../../shared/schema";

export default async function handler(req: VercelRequest, res:VercelResponse) {
    try {
        const userId = parseInt(req.params.userId);
        const { username, displayName } = req.body;

        if (!username && !displayName) {
            return res.status(400).json({ message: 'No update data provided' });
        }

        // Validate the username if provided
        if (username) {
            // Check if username is already taken by another user
            const existingUser = await storage.getUserByUsername(username);
            if (existingUser && existingUser.id !== userId) {
                return res.status(400).json({ message: 'Username is already taken' });
            }
        }

        // Update the user
        const updateData: Partial<InsertUser> = {};
        if (username) updateData.username = username;
        if (displayName) updateData.displayName = displayName;

        const updatedUser = await storage.updateUser(userId, updateData);
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            id: updatedUser.id,
            username: updatedUser.username,
            displayName: updatedUser.displayName
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Error updating user profile' });
    }
}