import {
  users, events, comments, eventRatings, eventAttendees, eventTickets, userFollows, ticketTypes,
  type User, type InsertUser,
  type Event, type InsertEvent,
  type Comment, type InsertComment,
  type EventRating, type InsertEventRating,
  type EventAttendee, type InsertEventAttendee,
  type EventTicket, type InsertEventTicket,
  type UserFollow, type InsertUserFollow,
  type TicketType, type InsertTicketType,
  type Event as EventType, // Assuming you have an Event type, aliased to EventType
  type UserFavorite as UserFavoriteType,
  ATTENDANCE_STATUS, InsertNotification,
  userEventFavorites, InsertUserFavorite
} from "@shared/schema";
import { db } from "./db";
import { eq, asc, desc, and, avg, count, sql } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  getUserEvents(userId: number): Promise<Event[]>;
  getAllUsers(): Promise<User[]>;
  searchUsers(query: string): Promise<User[]>;
  
  // Event methods
  getAllEvents(category?: string, tags?: string, featured?: boolean): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: number): Promise<void>;
  toggleFavorite(id: number): Promise<Event>;
  incrementEventViews(id: number): Promise<void>;
  getFeaturedEvents(limit?: number): Promise<Event[]>;
  searchEvents(query: string): Promise<Event[]>;
  
  // Comment methods
  getEventComments(eventId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, content: string): Promise<Comment>;
  deleteComment(id: number): Promise<void>;
  
  // Rating methods
  getEventRating(eventId: number, userId: number): Promise<EventRating | undefined>;
  createOrUpdateRating(rating: InsertEventRating): Promise<EventRating>;
  getAverageEventRating(eventId: number): Promise<number>;
  
  // Attendance methods
  getEventAttendees(eventId: number): Promise<EventAttendee[]>;
  getUserAttendance(userId: number, eventId: number): Promise<EventAttendee | undefined>;
  createOrUpdateAttendance(attendance: InsertEventAttendee): Promise<EventAttendee>;
  getUpcomingUserEvents(userId: number): Promise<Event[]>;
  
  // Ticket methods
  getUserTickets(userId: number): Promise<EventTicket[]>;
  createTicket(ticket: InsertEventTicket): Promise<EventTicket>;
  updateTicket(id: number, updates: Partial<EventTicket>): Promise<EventTicket>;
  getEventTickets(eventId: number): Promise<EventTicket[]>;
  getTicket(ticketId: number): Promise<EventTicket | undefined>;
  getTicketByReference(reference: string): Promise<EventTicket | undefined>;
  getAllTickets(): Promise<EventTicket[]>;
  hasUserPurchasedEventTicket(userId: number, eventId: number): Promise<boolean>;
  
  // Ticket type methods
  createTicketType(ticketType: InsertTicketType): Promise<TicketType>;
  getEventTicketTypes(eventId: number): Promise<TicketType[]>;
  getTicketType(id: number): Promise<TicketType | undefined>;
  
  // User follow methods
  getUserFollowers(userId: number): Promise<User[]>;
  getUserFollowing(userId: number): Promise<User[]>;
  followUser(followerId: number, followingId: number): Promise<UserFollow>;
  unfollowUser(followerId: number, followingId: number): Promise<void>;
  isFollowing(followerId: number, followingId: number): Promise<boolean>;
  getUsersToFollow(): Promise<User[]>;
  
  // Notification methods
  getUserNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: Notification): Promise<Notification>;
  markNotificationAsRead(notificationId: number): Promise<Notification>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
  deleteNotification(notificationId: number): Promise<void>;
  
  // User friendship methods (for mutual follows)
  getFriends(userId: number): Promise<User[]>;
  checkFriendship(userId1: number, userId2: number): Promise<boolean>;
}

// A simple in-memory storage implementation that can be used when database has issues
export class MemStorage implements IStorage {
  private users: User[] = [];
  private events: Event[] = [];
  private comments: Comment[] = [];
  private ratings: EventRating[] = [];
  private attendees: EventAttendee[] = [];
  private tickets: EventTicket[] = [];
  private userFollows: UserFollow[] = [];
  private notifications: Notification[] = [];
  private ticketTypes: TicketType[] = [];
  private nextUserId = 1;
  private nextEventId = 1;
  private nextCommentId = 1;
  private nextRatingId = 1;
  private nextAttendeeId = 1;
  private nextTicketId = 1;
  private nextUserFollowId = 1;
  private nextNotificationId = 1;
  private nextTicketTypeId = 1;

  constructor() {
    console.log("Initializing MemStorage...");
    
    // Create a default user
    this.users.push({
      id: this.nextUserId++, // Will be 1
      username: "demo",
      password: "$2a$10$JdP6aRBl9m4OFlniT/GGy.DeN9/LZhW1UcRTHFCZ7K5y1ivAbU.sG", // "password"
      createdAt: new Date(),
      updatedAt: new Date(),
      displayName: "Demo User",
      avatar: null,
      bio: null,
      email: "demo@example.com", // Added email for payment processing
      preferences: null,
      followersCount: 0,
      followingCount: 0,
      isAdmin: false,
      platformBalance: "0",
      location: "Cape Town, South Africa",
      latitude: -33.9249,
      longitude: 18.4241,
      gender: "other",
      dateOfBirth: "1990-01-01",
      interests: null,
      isBanned: false,
      emailVerified: null,
      verificationToken: null,
      verificationTokenExpiry: null,
      resetPasswordToken: null,
      resetPasswordTokenExpiry: null
    });
    
    // Create admin account
    this.users.push({
      id: this.nextUserId++, // Will be 2
      username: "admin",
      password: "$2a$10$JdP6aRBl9m4OFlniT/GGy.DeN9/LZhW1UcRTHFCZ7K5y1ivAbU.sG", // "password"
      createdAt: new Date(),
      updatedAt: new Date(),
      displayName: "System Admin",
      avatar: "https://ui-avatars.com/api/?name=System+Admin&background=random",
      bio: "System administrator account that collects platform fees",
      email: "admin@eventsystem.com",
      preferences: null,
      followersCount: 0,
      followingCount: 0,
      isAdmin: true,
      platformBalance: "0",
      location: "Johannesburg, South Africa",
      latitude: -26.2041,
      longitude: 28.0473,
      gender: "other",
      dateOfBirth: "1985-01-01",
      interests: null,
      isBanned: false,
      emailVerified: null,
      verificationToken: null,
      verificationTokenExpiry: null,
      resetPasswordToken: null,
      resetPasswordTokenExpiry: null
    });
    
    console.log("Created admin account with username: admin and password: password");
    
    // Create some sample users to follow with location data
    const locations = [
      { city: "Durban, South Africa", lat: -29.8587, lng: 31.0218 },
      { city: "Pretoria, South Africa", lat: -25.7479, lng: 28.2293 },
      { city: "Port Elizabeth, South Africa", lat: -33.7139, lng: 25.5207 },
      { city: "Bloemfontein, South Africa", lat: -29.0852, lng: 26.1596 },
      { city: "East London, South Africa", lat: -33.0292, lng: 27.8546 },
      { city: "Kimberley, South Africa", lat: -28.7282, lng: 24.7499 },
      { city: "Polokwane, South Africa", lat: -23.9045, lng: 29.4688 },
      { city: "Nelspruit, South Africa", lat: -25.4753, lng: 30.9694 }
    ];
    
    for (let i = 3; i <= 10; i++) {
      const locationIndex = i - 3;
      this.users.push({
        id: this.nextUserId++,
        username: `user${i}`,
        password: "$2a$10$JdP6aRBl9m4OFlniT/GGy.DeN9/LZhW1UcRTHFCZ7K5y1ivAbU.sG", // "password"
        createdAt: new Date(),
        updatedAt: new Date(),
        displayName: `User ${i}`,
        avatar: `https://ui-avatars.com/api/?name=User+${i}&background=random`,
        bio: `Bio for User ${i}`,
        email: `user${i}@example.com`,
        preferences: null,
        followersCount: 0,
        followingCount: 0,
        isAdmin: false,
        platformBalance: "0",
        location: locations[locationIndex].city,
        latitude: locations[locationIndex].lat,
        longitude: locations[locationIndex].lng,
        gender: "other",
        dateOfBirth: "1990-01-01",
        interests: null,
        isBanned: false,
        emailVerified: null,
        verificationToken: null,
        verificationTokenExpiry: null,
        resetPasswordToken: null,
        resetPasswordTokenExpiry: null
      });
    }
    
    // Seed followers and following relationships for the admin user (ID: 2)
    console.log("Setting up followers and following relationships for admin user");
    
    // Admin user follows users 3, 4, 5
    for (let i = 3; i <= 5; i++) {
      this.userFollows.push({
        id: this.nextUserFollowId++,
        followerId: 2, // Admin user ID
        followingId: i,
        createdAt: new Date(),

      });
    }
    
    // Users 6, 7, 8, 9, 10 follow the admin user
    for (let i = 6; i <= 10; i++) {
      this.userFollows.push({
        id: this.nextUserFollowId++,
        followerId: i,
        followingId: 2, // Admin user ID
        createdAt: new Date(),

      });
    }
    
    // Update follower and following counts
    this.users[1].followingCount = 3; // Admin user follows 3 people
    this.users[1].followersCount = 5; // Admin user has 5 followers
    
    // Add platform balance for admin (from platform fees)
    this.users[1].platformBalance = "142.50"; // Platform fee balance
    
    // Create some test tickets for the admin user
    console.log("Creating test tickets for admin user");
    
    // Add completed tickets for different events
    for (let i = 1; i <= 3; i++) {
      this.tickets.push({
        id: this.nextTicketId++,
        userId: 2, // Admin user ID
        eventId: i,
        quantity: 2,
        totalAmount: i === 1 ? 599.98 : (i === 2 ? 299.98 : 50),
        paymentReference: `ticket-${i}-${Date.now()}`,
        paymentStatus: "completed",
        purchaseDate: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)), // Different purchase dates
        createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
        updatedAt: null,
        ticketTypeId: null
      });
    }
    
    // Seed some events
    this.seedEvents();
    console.log(`Seeded ${this.events.length} events in memory storage`);
  }


  // Original events definition for reference
  private originalSeedEvents() {
    // Create sample events that match our schema
    const sampleEvents: Event[] = [
      {
        id: this.nextEventId++,
        title: "Tech Conference 2025",
        description: "Join us for a day of tech talks and networking",
        date: "2025-10-15",
        time: "09:00",
        location: "San Francisco, CA",
        category: "Technology",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1576124886577-6e4890d6d4dd?auto=format&fit=crop&w=800&q=80"
        ]),
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 120,
        attendees: 75,
        maxAttendees: 200,
        featured: true,
        video: null,
        tags: "tech,conference,networking",
        price: 299.99,
        isFree: false,
        rating: 4.8,
        ratingCount: 45,
        latitude: null,
        longitude: null,
        hasMultipleTicketTypes: null,
        ticketsSold: null,
        totalTickets: null,
        genderRestriction: null,
        ageRestriction: null
      },
      {
        attendees: 1250,
        category: "Music",
        createdAt: new Date(),
        date: "2025-06-22",
        description: "A weekend of music and fun under the sun with live performances from top artists",
        featured: true,
        id: this.nextEventId++,
        image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=800&q=80"
        ]),
        isFree: false,
        location: "Austin, TX",
        maxAttendees: 5000,
        price: 149.99,
        rating: 4.9,
        ratingCount: 320,
        tags: "music,festival,summer",
        time: "12:00",
        title: "Summer Music Festival",
        updatedAt: new Date(),
        userId: 1,
        video: null,
        views: 950,
        latitude: null,
        longitude: null,
        hasMultipleTicketTypes: null,
        ticketsSold: null,
        totalTickets: null,
        genderRestriction: null,
        ageRestriction: null
      },
      {
        id: this.nextEventId++,
        title: "Art Exhibition Opening",
        description: "Opening night of our latest art exhibition featuring contemporary artists",
        date: "2025-04-30",
        time: "18:00",
        location: "New York, NY",
        category: "Art",
        image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=800&q=80",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1501699169021-3759ee435d66?auto=format&fit=crop&w=800&q=80"
        ]),
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 250,
        attendees: 45,
        maxAttendees: 100,
        featured: false,
        video: null,
        tags: "art,exhibition,culture",
        price: 25,
        isFree: false,
        rating: 4.2,
        ratingCount: 18,
        latitude: null,
        longitude: null,
        hasMultipleTicketTypes: null,
        ticketsSold: null,
        totalTickets: null,
        genderRestriction: null,
        ageRestriction: null
      },
      {
        id: this.nextEventId++,
        title: "Free Community Workshop",
        description: "Learn new skills at our community workshop - open to all",
        date: "2025-05-15",
        time: "10:00",
        location: "Chicago, IL",
        category: "Education",
        image: "https://images.unsplash.com/photo-1544531585-9847b68c8c86?auto=format&fit=crop&w=800&q=80",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1544531585-9847b68c8c86?auto=format&fit=crop&w=800&q=80"
        ]),
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 85,
        attendees: 24,
        maxAttendees: 50,
        featured: false,
        video: null,
        tags: "education,workshop,community",
        price: 0,
        isFree: true,
        rating: 4.5,
        ratingCount: 12,
        latitude: null,
        longitude: null,
        hasMultipleTicketTypes: null,
        ticketsSold: null,
        totalTickets: null,
        genderRestriction: null,
        ageRestriction: null
      },
      {
        id: this.nextEventId++,
        title: "R2 Live Payment Test Event",
        description: "A small test event that costs exactly R2 to test the live payment system",
        date: "2025-05-01",
        time: "18:00",
        location: "Johannesburg",
        category: "Testing",
        image: "https://images.unsplash.com/photo-1556745753-b2904692b3cd?auto=format&fit=crop&w=800&q=80",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1556745753-b2904692b3cd?auto=format&fit=crop&w=800&q=80"
        ]),
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 0,
        attendees: 0,
        maxAttendees: 100,
        featured: false,
        video: null,
        tags: "test,payment,R2,budget",
        price: 2,
        isFree: false,
        rating: 0,
        ratingCount: 0
      },
      {
        id: this.nextEventId++,
        title: "R3 Live Payment Test Event",
        description: "A test event that costs exactly R3 to test the live payment system",
        date: "2025-05-10",
        time: "18:00",
        location: "Cape Town",
        category: "Testing",
        image: "https://images.unsplash.com/photo-1560439514-4e9645039924?auto=format&fit=crop&w=800&q=80",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1560439514-4e9645039924?auto=format&fit=crop&w=800&q=80"
        ]),
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 0,
        attendees: 0,
        maxAttendees: 100,
        featured: false,
        video: null,
        tags: "test,payment,R3,live",
        price: 3,
        isFree: false,
        rating: 0,
        ratingCount: 0
      },
      {
        id: this.nextEventId++,
        title: "Video Demo Event",
        description: "An event showcasing video upload capabilities with our new 80MB limit",
        date: "2025-06-15",
        time: "19:00",
        location: "Virtual Event",
        category: "Technology",
        image: "https://images.unsplash.com/photo-1492619267744-f1e10ae9097c?auto=format&fit=crop&w=800&q=80",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1492619267744-f1e10ae9097c?auto=format&fit=crop&w=800&q=80"
        ]),
        userId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 42,
        attendees: 18,
        maxAttendees: 200,
        featured: true,
        video: "/uploads/videos/sample_video.mp4",
        tags: "video,demo,technology",
        price: 15,
        isFree: false,
        rating: 4.7,
        ratingCount: 8
      },
      {
        id: this.nextEventId++,
        title: "Interactive Virtual Concert",
        description: "Join us for a fully virtual concert experience with high-definition video",
        date: "2025-07-20",
        time: "20:00",
        location: "Online",
        category: "Entertainment",
        image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80"
        ]),
        userId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 128,
        attendees: 62,
        maxAttendees: 1000,
        featured: true,
        video: "/uploads/videos/sample_video2.mp4",
        tags: "virtual,concert,video,music",
        price: 25,
        isFree: false,
        rating: 4.9,
        ratingCount: 15
      }
    ];
    
    // Assign events to the class property
    this.events = sampleEvents;
    
    console.log(`Successfully seeded ${this.events.length} events to memory storage`);
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }
  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.nextUserId++,
      ...insertUser,
      createdAt: new Date(),
      updatedAt: new Date(),
      displayName: null,
      avatar: null,
      bio: null
    };
    this.users.push(user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) {
      throw new Error(`User with id ${id} not found`);
    }
    
    this.users[index] = {
      ...this.users[index],
      ...userData,
      updatedAt: new Date()
    };
    
    return this.users[index];
  }

  async getUserEvents(userId: number): Promise<Event[]> {
    return this.events.filter(event => event.userId === userId);
  }

  // Event methods
  async getAllEvents(category?: string, tags?: string, featured?: boolean): Promise<Event[]> {
    console.log(`Getting all events. Total events in memory: ${this.events.length}`);
    console.log(`Events: ${JSON.stringify(this.events.map(e => ({ id: e.id, title: e.title })))}`);
    
    let filteredEvents = [...this.events];
    
    if (category) {
      filteredEvents = filteredEvents.filter(event => event.category === category);
    }
    
    if (tags) {
      filteredEvents = filteredEvents.filter(event => 
        event.tags && event.tags.includes(tags));
    }
    
    if (featured === true) {
      filteredEvents = filteredEvents.filter(event => event.featured === true);
    }
    
    console.log(`Returning ${filteredEvents.length} events`);
    return filteredEvents;
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.find(event => event.id === id);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const newEvent: Event = {
      id: this.nextEventId++,
      ...event,
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      attendees: 0,
      maxAttendees: event.maxAttendees || 100,
      featured: false
    };
    
    this.events.push(newEvent);
    return newEvent;
  }

  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event> {
    const index = this.events.findIndex(event => event.id === id);
    if (index === -1) {
      throw new Error(`Event with id ${id} not found`);
    }
    
    this.events[index] = {
      ...this.events[index],
      ...eventData,
      updatedAt: new Date()
    };
    
    return this.events[index];
  }
  
  async deleteEvent(id: number): Promise<void> {
    console.log(`Deleting event with ID: ${id}`);
    const eventIndex = this.events.findIndex(event => event.id === id);
    
    if (eventIndex === -1) {
      throw new Error(`Event with id ${id} not found`);
    }
    
    // Delete the event from the array
    this.events.splice(eventIndex, 1);
    console.log(`Event with ID ${id} deleted successfully`);
    
    // In a real app, you would also delete related data (comments, tickets, etc.)
    // For now, we'll just delete what we can
    this.comments = this.comments.filter(comment => comment.eventId !== id);
    this.attendees = this.attendees.filter(attendee => attendee.eventId !== id);
    this.tickets = this.tickets.filter(ticket => ticket.eventId !== id);
    this.ratings = this.ratings.filter(rating => rating.eventId !== id);
    this.ticketTypes = this.ticketTypes.filter(ticketType => ticketType.eventId !== id);
  }

  async toggleFavorite(id: number): Promise<Event> {
    const index = this.events.findIndex(event => event.id === id);
    if (index === -1) {
      throw new Error(`Event with id ${id} not found`);
    }
    
    // For in-memory implementation, we'll just toggle a property
    const event = this.events[index];
    const favorited = !event.favorited;
    
    this.events[index] = {
      ...event,
      favorited
    };
    
    return this.events[index];
  }

  async incrementEventViews(id: number): Promise<void> {
    const index = this.events.findIndex(event => event.id === id);
    if (index !== -1) {
      this.events[index].views = (this.events[index].views || 0) + 1;
    }
  }

  async getFeaturedEvents(limit: number = 5): Promise<Event[]> {
    return this.events
      .filter(event => event.featured)
      .slice(0, limit);
  }

  async searchEvents(query: string): Promise<Event[]> {
    const lowerQuery = query.toLowerCase();
    return this.events.filter(event => 
      (event.title && event.title.toLowerCase().includes(lowerQuery)) ||
      (event.description && event.description.toLowerCase().includes(lowerQuery)) ||
      (event.location && event.location.toLowerCase().includes(lowerQuery)) ||
      (event.category && event.category.toLowerCase().includes(lowerQuery))
    );
  }

  // Comment methods
  async getEventComments(eventId: number): Promise<Comment[]> {
    return this.comments
      .filter(comment => comment.eventId === eventId)
      .map(comment => {
        const user = this.users.find(u => u.id === comment.userId);
        return {
          ...comment,
          username: user?.username || 'Anonymous',
          displayName: user?.displayName,
          avatar: user?.avatar
        };
      })
      .sort((a, b) => {
        const dateA = a.createdAt || new Date(0);
        const dateB = b.createdAt || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const newComment: Comment = {
      id: this.nextCommentId++,
      ...comment,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.comments.push(newComment);
    return newComment;
  }

  async updateComment(id: number, content: string): Promise<Comment> {
    const index = this.comments.findIndex(comment => comment.id === id);
    if (index === -1) {
      throw new Error(`Comment with id ${id} not found`);
    }
    
    this.comments[index] = {
      ...this.comments[index],
      content,
      updatedAt: new Date()
    };
    
    return this.comments[index];
  }

  async deleteComment(id: number): Promise<void> {
    const index = this.comments.findIndex(comment => comment.id === id);
    if (index !== -1) {
      this.comments.splice(index, 1);
    }
  }

  // Rating methods
  async getEventRating(eventId: number, userId: number): Promise<EventRating | undefined> {
    return this.ratings.find(rating => 
      rating.eventId === eventId && rating.userId === userId
    );
  }

  async createOrUpdateRating(rating: InsertEventRating): Promise<EventRating> {
    const existingRating = await this.getEventRating(rating.eventId, rating.userId);
    
    if (existingRating) {
      const index = this.ratings.findIndex(r => r.id === existingRating.id);
      this.ratings[index] = {
        ...existingRating,
        value: rating.value,
        updatedAt: new Date()
      };
      
      await this.updateEventRatingAverage(rating.eventId);
      return this.ratings[index];
    } else {
      const newRating: EventRating = {
        id: this.nextRatingId++,
        ...rating,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.ratings.push(newRating);
      await this.updateEventRatingAverage(rating.eventId);
      return newRating;
    }
  }

  async getAverageEventRating(eventId: number): Promise<number> {
    const eventRatings = this.ratings.filter(rating => rating.eventId === eventId);
    if (eventRatings.length === 0) {
      return 0;
    }
    
    const sum = eventRatings.reduce((total, rating) => total + (rating.value || 0), 0);
    return sum / eventRatings.length;
  }

  private async updateEventRatingAverage(eventId: number): Promise<void> {
    const eventIndex = this.events.findIndex(event => event.id === eventId);
    if (eventIndex !== -1) {
      const average = await this.getAverageEventRating(eventId);
      const ratingsCount = this.ratings.filter(rating => rating.eventId === eventId).length;
      
      this.events[eventIndex] = {
        ...this.events[eventIndex],
        rating: average,
        ratingCount: ratingsCount
      };
    }
  }

  // Attendance methods
  async getEventAttendees(eventId: number): Promise<EventAttendee[]> {
    return this.attendees
      .filter(attendee => attendee.eventId === eventId)
      .map(attendee => {
        const user = this.users.find(u => u.id === attendee.userId);
        return {
          ...attendee,
          username: user?.username || 'Anonymous',
          displayName: user?.displayName,
          avatar: user?.avatar
        };
      });
  }

  async getUserAttendance(userId: number, eventId: number): Promise<EventAttendee | undefined> {
    return this.attendees.find(attendee => 
      attendee.userId === userId && attendee.eventId === eventId
    );
  }

  async createOrUpdateAttendance(attendance: InsertEventAttendee): Promise<EventAttendee> {
    const existingAttendance = await this.getUserAttendance(attendance.userId, attendance.eventId);
    
    if (existingAttendance) {
      const index = this.attendees.findIndex(a => a.id === existingAttendance.id);
      this.attendees[index] = {
        ...existingAttendance,
        status: attendance.status,
        updatedAt: new Date()
      };
      
      await this.updateEventAttendeeCount(attendance.eventId);
      return this.attendees[index];
    } else {
      const newAttendance: EventAttendee = {
        id: this.nextAttendeeId++,
        ...attendance,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.attendees.push(newAttendance);
      await this.updateEventAttendeeCount(attendance.eventId);
      return newAttendance;
    }
  }

  async getUpcomingUserEvents(userId: number): Promise<Event[]> {
    const userAttendances = this.attendees.filter(
      attendee => attendee.userId === userId && 
      attendee.status === ATTENDANCE_STATUS.GOING
    );
    
    const eventIds = userAttendances.map(attendance => attendance.eventId);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    return this.events.filter(event => 
      eventIds.includes(event.id) && event.date >= todayStr
    ).sort((a, b) => {
      if (a.date === b.date) {
        return (a.time || '').localeCompare(b.time || '');
      }
      return a.date.localeCompare(b.date);
    });
  }

  private async updateEventAttendeeCount(eventId: number): Promise<void> {
    const eventIndex = this.events.findIndex(event => event.id === eventId);
    if (eventIndex !== -1) {
      const goingAttendees = this.attendees.filter(
        attendee => attendee.eventId === eventId && 
        attendee.status === ATTENDANCE_STATUS.GOING
      ).length;
      
      this.events[eventIndex] = {
        ...this.events[eventIndex],
        attendees: goingAttendees
      };
    }
  }
  
  // Ticket methods
  async getUserTickets(userId: number): Promise<EventTicket[]> {
    // Only show tickets that are completed or pending, exclude failed payments
    return this.tickets
      .filter(ticket => 
        ticket.userId === userId && 
        (ticket.paymentStatus === "completed" || ticket.paymentStatus === "pending") &&
        ticket.paymentStatus !== "failed"
      )
      .sort((a, b) => {
        const dateA = new Date(a.purchaseDate || 0);
        const dateB = new Date(b.purchaseDate || 0);
        return dateB.getTime() - dateA.getTime();
      });
  }

  async createTicket(ticket: InsertEventTicket): Promise<EventTicket> {
    const newTicket: EventTicket = {
      id: this.nextTicketId++,
      ...ticket,
      purchaseDate: new Date(),
      createdAt: new Date(),
      updatedAt: null
    };
    
    this.tickets.push(newTicket);
    
    // Only process platform fee for completed tickets
    if (newTicket.paymentStatus === 'completed') {
      await this.processPlatformFee(newTicket);
    }
    
    return newTicket;
  }
  
  // Process the 15% platform fee and credit it to the admin account
  private async processPlatformFee(ticket: EventTicket): Promise<void> {
    try {
      // Find the admin account
      const adminUser = this.users.find(user => user.isAdmin === true);
      if (!adminUser) {
        console.error('No admin account found to credit platform fee');
        return;
      }
      
      // Calculate the platform fee (15% of the ticket price)
      const ticketAmount = parseFloat(ticket.totalAmount?.toString() || '0');
      const platformFee = ticketAmount * 0.15;
      
      // Update the admin's platform balance
      const currentBalance = parseFloat(adminUser.platformBalance || "0");
      const newBalance = currentBalance + platformFee;
      
      // Update the admin user with the new balance
      adminUser.platformBalance = newBalance.toString();
      
      console.log(`Credited R${platformFee.toFixed(2)} platform fee to admin account. New balance: R${newBalance.toFixed(2)}`);
    } catch (error) {
      console.error('Error processing platform fee:', error);
    }
  }

  async getEventTickets(eventId: number): Promise<EventTicket[]> {
    return this.tickets.filter(ticket => ticket.eventId === eventId);
  }

  async getTicket(ticketId: number): Promise<EventTicket | undefined> {
    return this.tickets.find(ticket => ticket.id === ticketId);
  }

  async getTicketByReference(reference: string): Promise<EventTicket | undefined> {
    return this.tickets.find(ticket => ticket.paymentReference === reference);
  }

  async updateTicket(id: number, updates: Partial<EventTicket>): Promise<EventTicket> {
    const index = this.tickets.findIndex(ticket => ticket.id === id);
    
    if (index === -1) {
      throw new Error(`Ticket with id ${id} not found`);
    }
    
    const oldTicket = this.tickets[index];
    
    // Update ticket with new values
    this.tickets[index] = {
      ...this.tickets[index],
      ...updates,
      updatedAt: new Date()
    };
    
    const updatedTicket = this.tickets[index];
    
    // If ticket status is being updated from something else to 'completed'
    // then process the platform fee
    if (
      oldTicket.paymentStatus !== 'completed' && 
      updatedTicket.paymentStatus === 'completed'
    ) {
      await this.processPlatformFee(updatedTicket);
    }
    
    return updatedTicket;
  }
  
  // Ticket type methods
  async createTicketType(ticketType: InsertTicketType): Promise<TicketType> {
    const newTicketType: TicketType = {
      id: this.nextTicketTypeId++,
      eventId: ticketType.eventId,
      name: ticketType.name,
      description: ticketType.description || '',
      price: ticketType.price,
      quantity: ticketType.quantity,
      soldCount: 0,
      isActive: ticketType.isActive !== undefined ? ticketType.isActive : true,
      createdAt: new Date(),
      updatedAt: null
    };
    
    this.ticketTypes.push(newTicketType);
    return newTicketType;
  }
  
  async getEventTicketTypes(eventId: number): Promise<TicketType[]> {
    return this.ticketTypes.filter(ticketType => ticketType.eventId === eventId);
  }
  
  async getTicketType(id: number): Promise<TicketType | undefined> {
    return this.ticketTypes.find(ticketType => ticketType.id === id);
  }
  
  // User follow methods
  async getUserFollowers(userId: number): Promise<User[]> {
    // Find all follows where the user is being followed
    const followerIds = this.userFollows
      .filter(follow => follow.followingId === userId)
      .map(follow => follow.followerId);
      
    // Get the user objects for these followers
    return this.users.filter(user => followerIds.includes(user.id));
  }
  
  async getUserFollowing(userId: number): Promise<User[]> {
    // Find all follows where the user is following someone else
    const followingIds = this.userFollows
      .filter(follow => follow.followerId === userId)
      .map(follow => follow.followingId);
      
    // Get the user objects being followed
    return this.users.filter(user => followingIds.includes(user.id));
  }
  
  async followUser(followerId: number, followingId: number): Promise<UserFollow> {
    // Check if users exist
    const follower = await this.getUser(followerId);
    const following = await this.getUser(followingId);
    
    if (!follower) {
      throw new Error(`Follower user with id ${followerId} not found`);
    }
    
    if (!following) {
      throw new Error(`Following user with id ${followingId} not found`);
    }
    
    // Check if already following
    const existingFollow = this.userFollows.find(
      follow => follow.followerId === followerId && follow.followingId === followingId
    );
    
    if (existingFollow) {
      return existingFollow; // Already following
    }
    
    // Create new follow relationship
    const newFollow: UserFollow = {
      id: this.nextUserFollowId++,
      followerId,
      followingId,
      createdAt: new Date()
    };
    
    this.userFollows.push(newFollow);
    
    // Update follower and following counts
    this.updateUserFollowStats(followerId, followingId);
    
    return newFollow;
  }
  
  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    const index = this.userFollows.findIndex(
      follow => follow.followerId === followerId && follow.followingId === followingId
    );
    
    if (index !== -1) {
      // Remove the follow relationship
      this.userFollows.splice(index, 1);
      
      // Update follower and following counts
      this.updateUserFollowStats(followerId, followingId);
    }
  }
  
  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    return this.userFollows.some(
      follow => follow.followerId === followerId && follow.followingId === followingId
    );
  }
  
  // Helper method to update follower and following counts
  private async updateUserFollowStats(followerId: number, followingId: number): Promise<void> {
    // Update follower's following count
    const followerIndex = this.users.findIndex(user => user.id === followerId);
    if (followerIndex !== -1) {
      const followingCount = this.userFollows.filter(follow => follow.followerId === followerId).length;
      this.users[followerIndex] = {
        ...this.users[followerIndex],
        followingCount
      };
    }
    
    // Update following's followers count
    const followingIndex = this.users.findIndex(user => user.id === followingId);
    if (followingIndex !== -1) {
      const followersCount = this.userFollows.filter(follow => follow.followingId === followingId).length;
      this.users[followingIndex] = {
        ...this.users[followingIndex],
        followersCount
      };
    }
  }

  // Get all users for the follow feature
  async getUsersToFollow(): Promise<User[]> {
    return this.users;
  }
  
  // Get all users (for admin purposes)
  async getAllUsers(): Promise<User[]> {
    return this.users;
  }
  
  async searchUsers(query: string, locationQuery?: string, maxDistance?: number): Promise<User[]> {
    // If no query and no location query, return empty array
    if (!query && !locationQuery) {
      return [];
    }
    
    // If only locationQuery is provided, search only by location
    if (!query && locationQuery) {
      return this.users.filter(user => {
        if (user.location) {
          return user.location.toLowerCase().includes(locationQuery.toLowerCase());
        }
        return false;
      });
    }
    
    // If only query is provided (no location), search by name, email, etc.
    if (query && !locationQuery) {
      const lowerCaseQuery = query.toLowerCase();
      return this.users.filter(user => {
        return (
          user.username.toLowerCase().includes(lowerCaseQuery) ||
          (user.displayName && user.displayName.toLowerCase().includes(lowerCaseQuery)) ||
          (user.bio && user.bio.toLowerCase().includes(lowerCaseQuery)) ||
          (user.email && user.email.toLowerCase().includes(lowerCaseQuery))
        );
      });
    }
    
    // If both query and locationQuery are provided, search by both
    const lowerCaseQuery = query.toLowerCase();
    const textFilteredUsers = this.users.filter(user => {
      return (
        user.username.toLowerCase().includes(lowerCaseQuery) ||
        (user.displayName && user.displayName.toLowerCase().includes(lowerCaseQuery)) ||
        (user.bio && user.bio.toLowerCase().includes(lowerCaseQuery)) ||
        (user.email && user.email.toLowerCase().includes(lowerCaseQuery))
      );
    });
    
    // Add location filter
    return textFilteredUsers.filter(user => {
      if (user.location) {
        return user.location.toLowerCase().includes(locationQuery!.toLowerCase());
      }
      return false;
    });
  }
  
  // Get all tickets (for admin purposes)
  async getAllTickets(): Promise<EventTicket[]> {
    return this.tickets;
  }

  async hasUserPurchasedEventTicket(userId: number, eventId: number): Promise<boolean> {
    // Find any ticket for this user and event with completed or pending status
    const existingTicket = this.tickets.find(ticket => 
      ticket.userId === userId && 
      ticket.eventId === eventId && 
      (ticket.paymentStatus === 'completed' || ticket.paymentStatus === 'pending')
    );
    
    return !!existingTicket; // Convert to boolean
  }
  
  // Extra properties to make TypeScript happy
  async seedEvents(): Promise<void> {
    // Already done in constructor
    return Promise.resolve();
  }

  // Notification methods
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return this.notifications.filter(notification => notification.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const newNotification: Notification = {
      id: this.nextNotificationId++,
      ...notification,
      isRead: false,
      createdAt: new Date(),
    };
    this.notifications.push(newNotification);
    return newNotification;
  }

  async markNotificationAsRead(notificationId: number): Promise<Notification> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (!notification) {
      throw new Error(`Notification with ID ${notificationId} not found`);
    }
    notification.isRead = true;
    return notification;
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    this.notifications
      .filter(notification => notification.userId === userId)
      .forEach(notification => {
        notification.isRead = true;
      });
  }

  async deleteNotification(notificationId: number): Promise<void> {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index === -1) {
      throw new Error(`Notification with ID ${notificationId} not found`);
    }
    this.notifications.splice(index, 1);
  }

  // Friendship methods (for mutual follows)
  async getFriends(userId: number): Promise<User[]> {
    // Get all users who user is following
    const following = await this.getUserFollowing(userId);
    const followingIds = following.map(user => user.id);
    
    // Get all users who follow user
    const followers = await this.getUserFollowers(userId);
    
    // Return only users who are in both lists (mutual follows)
    return followers.filter(follower => followingIds.includes(follower.id));
  }

  async checkFriendship(userId1: number, userId2: number): Promise<boolean> {
    // Check if userId1 follows userId2
    const follows1to2 = await this.isFollowing(userId1, userId2);
    
    // Check if userId2 follows userId1
    const follows2to1 = await this.isFollowing(userId2, userId1);
    
    // Return true if both follow each other
    return follows1to2 && follows2to1;
  }
}

// Database implementation
export class DatabaseStorage implements IStorage {
  // Check if user has purchased a ticket for an event
  async hasUserPurchasedEventTicket(userId: number, eventId: number): Promise<boolean> {
    const tickets = await db
      .select()
      .from(eventTickets)
      .where(
        and(
          eq(eventTickets.userId, userId),
          eq(eventTickets.eventId, eventId),
          or(
            eq(eventTickets.paymentStatus, 'completed'),
            eq(eventTickets.paymentStatus, 'pending')
          )
        )
      );
    
    return tickets.length > 0;
  }

  // Ticket Type methods
  async createTicketType(ticketType: InsertTicketType): Promise<TicketType> {
    const [newTicketType] = await db
      .insert(ticketTypes)
      .values(ticketType)
      .returning();
    return newTicketType;
  }
  
  async getEventTicketTypes(eventId: number): Promise<TicketType[]> {
    return db
      .select()
      .from(ticketTypes)
      .where(eq(ticketTypes.eventId, eventId))
      .orderBy(asc(ticketTypes.name));
  }
  
  async getTicketType(id: number): Promise<TicketType | undefined> {
    const [ticketType] = await db
      .select()
      .from(ticketTypes)
      .where(eq(ticketTypes.id, id));
    return ticketType;
  }
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
  
  async getUsersToFollow(): Promise<User[]> {
    return db.select().from(users).limit(20);
  }
  async addUserFavorite(data: InsertUserFavorite): Promise<UserFavoriteType | null> {
    try {
      // The unique constraint on (userId, eventId) will prevent duplicates.
      // Drizzle's .onConflictDoNothing() is a good way to handle this gracefully.
      const result = await db.insert(userEventFavorites)
          .values({
            userId: data.userId,
            eventId: data.eventId,
            // createdAt is defaultNow()
          })
          .onConflictDoNothing() // If the (userId, eventId) pair already exists due to the unique constraint, do nothing
          .returning();        // Get the inserted row (or empty array if conflict)

      if (result.length > 0) {
        console.log(`User ${data.userId} favorited event ${data.eventId}`);
        return result[0] as UserFavoriteType; // Cast to your defined type
      } else {
        // This means there was a conflict (already favorited)
        console.log(`User ${data.userId} already favorited event ${data.eventId}. No action taken.`);
        // You might want to fetch the existing record if needed, or just return null/undefined
        const existing = await db.query.userEventFavorites.findFirst({
          where: and(eq(userEventFavorites.userId, data.userId), eq(userEventFavorites.eventId, data.eventId))
        });
        return existing || null;
      }
    } catch (error) {
      console.error(`Error adding favorite for user ${data.userId}, event ${data.eventId}:`, error);
      throw new Error('Could not add event to favorites.');
    }
  }

  async removeUserFavorite(userId: number, eventId: number): Promise<boolean> {
    try {
      const result = await db.delete(userEventFavorites).where(
          and(
              eq(userEventFavorites.userId, userId),
              eq(userEventFavorites.eventId, eventId)
          )
      ).returning(); // Drizzle returns the deleted rows (or an empty array if none matched)

      if (result.length > 0) {
        console.log(`User ${userId} unfavorited event ${eventId}`);
        return true; // Successfully deleted
      }
      return false; // No record found to delete
    } catch (error) {
      console.error(`Error removing favorite for user ${userId}, event ${eventId}:`, error);
      throw new Error('Could not remove event from favorites.');
    }
  }

  async isEventFavoritedByUser(userId: number, eventId: number): Promise<boolean> {
    try {
      const favoriteRecord = await db.query.userEventFavorites.findFirst({
        where: and(
            eq(userEventFavorites.userId, userId),
            eq(userEventFavorites.eventId, eventId)
        )
      });
      return !!favoriteRecord; // Convert to boolean (true if record exists, false otherwise)
    } catch (error) {
      console.error(`Error checking favorite status for user ${userId}, event ${eventId}:`, error);
      throw new Error('Could not check favorite status.');
    }
  }

async toggleUserFavorite(userId: number, eventId: number): Promise<{ isFavorited: boolean; favoriteEntry: UserFavoriteType | null }> {
  const isCurrentlyFavorited = await this.isEventFavoritedByUser(userId, eventId);

  if (isCurrentlyFavorited) {
    await this.removeUserFavorite(userId, eventId);
    return { isFavorited: false, favoriteEntry: null };
  } else {
    const newFavoriteEntry = await this.addUserFavorite({ userId, eventId });
    return { isFavorited: true, favoriteEntry: newFavoriteEntry };
  }
}

async getUserFavoriteRecords(userId: number): Promise<UserFavoriteType[]> {
  try {
    const favoriteEntries = await db.query.userEventFavorites.findMany({
      where: eq(userEventFavorites.userId, userId),
      orderBy: [desc(userEventFavorites.createdAt)],
      with: {
        // event: true, // If you want the full event object
      }
    });
    return favoriteEntries as UserFavoriteType[];
  } catch (error) {
    console.error(`Error fetching favorite entries for user ${userId}:`, error);
    throw new Error('Could not fetch favorite entries.');
  }
}

async getUserFavoriteEvents(userId: number): Promise<EventType[]> { // Returns EventType
  try {
    const favoriteEntries = await db
        .select({ event: events })
        .from(userEventFavorites)
        .innerJoin(events, eq(userEventFavorites.eventId, events.id))
        .where(eq(userEventFavorites.userId, userId))
        .orderBy(desc(userEventFavorites.createdAt));

    return favoriteEntries.map(entry => entry.event as EventType);
  } catch (error) {
    console.error(`Error fetching favorite events for user ${userId}:`, error);
    throw new Error('Could not fetch favorite events.');
  }
}

  async searchUsers(query: string, locationQuery?: string, maxDistance?: number): Promise<User[]> {
    let queryBuilder = db
      .select()
      .from(users);
    
    // Add text search filter
    queryBuilder = queryBuilder.where(
      sql`${users.username} ILIKE ${'%' + query + '%'} OR 
          ${users.displayName} ILIKE ${'%' + query + '%'} OR
          ${users.bio} ILIKE ${'%' + query + '%'} OR
          ${users.email} ILIKE ${'%' + query + '%'}`
    );
    
    // Add location filter if provided
    if (locationQuery) {
      queryBuilder = queryBuilder.where(
        sql`${users.location} ILIKE ${'%' + locationQuery + '%'}`
      );
    }
    
    // Return the results
    return queryBuilder.limit(20);
  }
  
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error(`User with id ${id} not found`);
    }
    
    return updatedUser;
  }
  
  async getUserEvents(userId: number): Promise<Event[]> {
    return db
      .select()
      .from(events)
      .where(eq(events.createdById, userId))
      .orderBy(desc(events.createdAt));
  }
  
  async getAllEvents(category?: string, tags?: string, featured?: boolean): Promise<Event[]> {
    let queryBuilder = db.select().from(events);
    
    // Create conditions array
    const conditions = [];
    
    if (category) {
      conditions.push(eq(events.category, category));
    }
    
    if (tags) {
      // Simple string matching for tags - in a real app, you might want to use a more sophisticated tags system
      conditions.push(sql`${events.tags} like ${'%' + tags + '%'}`);
    }
    
    if (featured === true) {
      conditions.push(eq(events.isFeatured, true));
    }
    
    // Apply conditions if any
    if (conditions.length > 0) {
      // Apply each condition with AND
      for (const condition of conditions) {
        queryBuilder = queryBuilder.where(condition);
      }
    }
    
    return queryBuilder.orderBy(asc(events.date));
  }
  
  async incrementEventViews(id: number): Promise<void> {
    await db
      .update(events)
      .set({
        views: sql`${events.views} + 1`
      })
      .where(eq(events.id, id));
  }
  
  async getFeaturedEvents(limit: number = 5): Promise<Event[]> {
    return db
      .select()
      .from(events)
      .where(eq(events.isFeatured, true))
      .orderBy(desc(events.createdAt))
      .limit(limit);
  }
  
  async searchEvents(query: string): Promise<Event[]> {
    return db
      .select()
      .from(events)
      .where(
        sql`${events.title} ILIKE ${'%' + query + '%'} OR 
            ${events.description} ILIKE ${'%' + query + '%'} OR
            ${events.location} ILIKE ${'%' + query + '%'} OR
            ${events.category} ILIKE ${'%' + query + '%'}`
      )
      .orderBy(asc(events.date));
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
  
  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event> {
    const [updatedEvent] = await db
      .update(events)
      .set(eventData)
      .where(eq(events.id, id))
      .returning();
    
    if (!updatedEvent) {
      throw new Error(`Event with id ${id} not found`);
    }
    
    return updatedEvent;
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

  // Comment methods
  async getEventComments(eventId: number): Promise<Comment[]> {
    return db
      .select({
        id: comments.id,
        content: comments.content,
        userId: comments.userId,
        eventId: comments.eventId,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        username: users.username,
        displayName: users.displayName,
        avatar: users.avatar
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.eventId, eventId))
      .orderBy(desc(comments.createdAt));
  }
  
  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db
      .insert(comments)
      .values({
        ...comment,
        createdAt: new Date()
      })
      .returning();
    
    return newComment;
  }
  
  async updateComment(id: number, content: string): Promise<Comment> {
    const [updatedComment] = await db
      .update(comments)
      .set({
        content,
        updatedAt: new Date()
      })
      .where(eq(comments.id, id))
      .returning();
    
    if (!updatedComment) {
      throw new Error(`Comment with id ${id} not found`);
    }
    
    return updatedComment;
  }
  
  async deleteComment(id: number): Promise<void> {
    await db
      .delete(comments)
      .where(eq(comments.id, id));
  }
  
  // Rating methods
  async getEventRating(eventId: number, userId: number): Promise<EventRating | undefined> {
    const [rating] = await db
      .select()
      .from(eventRatings)
      .where(
        and(
          eq(eventRatings.eventId, eventId),
          eq(eventRatings.userId, userId)
        )
      );
    
    return rating;
  }
  
  async createOrUpdateRating(rating: InsertEventRating): Promise<EventRating> {
    // Check if rating already exists
    const existingRating = await this.getEventRating(rating.eventId, rating.userId);
    
    if (existingRating) {
      // Update existing rating
      const [updatedRating] = await db
        .update(eventRatings)
        .set({ rating: rating.rating })
        .where(eq(eventRatings.id, existingRating.id))
        .returning();
        
      // Update event average rating
      await this.updateEventRatingAverage(rating.eventId);
      
      return updatedRating;
    } else {
      // Create new rating
      const [newRating] = await db
        .insert(eventRatings)
        .values(rating)
        .returning();
        
      // Update event average rating
      await this.updateEventRatingAverage(rating.eventId);
      
      return newRating;
    }
  }
  
  async getAverageEventRating(eventId: number): Promise<number> {
    const result = await db
      .select({
        averageRating: avg(eventRatings.rating)
      })
      .from(eventRatings)
      .where(eq(eventRatings.eventId, eventId));
    
    return result[0]?.averageRating || 0;
  }
  
  // Helper method to update event's average rating
  private async updateEventRatingAverage(eventId: number): Promise<void> {
    const averageRating = await this.getAverageEventRating(eventId);
    const ratingCount = await db
      .select({ count: count() })
      .from(eventRatings)
      .where(eq(eventRatings.eventId, eventId));
      
    await db
      .update(events)
      .set({
        rating: averageRating,
        ratingCount: ratingCount[0].count
      })
      .where(eq(events.id, eventId));
  }
  
  // Attendance methods
  async getEventAttendees(eventId: number): Promise<EventAttendee[]> {
    return db
      .select({
        id: eventAttendees.id,
        userId: eventAttendees.userId,
        eventId: eventAttendees.eventId,
        status: eventAttendees.status,
        createdAt: eventAttendees.createdAt,
        username: users.username,
        displayName: users.displayName,
        avatar: users.avatar
      })
      .from(eventAttendees)
      .innerJoin(users, eq(eventAttendees.userId, users.id))
      .where(eq(eventAttendees.eventId, eventId));
  }
  
  async getUserAttendance(userId: number, eventId: number): Promise<EventAttendee | undefined> {
    const [attendance] = await db
      .select()
      .from(eventAttendees)
      .where(
        and(
          eq(eventAttendees.userId, userId),
          eq(eventAttendees.eventId, eventId)
        )
      );
    
    return attendance;
  }
  
  async createOrUpdateAttendance(attendance: InsertEventAttendee): Promise<EventAttendee> {
    const existingAttendance = await this.getUserAttendance(attendance.userId, attendance.eventId);
    
    if (existingAttendance) {
      // Update existing attendance
      const [updatedAttendance] = await db
        .update(eventAttendees)
        .set({ status: attendance.status })
        .where(eq(eventAttendees.id, existingAttendance.id))
        .returning();
      
      // Update attendee count
      await this.updateEventAttendeeCount(attendance.eventId);
      
      return updatedAttendance;
    } else {
      // Create new attendance
      const [newAttendance] = await db
        .insert(eventAttendees)
        .values(attendance)
        .returning();
      
      // Update attendee count
      await this.updateEventAttendeeCount(attendance.eventId);
      
      return newAttendance;
    }
  }
  
  async getUpcomingUserEvents(userId: number): Promise<Event[]> {
    const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    
    return db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        category: events.category,
        date: events.date,
        time: events.time,
        location: events.location,
        attendees: events.attendees,
        image: events.image,
        images: events.images,
        video: events.video,
        thumbnail: events.thumbnail,
        createdById: events.createdById,
        isFavorite: events.isFavorite,
        schedule: events.schedule,
        createdAt: events.createdAt,
        isFeatured: events.isFeatured,
        views: events.views,
        rating: events.rating,
        ratingCount: events.ratingCount,
        tags: events.tags,
        status: eventAttendees.status
      })
      .from(events)
      .innerJoin(
        eventAttendees,
        and(
          eq(events.id, eventAttendees.eventId),
          eq(eventAttendees.userId, userId)
        )
      )
      .where(
        sql`${events.date} >= ${today}`
      )
      .orderBy(asc(events.date));
  }
  
  // Helper method to update event's attendee count
  private async updateEventAttendeeCount(eventId: number): Promise<void> {
    const attendeeCount = await db
      .select({ count: count() })
      .from(eventAttendees)
      .where(
        and(
          eq(eventAttendees.eventId, eventId),
          eq(eventAttendees.status, 'attending')
        )
      );
      
    await db
      .update(events)
      .set({
        attendees: attendeeCount[0].count
      })
      .where(eq(events.id, eventId));
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
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1591115765373-5207764f72e4?auto=format&fit=crop&w=800&q=80"
        ]),
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
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80"
        ]),
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
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80"
        ]),
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
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1501699169021-3759ee435d66?auto=format&fit=crop&w=800&q=80"
        ]),
      },
      {
        title: "Education Technology Conference",
        description: "Learn about the latest technologies and methodologies in education.",
        category: "Education",
        date: "2023-10-25",
        time: "09:30",
        location: "Chicago Convention Center",
        image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80"
        ]),
      },
      {
        title: "Annual Sports Conference",
        description: "A conference for sports professionals and enthusiasts to discuss the future of sports.",
        category: "Sports",
        date: "2023-11-30",
        time: "10:00",
        location: "Los Angeles Sports Arena",
        image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1580237072617-771c3ecc4a24?auto=format&fit=crop&w=800&q=80"
        ]),
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

// Use MemStorage for now until we resolve the database schema issues
export const storage = new DatabaseStorage();
export const memStorage = new MemStorage();
