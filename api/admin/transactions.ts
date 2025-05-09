import type { VercelRequest, VercelResponse } from '@vercel/node';

import {paystackService} from "../../server/services/paystackService";
import {storage} from "../../server/storage";

export default async function handler(req: VercelRequest, res:VercelResponse) {
    try {
        // Get all completed tickets for admin view
        const allTickets = await storage.getAllTickets();
        const completedTickets = allTickets.filter(ticket =>
            ticket.paymentStatus === 'completed' || ticket.paymentStatus === 'pending'
        );

        // Sort by date (newest first)
        const sortedTickets = completedTickets.sort((a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );

        // Limit to most recent 20
        const recentTickets = sortedTickets.slice(0, 20);

        res.json(recentTickets);
    } catch (error) {
        console.error('Error fetching admin transactions:', error);
        res.status(500).json({ message: 'Error fetching admin transactions' });
    }
}