import type { VercelRequest, VercelResponse } from '@vercel/node';

import {paystackService} from "../../server/services/paystackService";

export default async function handler(req: VercelRequest, res:VercelResponse) {
    try {
        // Get the list of banks from Paystack
        const banks = await paystackService.getPaymentChannels();

        if (!banks || !Array.isArray(banks) || banks.length === 0) {
            console.error('Invalid bank list returned from Paystack service');
            return res.status(500).json({ message: "Failed to fetch banks" });
        }

        console.log(`Retrieved ${banks.length} banks from the Paystack service`);

        // Format the response
        const formattedBanks = banks.map((bank: any) => ({
            id: bank.id || Math.floor(Math.random() * 10000), // Ensure we have an ID
            name: bank.name || "Unknown Bank",
            slug: bank.slug || bank.name?.toLowerCase().replace(/\s+/g, '-') || 'unknown-bank'
        }));

        res.json(formattedBanks);
    } catch (error: any) {
        console.error('Error in /api/finance/banks endpoint:', error);
        // Return a minimal list of banks as fallback
        res.json([
            { id: 1, name: "Standard Bank", slug: "standard-bank" },
            { id: 2, name: "ABSA Bank", slug: "absa-bank" },
            { id: 3, name: "Nedbank", slug: "nedbank" },
            { id: 4, name: "FNB", slug: "fnb" },
            { id: 5, name: "Capitec", slug: "capitec" }
        ]);
    }
}