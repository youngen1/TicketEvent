import { users, events, type User, type InsertUser, type Event, type InsertEvent } from "@shared/schema";
import { db } from "./db";
import { eq, asc } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Event methods
  getAllEvents(category?: string): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event>;
  toggleFavorite(id: number): Promise<Event>;
}

// Database implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async getAllEvents(category?: string): Promise<Event[]> {
    if (category) {
      return db
        .select()
        .from(events)
        .where(eq(events.category, category))
        .orderBy(asc(events.date));
    }
    
    return db.select().from(events).orderBy(asc(events.date));
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, id));
    return event;
  }
  
  async createEvent(eventData: InsertEvent): Promise<Event> {
    const [event] = await db.insert(events).values(eventData).returning();
    return event;
  }
  
  async toggleFavorite(id: number): Promise<Event> {
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, id));
    
    if (!event) {
      throw new Error(`Event with id ${id} not found`);
    }
    
    const [updatedEvent] = await db
      .update(events)
      .set({ isFavorite: !event.isFavorite })
      .where(eq(events.id, id))
      .returning();
    
    return updatedEvent;
  }

  // Add sample event data for development
  async seedEvents(): Promise<void> {
    // Check if events already exist
    const existingEvents = await db.select().from(events);
    if (existingEvents.length > 0) {
      return; // Skip seeding if events already exist
    }
    
    // Sample events to insert
    const sampleEvents: InsertEvent[] = [
      {
        title: "Tech Conference 2023",
        description: "Join us for the biggest tech conference of the year. Learn about the latest technologies and network with industry professionals.",
        category: "Technology",
        date: "2023-11-15",
        time: "09:00",
        location: "San Francisco Convention Center",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
        schedule: JSON.stringify([
          { time: "09:00", title: "Registration and Breakfast" },
          { time: "10:00", title: "Keynote: Future of AI", description: "By Dr. Sarah Johnson" },
          { time: "12:00", title: "Lunch Break" },
          { time: "13:00", title: "Workshop: Building with React", description: "Hands-on session" }
        ]),
      },
      {
        title: "Business Leadership Summit",
        description: "A summit for business leaders to discuss strategies and share insights on effective leadership and management.",
        category: "Business",
        date: "2023-12-05",
        time: "10:00",
        location: "Grand Hyatt Hotel, New York",
        image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80",
        schedule: JSON.stringify([
          { time: "10:00", title: "Welcome Address" },
          { time: "10:30", title: "Panel: Leadership in Crisis" },
          { time: "12:30", title: "Networking Lunch" }
        ]),
      },
      {
        title: "Summer Music Festival",
        description: "A three-day music festival featuring top artists from around the world. Enjoy music, food, and fun activities.",
        category: "Music",
        date: "2023-07-20",
        time: "14:00",
        location: "Central Park, New York",
        image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80",
        schedule: JSON.stringify([
          { time: "14:00", title: "Gates Open" },
          { time: "16:00", title: "Opening Act: Local Bands" },
          { time: "19:00", title: "Headliner Performance" }
        ]),
      },
      {
        title: "Art Exhibition: Modern Perspectives",
        description: "An exhibition showcasing modern art from emerging artists around the world.",
        category: "Art",
        date: "2023-09-10",
        time: "11:00",
        location: "Metropolitan Museum, New York",
        image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=800&q=80",
      },
      {
        title: "Education Technology Conference",
        description: "Learn about the latest technologies and methodologies in education.",
        category: "Education",
        date: "2023-10-25",
        time: "09:30",
        location: "Chicago Convention Center",
        image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
      },
      {
        title: "Annual Sports Conference",
        description: "A conference for sports professionals and enthusiasts to discuss the future of sports.",
        category: "Sports",
        date: "2023-11-30",
        time: "10:00",
        location: "Los Angeles Sports Arena",
        image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
      }
    ];
    
    // Insert all sample events
    for (const eventData of sampleEvents) {
      await db.insert(events).values({
        ...eventData,
        attendees: Math.floor(Math.random() * 100) + 50, // Random attendees between 50-150
        isFavorite: false
      });
    }
  }
}

export const storage = new DatabaseStorage();
