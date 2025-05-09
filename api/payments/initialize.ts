import type { VercelRequest, VercelResponse } from '@vercel/node';
import {memStorage, storage} from "../../server/storage";
import type {InsertEventTicket} from "../../shared/schema";
import {paystackService} from "../../server/services/paystackService";

export default async function handler(req: VercelRequest,res: VercelResponse) {
    try {
        console.log('Payment initialization request received:', req.body);
        const { amount, eventId, ticketTypeId } = req.body;

        if (!amount || !eventId) {
            console.log('Missing amount or eventId:', { amount, eventId });
            return res.status(400).json({ message: "Amount and event ID are required" });
        }

        // Get user for email
        if (!req.session.userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const user = await storage.getUser(req.session.userId);
        console.log('Payment user:', { id: user?.id, email: user?.email });

        if (!user || !user.email) {
            return res.status(400).json({ message: "User email not found" });
        }

        // Get event details
        const event = await storage.getEvent(parseInt(eventId));
        console.log('Payment event:', { id: event?.id, title: event?.title, price: event?.price });

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // If ticket type ID is provided, fetch ticket type details
        let ticketType = null;
        if (ticketTypeId) {
            ticketType = await storage.getTicketType(parseInt(ticketTypeId));
            if (!ticketType) {
                return res.status(404).json({ message: "Ticket type not found" });
            }

            // Check if tickets are available
            if (ticketType.quantity <= (ticketType.soldCount || 0)) {
                return res.status(400).json({ message: "This ticket type is sold out" });
            }
        }

        // Check gender restrictions
        if (event.genderRestriction) {
            // "male-only" now means "restrict male"
            if (event.genderRestriction === "male-only" && user.gender === "male") {
                return res.status(403).json({
                    message: "This event restricts male attendees from participating"
                });
            }

            // "female-only" now means "restrict female"
            if (event.genderRestriction === "female-only" && user.gender === "female") {
                return res.status(403).json({
                    message: "This event restricts female attendees from participating"
                });
            }
        }

        // Check age restrictions
        if (event.ageRestriction && Array.isArray(event.ageRestriction) && event.ageRestriction.length > 0) {
            if (user.dateOfBirth) {
                const birthDate = new Date(user.dateOfBirth);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();

                // Adjust age if birthday hasn't occurred yet this year
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }

                // Check against age restriction groups
                let isRestricted = false;

                if (age < 18 && event.ageRestriction.includes("under 18")) {
                    isRestricted = true;
                } else if (age >= 20 && age < 30 && event.ageRestriction.includes("20s")) {
                    isRestricted = true;
                } else if (age >= 30 && age < 40 && event.ageRestriction.includes("30s")) {
                    isRestricted = true;
                } else if (age >= 40 && event.ageRestriction.includes("40plus")) {
                    isRestricted = true;
                }

                if (isRestricted) {
                    return res.status(403).json({
                        message: "You cannot purchase tickets due to age restriction for this event"
                    });
                }
            }
        }

        // Check if the user already has a ticket for this event
        const hasTicket = await storage.hasUserPurchasedEventTicket(req.session.userId, parseInt(eventId));
        if (hasTicket) {
            return res.status(400).json({
                message: "You cannot buy two tickets for yourself. You already have a ticket for this event."
            });
        }

        // Generate a unique reference
        const reference = `${eventId}-${Date.now()}-${req.session.userId}`;

        // Create a callback URL (both for real Paystack and our mock)
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.headers.host;

        // New: Create a pre-created ticket for large payments too, but mark as pending
        // This ensures we have a ticket ready when the payment is verified
        const ticket = await memStorage.createTicket({
            userId: req.session.userId,
            eventId: parseInt(eventId),
            quantity: 1,
            ticketTypeId: ticketTypeId ? parseInt(ticketTypeId) : null,
            totalAmount: parseFloat(amount),
            paymentReference: reference,
            paymentStatus: "pending" // Will be updated to completed on verification
        } as InsertEventTicket);

        console.log('Pre-created pending ticket:', ticket);

        // Add amount as query parameter to make it available to the success page
        const callbackUrl = `${protocol}://${host}/payment/success?reference=${reference}&amount=${encodeURIComponent(amount)}`;
        console.log('Payment callback URL:', callbackUrl);

        // Check payment mode
        const isLiveMode = process.env.PAYSTACK_MODE === 'live';
        console.log('Payment mode:', isLiveMode ? 'LIVE' : 'TEST');

        // Log clear amount information
        console.log(`Payment amount in ZAR: R${parseFloat(amount).toFixed(2)}`);

        // Initialize transaction with Paystack
        const transaction = await paystackService.initializeTransaction({
            email: user.email,
            amount: parseFloat(amount), // Service will convert to cents
            reference,
            callback_url: callbackUrl,
            metadata: {
                eventId,
                userId: req.session.userId,
                eventTitle: event.title,
                ticketId: ticket.id,
                ticketTypeId: ticketTypeId || null,
                currencyCode: "ZAR",
                amountInRands: parseFloat(amount).toFixed(2)
            }
        });

        console.log('Payment initialization successful:', {
            authUrl: transaction.authorization_url,
            reference: transaction.reference
        });

        res.json({
            paymentUrl: transaction.authorization_url,
            reference: transaction.reference
        });
    } catch (error: any) {
        console.error('Payment initialization error:', error);
        res.status(500).json({ message: error.message || "Error initializing payment" });
    }


}