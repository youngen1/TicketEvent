import type { VercelRequest, VercelResponse } from '@vercel/node';

import {paystackService} from "../../server/services/paystackService";
import {storage} from "../../server/storage";

export default async function handler(req: VercelRequest, res:VercelResponse) {
    try {
        // Get query parameters
        const searchQuery = req.query.search as string || '';

        // Get all users
        const allUsers = await storage.getAllUsers();

        // Filter users based on search query if provided
        let filteredUsers = allUsers;
        if (searchQuery) {
            const lowerCaseQuery = searchQuery.toLowerCase();
            filteredUsers = allUsers.filter(user =>
                user.username.toLowerCase().includes(lowerCaseQuery) ||
                (user.displayName && user.displayName.toLowerCase().includes(lowerCaseQuery))
            );
        }

        // Map users to include only necessary info and exclude sensitive data like passwords
        const safeUsers = filteredUsers.map(user => ({
            id: user.id,
            username: user.username,
            displayName: user.displayName || user.username,
            email: user.email,
            isAdmin: user.isAdmin,
            createdAt: user.createdAt,
            followersCount: user.followersCount,
            followingCount: user.followingCount,
            avatar: user.avatar,
            isBanned: user.isBanned || false
        }));

        res.json(safeUsers);
    } catch (error) {
        console.error('Error fetching admin users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
}