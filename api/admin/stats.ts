import type { VercelRequest, VercelResponse } from '@vercel/node';

import {paystackService} from "../../server/services/paystackService";
import {storage} from "../../server/storage";

export default async function handler(req: VercelRequest, res:VercelResponse) {
    try {
        // Get total users count
        const allUsers = await storage.getAllUsers();
        const totalUsers = allUsers.length;

        // Get total events count
        const allEvents = await storage.getAllEvents();
        const totalEvents = allEvents.length;

        // Get all tickets
        const allTickets = await storage.getAllTickets();
        const completedTickets = allTickets.filter(ticket => ticket.paymentStatus === 'completed');

        // Calculate total revenue and tickets sold
        const totalTicketsSold = completedTickets.length;
        const totalRevenue = completedTickets.reduce(
            (sum, ticket) => sum + parseFloat(ticket.totalAmount?.toString() || '0'),
            0
        );

        // Get admin user
        const adminUser = allUsers.find(user => user.isAdmin);
        const platformBalance = adminUser ? parseFloat(adminUser.platformBalance || '0') : 0;

        res.json({
            totalUsers,
            totalEvents,
            totalTicketsSold,
            totalRevenue,
            platformBalance
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Error fetching admin stats' });
    }
}