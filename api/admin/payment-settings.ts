import type { VercelRequest, VercelResponse } from '@vercel/node';
import {paystackService} from "../../server/services/paystackService";


export default async function handler(req: VercelRequest,res: VercelResponse) {
    if (req.user.isAdmin()){
        if (req.method === "GET") {
            try {


                const settings = {
                    liveMode: process.env.PAYSTACK_MODE === 'live',
                    liveSecretKey: process.env.PAYSTACK_SECRET_KEY ? '••••••••••••••••••••••••••' : undefined,
                    livePublicKey: process.env.VITE_PAYSTACK_PUBLIC_KEY ?
                        `${process.env.VITE_PAYSTACK_PUBLIC_KEY.substring(0, 8)}...` : undefined,
                    testSecretKey: process.env.PAYSTACK_TEST_SECRET_KEY ? '••••••••••••••••••••••••••' : undefined,
                    testPublicKey: process.env.VITE_PAYSTACK_TEST_PUBLIC_KEY ?
                        `${process.env.VITE_PAYSTACK_TEST_PUBLIC_KEY.substring(0, 8)}...` : undefined
                };

                res.json(settings);
            } catch (error: any) {
                console.error('Error fetching payment settings:', error);
                res.status(500).json({message: error.message || "Error fetching payment settings"});
            }

        } else if (req.method === "POST") {
            try {
                // In a real app, you'd check if the user is an admin and store these in a database

                const {
                    liveMode,
                    liveSecretKey,
                    livePublicKey,
                    testSecretKey,
                    testPublicKey
                } = req.body;

                // Update environment variables directly (for this development environment)
                process.env.PAYSTACK_MODE = liveMode ? 'live' : 'test';

                if (liveMode) {
                    if (liveSecretKey) process.env.PAYSTACK_SECRET_KEY = liveSecretKey;
                    if (livePublicKey) process.env.VITE_PAYSTACK_PUBLIC_KEY = livePublicKey;
                } else {
                    if (testSecretKey) process.env.PAYSTACK_TEST_SECRET_KEY = testSecretKey;
                    if (testPublicKey) process.env.VITE_PAYSTACK_TEST_PUBLIC_KEY = testPublicKey;
                }

                // Reinitialize the Paystack service to reflect changes
                // Note: This is a simplistic approach for demonstration
                paystackService.reinitialize();

                res.json({
                    success: true,
                    message: `Payment settings updated successfully. Now using ${liveMode ? 'LIVE' : 'TEST'} mode.`
                });
            } catch (error: any) {
                console.error('Error updating payment settings:', error);
                res.status(500).json({message: error.message || "Error updating payment settings"});
            }

        }
    }else {
        console.error("this user is not an admin.");
        res.status(500).json({message: "this user is not an admin."});
    }
}