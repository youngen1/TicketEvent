import type { Express } from "express";
import { storage } from "./storage";

export function registerTestRoutes(app: Express): void {
  // Test route - Create sample events with multiple ticket types (for development)
  app.get("/api/test/create-sample-events", async (req, res) => {
    try {
      console.log('Creating sample events with multiple ticket types');
      
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
          price: "950", // General admission base price - we'll have multiple ticket types
          featured: true,
          hasMultipleTicketTypes: true,
          maxAttendees: 5000,
          attendees: 0,
          userId: 1, // Admin user
          tags: "jazz,music festival,cape town",
          views: 0,
          averageRating: 0,
          totalTickets: 5000,
          ticketsSold: 0,
          video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
        },
        {
          title: "Soweto Wine & Lifestyle Festival",
          description: "Experience the finest South African wines paired with gourmet cuisine and vibrant township culture",
          date: "2025-05-15",
          time: "14:00", 
          location: "Soweto, Johannesburg",
          category: "Food & Drink",
          image: "https://images.unsplash.com/photo-1553361371-9513901d383f?auto=format&fit=crop&w=800&q=80",
          price: "450", // General admission base price
          featured: true,
          hasMultipleTicketTypes: true,
          maxAttendees: 1000,
          attendees: 0,
          userId: 1,
          tags: "wine,food,culture,soweto",
          views: 0,
          averageRating: 0,
          totalTickets: 1000,
          ticketsSold: 0,
          video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        },
        {
          title: "Durban International Film Festival 2025",
          description: "Africa's leading film festival showcasing the best in international and African cinema",
          date: "2025-07-22",
          time: "10:00",
          location: "Durban, South Africa",
          category: "Film & Media",
          image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80",
          price: "250", // General admission base price
          featured: false,
          hasMultipleTicketTypes: true,
          maxAttendees: 2000,
          attendees: 0,
          userId: 1,
          tags: "film,cinema,durban,festival",
          views: 0,
          averageRating: 0,
          totalTickets: 2000,
          ticketsSold: 0,
          video: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
        }
      ];

      // Define ticket types for each event
      const ticketTypesMap = {
        "Cape Town Jazz Festival 2025": [
          {
            name: "General Admission",
            description: "Standard festival access for all performances",
            price: "950",
            quantity: 3500,
            soldCount: 150,
            isActive: true
          },
          {
            name: "VIP Experience",
            description: "Premium seating, backstage access, and complimentary refreshments",
            price: "2500",
            quantity: 1000,
            soldCount: 75,
            isActive: true
          },
          {
            name: "Weekend Pass",
            description: "Full weekend access to all performances and special events",
            price: "1800",
            quantity: 500,
            soldCount: 30,
            isActive: true
          }
        ],
        "Soweto Wine & Lifestyle Festival": [
          {
            name: "Standard Entry",
            description: "Festival access with 5 wine tasting vouchers",
            price: "450",
            quantity: 750,
            soldCount: 80,
            isActive: true
          },
          {
            name: "Premium Package",
            description: "Festival access with 15 wine tasting vouchers and food pairing experience",
            price: "950",
            quantity: 200,
            soldCount: 45,
            isActive: true
          },
          {
            name: "VIP Connoisseur",
            description: "Exclusive access to premium wines, private tastings with winemakers, and full gourmet dinner",
            price: "1500",
            quantity: 50,
            soldCount: 12,
            isActive: true
          }
        ],
        "Durban International Film Festival 2025": [
          {
            name: "Single Screening",
            description: "Access to one film screening of your choice",
            price: "250",
            quantity: 1000,
            soldCount: 100,
            isActive: true
          },
          {
            name: "Festival Pass",
            description: "Access to all standard screenings throughout the festival",
            price: "1200",
            quantity: 800,
            soldCount: 65,
            isActive: true
          },
          {
            name: "Premium Pass",
            description: "Access to all screenings including premieres, plus invitation to opening and closing ceremonies",
            price: "2000",
            quantity: 200,
            soldCount: 20,
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
  });
}