import type { VercelRequest, VercelResponse } from '@vercel/node';


import {storage} from "../../server/storage";

export default async function handler(req: VercelRequest, res:VercelResponse) {
    try {
        const { amount, accountName, accountNumber, bankName } = req.body;

        if (!amount || !accountName || !accountNumber || !bankName) {
            return res.status(400).json({
                message: "All fields are required: amount, accountName, accountNumber, bankName"
            });
        }

        const withdrawalAmount = parseFloat(amount);
        if (isNaN(withdrawalAmount) || withdrawalAmount < 50) {
            return res.status(400).json({ message: "Minimum withdrawal amount is R50" });
        }

        // Get the user's completed tickets to calculate available balance
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        const user = await storage.getUser(userId);
        const userTickets = await storage.getUserTickets(userId);
        const completedTickets = userTickets.filter(ticket => ticket.paymentStatus === 'completed');

        const totalRevenue = completedTickets.reduce(
            (sum, ticket) => sum + parseFloat(ticket.totalAmount.toString() || '0'),
            0
        );

        // Check if user is admin - admin doesn't pay platform fees
        const isAdmin = user?.isAdmin === true;
        const availableBalance = isAdmin ? totalRevenue : totalRevenue * 0.85; // Only apply 15% fee for non-admin users

        if (withdrawalAmount > availableBalance) {
            return res.status(400).json({
                message: `Insufficient funds. Available balance: ${availableBalance.toFixed(2)}`
            });
        }

        // In a real app, this would integrate with Paystack's transfer API
        // For now, we'll just simulate a successful withdrawal request
        const withdrawalRequest = {
            id: Date.now(),
            userId,
            amount: withdrawalAmount,
            accountName,
            accountNumber,
            bankName,
            status: 'pending',
            createdAt: new Date()
        };

        // TODO: In a production app, store this in a withdrawals table

        res.status(201).json({
            success: true,
            message: "Withdrawal request submitted successfully",
            data: withdrawalRequest
        });
    } catch (error: any) {
        console.error('Error processing withdrawal request:', error);
        res.status(500).json({ message: error.message || "Error processing withdrawal request" });
    }
}