import type { VercelRequest, VercelResponse } from '@vercel/node';
import {paystackService} from "../../server/services/paystackService";


export default async function handler(req: VercelRequest,res: VercelResponse) {
    try {
        const channels = await paystackService.getPaymentChannels();
        res.json(channels);
    } catch (error: any) {
        console.error('Error fetching payment channels:', error);
        res.status(500).json({ message: error.message || "Error fetching payment channels" });
    }

}