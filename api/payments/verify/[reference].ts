import type { VercelRequest, VercelResponse } from '@vercel/node';
import {memStorage, storage} from "../../../server/storage";
import type {InsertEventTicket} from "../../../shared/schema";
import {paystackService} from "../../../server/services/paystackService";

export default async function handler(req: VercelRequest,res: VercelResponse) {
    try {
        const { reference } = req.params;
        const { amount } = req.query; // Get amount from query parameters if available

        if (!reference) {
            return res.status(400).json({ message: "Payment reference is required" });
        }

        console.log('Payment verification request for reference:', reference);

        // First check if we have a pending ticket for this reference
        const existingTicket = await memStorage.getTicketByReference(reference);

        if (existingTicket) {
            console.log('Found existing ticket:', existingTicket);

            // If ticket is already completed, just return success
            if (existingTicket.paymentStatus === "completed") {
                console.log('Ticket already marked as completed');
                return res.json({
                    success: true,
                    data: {
                        ticket: existingTicket,
                        alreadyProcessed: true
                    }
                });
            }

            // If ticket is pending, verify with Paystack and update status
            try {
                console.log('Verifying pending ticket with Paystack');
                const verification = await paystackService.verifyPayment({
                    reference,
                    amount: amount as string | undefined
                });

                if (verification.status === "success") {
                    console.log('Paystack verification successful, updating ticket status');

                    // Update ticket status to completed
                    await memStorage.updateTicket(existingTicket.id, {
                        paymentStatus: "completed",
                        updatedAt: new Date()
                    });

                    // Return success with ticket info
                    return res.json({
                        success: true,
                        data: {
                            verification,
                            ticket: existingTicket
                        }
                    });
                } else {
                    console.log('Paystack verification failed:', verification.status);

                    // Update ticket to failed since payment was declined
                    await memStorage.updateTicket(existingTicket.id, {
                        paymentStatus: "failed",
                        updatedAt: new Date()
                    });

                    return res.json({
                        success: false,
                        data: {
                            verification,
                            ticket: {
                                ...existingTicket,
                                paymentStatus: "failed"
                            }
                        }
                    });
                }
            } catch (error: any) {
                console.error('Error verifying payment with Paystack:', error);

                // For test tickets or if verification fails, we'll still mark the ticket as completed
                if (reference.includes('-test') || (amount && parseFloat(amount.toString()) <= 5)) {
                    console.log('Marking test ticket as completed without Paystack verification');

                    // Update ticket status to completed
                    await memStorage.updateTicket(existingTicket.id, {
                        paymentStatus: "completed",
                        updatedAt: new Date()
                    });

                    return res.json({
                        success: true,
                        data: {
                            ticket: existingTicket,
                            testMode: true
                        }
                    });
                }

                return res.status(500).json({
                    message: error.message || "Error verifying payment",
                    ticket: existingTicket
                });
            }
        } else {
            // If no ticket exists yet, create one based on the reference
            try {
                console.log('No existing ticket found for reference:', reference);

                // Get the userId from session
                const userId = req.session.userId;

                // Extract eventId from reference (format: eventId-timestamp-userId)
                let eventId: number;
                const parts = reference.split('-');
                if (parts.length > 0 && !isNaN(parseInt(parts[0]))) {
                    eventId = parseInt(parts[0]);
                } else {
                    throw new Error("Could not determine event ID from payment reference");
                }

                // Get the event to ensure it exists
                const event = await storage.getEvent(eventId);
                if (!event) {
                    throw new Error(`Event with ID ${eventId} not found`);
                }

                // For test tickets or small amounts, create a completed ticket
                if (reference.includes('-test') || (amount && parseFloat(amount.toString()) <= 5)) {
                    console.log('Creating completed test ticket');

                    // Try to extract ticket type from reference (if available)
                    let ticketTypeId = null;
                    // Format could be: eventId-timestamp-userId-ticketTypeId-test
                    const parts = reference.split('-');
                    if (parts.length > 3 && !isNaN(parseInt(parts[3]))) {
                        ticketTypeId = parseInt(parts[3]);
                    }

                    const ticket = await memStorage.createTicket({
                        userId,
                        eventId,
                        quantity: 1,
                        ticketTypeId,
                        totalAmount: amount ? parseFloat(amount.toString()) : (event.price ? parseFloat(event.price) : 0),
                        paymentReference: reference,
                        paymentStatus: "completed"
                    } as InsertEventTicket);

                    return res.json({
                        success: true,
                        data: {
                            ticket,
                            testMode: true
                        }
                    });
                }

                // For real payments, verify with Paystack first
                console.log('Verifying real payment with Paystack');
                const verification = await paystackService.verifyPayment({
                    reference,
                    amount: amount as string | undefined
                });

                if (verification.status === "success") {
                    console.log('Paystack verification successful, creating completed ticket');

                    // Try to extract ticket type from reference or metadata if available
                    let ticketTypeId = null;

                    // Try to get from metadata first
                    if (verification.metadata && verification.metadata.ticketTypeId) {
                        ticketTypeId = parseInt(verification.metadata.ticketTypeId);
                    } else {
                        // Format could be: eventId-timestamp-userId-ticketTypeId
                        const parts = reference.split('-');
                        if (parts.length > 3 && !isNaN(parseInt(parts[3]))) {
                            ticketTypeId = parseInt(parts[3]);
                        }
                    }

                    // Create a ticket with proper ZAR currency conversion
                    const amountInRands = verification.amount / 100; // Convert from cents to Rands
                    console.log(`Payment verified: ${verification.amount} cents → R${amountInRands.toFixed(2)}`);

                    const ticket = await memStorage.createTicket({
                        userId,
                        eventId,
                        quantity: 1,
                        ticketTypeId,
                        totalAmount: amountInRands,
                        paymentReference: reference,
                        paymentStatus: "completed"
                    } as InsertEventTicket);

                    // Return success with ticket info
                    return res.json({
                        success: true,
                        data: {
                            verification,
                            ticket
                        }
                    });
                } else {
                    return res.json({
                        success: false,
                        data: verification
                    });
                }
            } catch (error: any) {
                console.error('Error creating/verifying ticket:', error);
                return res.status(500).json({ message: error.message || "Error processing payment" });
            }
        }
    } catch (error: any) {
        console.error('Payment verification error:', error);
        res.status(500).json({ message: error.message || "Error verifying payment" });
    }


}