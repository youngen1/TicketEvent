import type { VercelRequest, VercelResponse } from '@vercel/node';

import {paystackService} from "../../server/services/paystackService";
import {storage} from "../../../server/storage";

export default async function handler(req: VercelRequest, res:VercelResponse) {
    try {
        console.log('Creating sample events');

        // Create South African themed events
        const sampleEvents = [
            {
                title: "Cape Town Jazz Festival 2025",
                description: "South Africa's premier jazz event featuring top local and international artists at the Cape Town International Convention Centre",
                date: "2025-03-27",
                time: "18:00",
                location: "Cape Town, South Africa",
                category: "Music",
                image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
                images: JSON.stringify([
                    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=800&q=80"
                ]),
                userId: 2, // Admin user
                maxAttendees: 5000,
                isFree: false,
                price: "850",
                tags: "jazz,music,festival,cape town",
                latitude: "-33.9155",
                longitude: "18.4239",
                featured: true,
                hasMultipleTicketTypes: true,
                totalTickets: 5000,
                ticketsSold: 247
            },
            {
                title: "Soweto Wine & Lifestyle Festival",
                description: "Experience the finest South African wines paired with local cuisine and live entertainment celebrating township culture",
                date: "2025-05-15",
                time: "12:00",
                location: "Soweto, Johannesburg, South Africa",
                category: "Food & Drink",
                image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80",
                images: JSON.stringify([
                    "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1567072379576-a0f6e3ef2101?auto=format&fit=crop&w=800&q=80"
                ]),
                userId: 2, // Admin user
                maxAttendees: 2000,
                isFree: false,
                price: "350",
                tags: "wine,food,lifestyle,soweto,johannesburg",
                latitude: "-26.2485",
                longitude: "27.8540",
                featured: true,
                hasMultipleTicketTypes: true,
                totalTickets: 2000,
                ticketsSold: 156,
                ageRestriction: ["18+"]
            },
            {
                title: "Durban International Film Festival",
                description: "South Africa's longest-running film festival showcasing the best in African and international cinema",
                date: "2025-07-20",
                time: "10:00",
                location: "Durban, South Africa",
                category: "Film",
                image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80",
                images: JSON.stringify([
                    "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=800&q=80"
                ]),
                userId: 1, // Demo user
                maxAttendees: 3000,
                isFree: false,
                price: "200",
                tags: "film,cinema,festival,durban",
                latitude: "-29.8587",
                longitude: "31.0218",
                featured: false,
                hasMultipleTicketTypes: true,
                totalTickets: 3000,
                ticketsSold: 489
            },
            {
                title: "Karoo Mighty Men Conference",
                description: "A spiritual gathering for men focused on faith, leadership and community in the stunning Karoo landscape",
                date: "2025-09-12",
                time: "08:00",
                location: "Middelburg, Eastern Cape, South Africa",
                category: "Community",
                image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80",
                images: JSON.stringify([
                    "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1520642413789-2bd6770d59e3?auto=format&fit=crop&w=800&q=80"
                ]),
                userId: 1, // Demo user
                maxAttendees: 10000,
                isFree: false,
                price: "450",
                tags: "faith,community,men,karoo,eastern cape",
                latitude: "-31.4965",
                longitude: "25.0124",
                featured: false,
                genderRestriction: "male-only",
                hasMultipleTicketTypes: true,
                totalTickets: 10000,
                ticketsSold: 792
            },
            {
                title: "Cape Town Tech Summit",
                description: "The premier technology conference in Africa featuring keynotes from industry leaders, workshops and networking opportunities",
                date: "2025-11-05",
                time: "09:00",
                location: "Century City, Cape Town, South Africa",
                category: "Technology",
                image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
                images: JSON.stringify([
                    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=800&q=80"
                ]),
                userId: 2, // Admin user
                maxAttendees: 1500,
                isFree: false,
                price: "1200",
                tags: "tech,summit,innovation,cape town",
                latitude: "-33.8869",
                longitude: "18.5030",
                featured: true,
                hasMultipleTicketTypes: true,
                totalTickets: 1500,
                ticketsSold: 324
            }
        ];

        // Define ticket types for each event
        // Use type annotation to help TypeScript understand the structure
        const ticketTypesMap: Record<string, Array<{
            name: string;
            description: string;
            price: string;
            quantity: number;
            soldCount: number;
            isActive: boolean;
        }>> = {
            "Cape Town Jazz Festival 2025": [
                {
                    name: "General Admission",
                    description: "Standard festival access to all stages",
                    price: "850",
                    quantity: 4000,
                    soldCount: 203,
                    isActive: true
                },
                {
                    name: "VIP Pass",
                    description: "Premium access with backstage tours, artist meet & greets, and exclusive lounge",
                    price: "1950",
                    quantity: 1000,
                    soldCount: 44,
                    isActive: true
                }
            ],
            "Soweto Wine & Lifestyle Festival": [
                {
                    name: "General Entry",
                    description: "Festival access with 5 wine tasting tokens",
                    price: "350",
                    quantity: 1500,
                    soldCount: 145,
                    isActive: true
                },
                {
                    name: "VIP Experience",
                    description: "Premium access with unlimited tastings, food pairing masterclass, and VIP lounge",
                    price: "750",
                    quantity: 500,
                    soldCount: 11,
                    isActive: true
                }
            ],
            "Durban International Film Festival": [
                {
                    name: "Single Day Pass",
                    description: "Access to all screenings for one day",
                    price: "200",
                    quantity: 2000,
                    soldCount: 478,
                    isActive: true
                },
                {
                    name: "Festival Pass",
                    description: "Full access to all screenings for the entire festival duration",
                    price: "850",
                    quantity: 1000,
                    soldCount: 11,
                    isActive: true
                }
            ],
            "Karoo Mighty Men Conference": [
                {
                    name: "Standard Registration",
                    description: "Full conference access with camping spot",
                    price: "450",
                    quantity: 8000,
                    soldCount: 780,
                    isActive: true
                },
                {
                    name: "Premium Package",
                    description: "Conference access with premium tent accommodation and meals included",
                    price: "1200",
                    quantity: 2000,
                    soldCount: 12,
                    isActive: true
                }
            ],
            "Cape Town Tech Summit": [
                {
                    name: "Standard Pass",
                    description: "Access to all keynotes and exhibition area",
                    price: "1200",
                    quantity: 1000,
                    soldCount: 289,
                    isActive: true
                },
                {
                    name: "Executive Pass",
                    description: "Full summit access including workshops, networking events, and VIP dinner",
                    price: "2500",
                    quantity: 500,
                    soldCount: 35,
                    isActive: true
                }
            ]
        };

        // Add events to the database and create ticket types
        for (const eventData of sampleEvents) {
            const event = await storage.createEvent(eventData);

            // Get ticket types for this event
            // Use type assertion with 'as' to avoid TypeScript index signature error
            const ticketTypes = ticketTypesMap[event.title as keyof typeof ticketTypesMap];
            if (ticketTypes && ticketTypes.length > 0) {
                for (const ticketTypeData of ticketTypes) {
                    // Create the ticket type without the soldCount property
                    const ticketType = await storage.createTicketType({
                        eventId: event.id,
                        name: ticketTypeData.name,
                        description: ticketTypeData.description,
                        price: ticketTypeData.price,
                        quantity: ticketTypeData.quantity,
                        isActive: ticketTypeData.isActive
                    });

                    // If needed, update the soldCount separately
                    if (ticketType && ticketTypeData.soldCount) {
                        // For this example, we're using a direct approach since the
                        // in-memory storage allows this pattern. In a real DB, you would
                        // use a proper update query here.
                        ticketType.soldCount = ticketTypeData.soldCount;
                    }
                }
                console.log(`Created ${ticketTypes.length} ticket types for event "${event.title}"`);
            }
        }

        console.log(`Created ${sampleEvents.length} sample events successfully with multiple ticket types`);

        res.json({
            success: true,
            message: `Created ${sampleEvents.length} sample events successfully with multiple ticket types`,
            count: sampleEvents.length
        });
    } catch (error: any) {
        console.error('Error creating sample events:', error);
        res.status(500).json({ message: error.message || 'Error creating sample events' });
    }

}