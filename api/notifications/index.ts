// api/notifications/index.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

import { requireAuth, requireAdmin } from '../../server/utils/authUtils'; // Adjust path
import { createNotifications } from '../../server/create-notifications'; // Adjust path to your function that creates dummy notifications
import { storage } from '../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // --- Handle GET /api/notifications ---
    // Fetches notifications for the authenticated user
    if (req.method === 'GET') {
        const authenticatedUser = await requireAuth(req, res); // User must be authenticated
        if (!authenticatedUser) {
            // requireAuth already sent a 401 response
            return;
        }

        try {
            const notifications = await storage.getUserNotifications(authenticatedUser.id);
            // getUserNotifications should ideally sort them by createdAt descending
            return res.status(200).json(notifications);
        } catch (error: any) {
            console.error(`Error fetching notifications for user ${authenticatedUser.id}:`, error);
            return res.status(500).json({ message: error.message || 'Error fetching notifications.' });
        }
    }

    // --- Handle POST /api/notifications ---
    // This route is repurposed for the admin action of generating sample notifications.
    // If users were to create notifications, this POST would handle that,
    // and the "generate" action would be a separate endpoint like `/api/admin/notifications/generate`.
    if (req.method === 'POST') {
        // For generating sample notifications, user must be an admin
        const adminUser = await requireAdmin(req, res); // User must be authenticated AND an admin
        if (!adminUser) {
            // requireAdmin already sent 401 or 403 response
            return;
        }

        try {
            // Call the function that creates sample/dummy notifications.
            // This function (`createNotifications`) needs access to `storage` to create notification records.
            // Ensure `createNotifications` is adapted to work without direct req/res if it previously relied on them.
            await createNotifications(); // Pass storage if createNotifications needs it

            return res.status(200).json({
                success: true,
                message: 'Sample notifications generated successfully.',
            });
        } catch (error: any) {
            console.error('Error generating sample notifications:', error);
            return res.status(500).json({ message: error.message || 'Error generating sample notifications.' });
        }
    }

    // --- Method Not Allowed ---
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}