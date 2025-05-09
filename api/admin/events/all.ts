import type { VercelRequest, VercelResponse } from '@vercel/node';

import {paystackService} from "../../server/services/paystackService";
import {storage} from "../../../server/storage";

export default async function handler(req: VercelRequest, res:VercelResponse) {
    try {
        const events = await storage.getAllEvents();
        console.log(`Deleting all ${events.length} events`);

        for (const event of events) {
            await storage.deleteEvent(event.id);
        }

        console.log('All events deleted successfully');
        res.json({ success: true, message: 'All events deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting all events:', error);
        res.status(500).json({ message: error.message || 'Error deleting all events' });
    }

}