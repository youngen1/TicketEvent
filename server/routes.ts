import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertUserSchema, insertTicketTypeSchema, type InsertEventTicket, type InsertUser } from "@shared/schema";
import * as bcrypt from 'bcrypt';
import session from 'express-session';
import { db } from "./db";
import pgSession from 'connect-pg-simple';
import multer from 'multer';
import path from 'path';
import { processVideo } from "./utils/videoProcessor";
import { paystackService } from './services/paystackService';
import { createNotifications } from './create-notifications';
import { registerTestRoutes } from './test-routes';

// Add userId to session
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

// Auth middleware
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
};

// Middleware to check if user is admin
const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  try {
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    next();
  } catch (error) {
    console.error('Error in admin middleware:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware with PostgreSQL store
  const PostgresStore = pgSession(session);
  
  app.use(session({
    store: new PostgresStore({
      pool: db.$client, 
      tableName: 'session'
    }),
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
  }));

  // Auth routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const validation = insertUserSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid user data", 
          errors: validation.error.format() 
        });
      }

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...validation.data,
        password: hashedPassword
      });

      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: "Error creating user" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        console.log(`Login failed: User ${username} not found`);
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      console.log(`Login attempt for user: ${username}, ID: ${user.id}`);
      
      // Special case for admin during development
      if (username === 'admin' && password === 'password') {
        console.log('Admin login bypass activated');
        req.session.userId = user.id;
        const { password: _, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      }

      // Check password
      console.log(`Comparing password with hash: ${user.password}`);
      const passwordMatch = await bcrypt.compare(password, user.password);
      console.log(`Password match result: ${passwordMatch}`);
      
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Set user id in session
      req.session.userId = user.id;

      // Don't return the password
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Error during login" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/me', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: "Error fetching user" });
    }
  });
  // Events routes
  app.get("/api/events", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const tags = req.query.tags as string | undefined;
      const featured = req.query.featured === 'true' ? true : undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 7; // Default 7 events per page
      const offset = (page - 1) * limit;
      
      // Get total count for pagination
      const allEvents = await storage.getAllEvents(category, tags, featured);
      const totalCount = allEvents.length;
      const totalPages = Math.ceil(totalCount / limit);
      
      // Get paginated events
      const events = allEvents.slice(offset, offset + limit);
      
      res.json({
        events,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasMore: page < totalPages
        }
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ message: "Error fetching events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Error fetching event" });
    }
  });
  
  // Get ticket types for an event
  app.get("/api/events/:id/ticket-types", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const ticketTypes = await storage.getEventTicketTypes(eventId);
      
      // Filter ticket types based on permissions:
      // - Event creator and admins can see all ticket types (active and inactive)
      // - Regular users can only see active ticket types
      let filteredTicketTypes = ticketTypes;
      if (req.session.userId !== event.userId) {
        // If not the event creator, filter to only active types
        const currentUser = req.session.userId ? await storage.getUser(req.session.userId) : null;
        if (!currentUser?.isAdmin) {
          filteredTicketTypes = ticketTypes.filter(type => type.isActive);
        }
      }
      
      res.json(filteredTicketTypes);
    } catch (error) {
      console.error('Error getting ticket types:', error);
      res.status(500).json({ message: "Error getting ticket types" });
    }
  });
  
  // Create a ticket type for an event
  app.post("/api/events/:id/ticket-types", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if user has permission (created the event or is admin)
      const userId = req.session.userId || 0;
      const currentUser = await storage.getUser(userId);
      if (event.userId !== userId && !currentUser?.isAdmin) {
        return res.status(403).json({ message: "You do not have permission to add ticket types to this event" });
      }
      
      const ticketTypeData = {
        ...req.body,
        eventId,
        quantity: parseInt(req.body.quantity),
        price: parseFloat(req.body.price),
        soldCount: 0,
        isActive: req.body.isActive === 'false' ? false : true
      };
      
      const validation = insertTicketTypeSchema.safeParse(ticketTypeData);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid ticket type data", 
          errors: validation.error.format() 
        });
      }
      
      const ticketType = await storage.createTicketType(validation.data);
      res.status(201).json(ticketType);
    } catch (error: any) {
      console.error('Error creating ticket type:', error);
      res.status(500).json({ message: error.message || "Error creating ticket type" });
    }
  });

  // Set up multer for video upload
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 80 * 1024 * 1024 }, // 80MB max file size
    fileFilter: (_req, file, cb) => {
      // Accept only video files
      const filetypes = /mp4|mov|avi|webm|mkv/;
      const mimetype = filetypes.test(file.mimetype);
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      
      if (mimetype && extname) {
        return cb(null, true);
      }
      
      cb(new Error('Only video files are allowed'));
    }
  });

  // Event creation with video upload
  app.post("/api/events", isAuthenticated, upload.single('video'), async (req, res) => {
    try {
      // Add user ID from session to the event
      const eventData = { ...req.body, createdById: req.session.userId };
      
      // Process video if uploaded
      if (req.file) {
        console.log('Video upload received with event:', req.file.originalname);
        const videoResult = await processVideo(req.file);
        
        // Add video path to event data
        eventData.video = videoResult.videoPath;
      }
      
      // Handle ticket types if provided
      let ticketTypes = [];
      if (eventData.hasMultipleTicketTypes === 'true' && eventData.ticketTypes) {
        try {
          ticketTypes = JSON.parse(eventData.ticketTypes);
          // Remove from eventData as it will be processed separately
          delete eventData.ticketTypes;
        } catch (error) {
          console.error('Error parsing ticket types:', error);
        }
      }
      
      const validation = insertEventSchema.safeParse(eventData);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid event data", 
          errors: validation.error.format() 
        });
      }
      
      // Create the event
      const event = await storage.createEvent(validation.data);
      
      // Create ticket types if multiple ticket types are enabled
      if (eventData.hasMultipleTicketTypes === 'true' && ticketTypes.length > 0) {
        for (const ticketType of ticketTypes) {
          await storage.createTicketType({
            eventId: event.id,
            name: ticketType.name,
            description: ticketType.description || '',
            price: ticketType.price,
            quantity: parseInt(ticketType.quantity),
            isActive: ticketType.isActive || true
          });
        }
      }
      
      res.status(201).json(event);
    } catch (error: any) {
      console.error('Error creating event:', error);
      res.status(500).json({ message: error.message || "Error creating event" });
    }
  });

  // Update event with video upload support
  app.put("/api/events/:id", isAuthenticated, upload.single('video'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if user has permission (created the event)
      if (event.userId !== req.session.userId) {
        return res.status(403).json({ message: "You do not have permission to update this event" });
      }
      
      // Prepare update data
      const updateData = { ...req.body };
      
      // Process video if uploaded
      if (req.file) {
        console.log('Video upload received for update:', req.file.originalname);
        const videoResult = await processVideo(req.file);
        
        // Add video path to event data
        updateData.video = videoResult.videoPath;
      }
      
      // Update event
      const updatedEvent = await storage.updateEvent(id, updateData);
      res.json(updatedEvent);
    } catch (error: any) {
      console.error('Error updating event:', error);
      res.status(500).json({ message: error.message || "Error updating event" });
    }
  });

  app.put("/api/events/:id/favorite", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const updatedEvent = await storage.toggleFavorite(id);
      res.json(updatedEvent);
    } catch (error) {
      res.status(500).json({ message: "Error updating favorite status" });
    }
  });
  
  // Payment routes
  app.post("/api/payments/initialize", isAuthenticated, async (req, res) => {
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
      const ticket = await storage.createTicket({
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
  });
  
  app.get("/api/payments/verify/:reference", isAuthenticated, async (req, res) => {
    try {
      const { reference } = req.params;
      const { amount } = req.query; // Get amount from query parameters if available
      
      if (!reference) {
        return res.status(400).json({ message: "Payment reference is required" });
      }
      
      console.log('Payment verification request for reference:', reference);
      
      // First check if we have a pending ticket for this reference
      const existingTicket = await storage.getTicketByReference(reference);
      
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
            await storage.updateTicket(existingTicket.id, {
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
            await storage.updateTicket(existingTicket.id, {
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
            await storage.updateTicket(existingTicket.id, {
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
            
            const ticket = await storage.createTicket({
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
            
            const ticket = await storage.createTicket({
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
  });
  
  // Free ticket registration endpoint
  app.post('/api/tickets/free', isAuthenticated, async (req, res) => {
    try {
      const { eventId, ticketTypeId } = req.body;
      
      if (!eventId) {
        return res.status(400).json({ message: "Missing eventId" });
      }
      
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Verify the event exists and is free
      const event = await storage.getEvent(parseInt(eventId));
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      if (!event.isFree && parseFloat(event.price || '0') > 0) {
        return res.status(400).json({ message: "This is not a free event" });
      }
      
      // Check if the user already has a ticket for this event
      const hasTicket = await storage.hasUserPurchasedEventTicket(req.session.userId, parseInt(eventId));
      if (hasTicket) {
        return res.status(400).json({ message: "You cannot buy two tickets for yourself. You already have a ticket for this event." });
      }
      
      // If ticket type ID is provided, fetch ticket type details
      if (ticketTypeId) {
        const ticketType = await storage.getTicketType(parseInt(ticketTypeId));
        if (!ticketType) {
          return res.status(404).json({ message: "Ticket type not found" });
        }
        
        // Check if tickets are available
        if (ticketType.quantity <= (ticketType.soldCount || 0)) {
          return res.status(400).json({ message: "This ticket type is sold out" });
        }
      }
      
      // Generate a unique reference for the free ticket
      const reference = `free-${eventId}-${Date.now()}-${req.session.userId}`;
      
      // Create a completed ticket for the free event
      const ticket = await storage.createTicket({
        userId: req.session.userId,
        eventId: parseInt(eventId),
        quantity: 1,
        ticketTypeId: ticketTypeId ? parseInt(ticketTypeId) : null,
        totalAmount: 0, // Free ticket
        paymentReference: reference,
        paymentStatus: "completed" // Mark as completed since it's free
      } as InsertEventTicket);
      
      // Return success response
      res.status(201).json({
        success: true,
        message: "Free ticket registered successfully",
        data: { ticket }
      });
      
    } catch (error: any) {
      console.error('Error registering free ticket:', error);
      res.status(500).json({ 
        message: error.message || "Error registering free ticket" 
      });
    }
  });

  // Get payment channels
  app.get("/api/payments/channels", async (req, res) => {
    try {
      const channels = await paystackService.getPaymentChannels();
      res.json(channels);
    } catch (error: any) {
      console.error('Error fetching payment channels:', error);
      res.status(500).json({ message: error.message || "Error fetching payment channels" });
    }
  });
  
  // Temporary test endpoint for payments while fixing Paystack live integration
  app.post("/api/test/create-ticket", isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { eventId, quantity = 1, amount = 1500, ticketTypeId } = req.body;
      
      if (!eventId) {
        return res.status(400).json({ message: "Event ID is required" });
      }
      
      // Verify event exists
      const event = await storage.getEvent(parseInt(eventId));
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if the user already has a ticket for this event
      const hasTicket = await storage.hasUserPurchasedEventTicket(req.session.userId, parseInt(eventId));
      if (hasTicket) {
        return res.status(400).json({ 
          message: "You cannot buy two tickets for yourself. You already have a ticket for this event."
        });
      }

      // If ticket type ID is provided, fetch ticket type details and validate
      if (ticketTypeId) {
        const ticketType = await storage.getTicketType(parseInt(ticketTypeId));
        if (!ticketType) {
          return res.status(404).json({ message: "Ticket type not found" });
        }
        
        // Check if tickets are available
        if (ticketType.quantity <= (ticketType.soldCount || 0)) {
          return res.status(400).json({ message: "This ticket type is sold out" });
        }
      }
      
      console.log('Creating test ticket for event:', eventId, 'with amount:', amount);
      
      // Create a reference
      const reference = `${eventId}-${Date.now()}-${req.session.userId}-test`;
      
      // Create the ticket
      const ticket = await storage.createTicket({
        userId: req.session.userId,
        eventId: parseInt(eventId),
        quantity: parseInt(quantity.toString()),
        ticketTypeId: ticketTypeId ? parseInt(ticketTypeId) : null,
        totalAmount: parseFloat(amount.toString()),
        paymentReference: reference,
        paymentStatus: "completed"
      } as InsertEventTicket);
      
      res.json({
        success: true,
        message: "Temporary test ticket created while fixing Paystack integration",
        ticket
      });
    } catch (error: any) {
      console.error('Error creating test ticket:', error);
      res.status(500).json({ message: error.message || "Error creating test ticket" });
    }
  });
  
  // Payment settings admin routes
  app.get("/api/admin/payment-settings", isAuthenticated, async (req, res) => {
    try {
      // In a real app, you'd check if the user is an admin
      // For now, we'll return the masked settings
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
      res.status(500).json({ message: error.message || "Error fetching payment settings" });
    }
  });
  
  app.post("/api/admin/payment-settings", isAuthenticated, async (req, res) => {
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
        if (testSecretKey) process.env.PAYSTACK_SECRET_KEY = testSecretKey;
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
      res.status(500).json({ message: error.message || "Error updating payment settings" });
    }
  });
  
  // Get user tickets
  app.get("/api/users/tickets", isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const tickets = await storage.getUserTickets(req.session.userId);
      
      // Fetch event details for each ticket
      const ticketsWithEventDetails = await Promise.all(
        tickets.map(async (ticket) => {
          const event = await storage.getEvent(ticket.eventId);
          return {
            ...ticket,
            event: event || null
          };
        })
      );
      
      res.json(ticketsWithEventDetails);
    } catch (error: any) {
      console.error('Error fetching user tickets:', error);
      res.status(500).json({ message: error.message || "Error fetching user tickets" });
    }
  });
  
  // Get all ticket purchasers for an event
  app.get("/api/events/:id/tickets/attendees", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const tickets = await storage.getEventTickets(eventId);
      
      // Filter tickets to completed only
      const completedTickets = tickets.filter(ticket => 
        ticket.paymentStatus === 'completed'
      );
      
      // Create a map to deduplicate users and sum up their tickets
      const attendeeMap = new Map();
      
      for (const ticket of completedTickets) {
        const user = await storage.getUser(ticket.userId);
        if (!user) continue;
        
        if (!attendeeMap.has(user.id)) {
          attendeeMap.set(user.id, {
            id: ticket.id,
            userId: user.id,
            username: user.username,
            displayName: user.displayName || user.username,
            avatar: user.avatar,
            quantity: ticket.quantity,
            purchaseDate: ticket.purchaseDate
          });
        } else {
          // Update existing attendee's ticket count
          const attendee = attendeeMap.get(user.id);
          attendee.quantity += ticket.quantity;
        }
      }
      
      res.json(Array.from(attendeeMap.values()));
    } catch (error: any) {
      console.error('Error fetching ticket attendees:', error);
      res.status(500).json({ message: error.message || "Error fetching ticket attendees" });
    }
  });
  
  // Get a user's ticket for a specific event
  app.get("/api/events/:id/ticket/:userId", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);
      
      // Verify the requesting user is the same as the userId parameter
      if (req.session.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to view this ticket" });
      }
      
      // Find tickets for this user and event
      const tickets = await storage.getUserTickets(userId);
      const eventTicket = tickets.find(ticket => 
        ticket.eventId === eventId && ticket.paymentStatus === 'completed'
      );
      
      res.json(eventTicket || null);
    } catch (error: any) {
      console.error('Error fetching user event ticket:', error);
      res.status(500).json({ message: error.message || "Error fetching user event ticket" });
    }
  });
  
  // Update user profile
  app.put("/api/users/profile", isAuthenticated, async (req, res) => {
    try {
      const userData = req.body;
      
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const updatedUser = await storage.updateUser(req.session.userId, userData);
      
      // Return the updated user without the password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ message: error.message || "Error updating user profile" });
    }
  });

  // Get all users with basic info - public endpoint, no authentication required
  app.get("/api/users/all", async (req, res) => {
    try {
      console.log("Fetching all users");
      // Get all users
      const allUsers = await storage.getAllUsers();
      
      // Process users to add additional info and remove sensitive data
      const processedUsers = await Promise.all(allUsers.map(async (user) => {
        // Don't return passwords
        const { password, ...userWithoutPassword } = user;
        
        // Add isFollowing property if a user is logged in
        let isFollowing = false;
        if (req.session.userId) {
          isFollowing = await storage.isFollowing(req.session.userId, user.id);
        }
        
        // Get event count
        const userEvents = await storage.getUserEvents(user.id);
        const eventsCount = userEvents.length;
        
        return {
          ...userWithoutPassword,
          isFollowing,
          eventsCount
        };
      }));
      
      console.log(`Returning ${processedUsers.length} users from /api/users/all`);
      res.json(processedUsers);
    } catch (error: any) {
      console.error('Error fetching all users:', error);
      res.status(500).json({ message: error.message || "Error fetching all users" });
    }
  });

  // Search users by username, displayName, bio, email, and location
  app.get("/api/users/search", async (req, res) => {
    try {
      // Trim whitespace from queries to handle spaces properly
      const query = (req.query.query as string || '').trim();
      const locationQuery = (req.query.location as string || '').trim();
      const maxDistance = req.query.maxDistance ? parseFloat(req.query.maxDistance as string) : undefined;
      
      console.log(`Searching users with query: "${query}", location: "${locationQuery}", maxDistance: ${maxDistance || 'none'}`);
      
      // Check if we have at least a text query or a location query
      if (!query && !locationQuery) {
        console.log('No search parameters provided');
        return res.json([]);
      }
      
      // Search users with location filter and distance parameters
      const users = await storage.searchUsers(query, locationQuery, maxDistance);
      console.log(`Found ${users.length} users matching search criteria`);
      
      // Add isFollowing property if a user is logged in
      const processedUsers = await Promise.all(users.map(async (user) => {
        // Don't return passwords
        const { password, ...userWithoutPassword } = user;
        
        // Add isFollowing property if a user is logged in
        let isFollowing = false;
        if (req.session.userId) {
          isFollowing = await storage.isFollowing(req.session.userId, user.id);
        }
        
        // Get event count
        const userEvents = await storage.getUserEvents(user.id);
        const eventsCount = userEvents.length;
        
        return {
          ...userWithoutPassword,
          isFollowing,
          eventsCount
        };
      }));
      
      res.json(processedUsers);
    } catch (error: any) {
      console.error('Error searching users:', error);
      res.status(500).json({ message: error.message || "Error searching users" });
    }
  });
  
  // Get a specific user profile by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get followers and following counts
      const followers = await storage.getUserFollowers(userId);
      const following = await storage.getUserFollowing(userId);
      
      // Check if current user is following this user (if authenticated)
      let isFollowing = false;
      if (req.session.userId) {
        isFollowing = await storage.isFollowing(req.session.userId, userId);
      }
      
      // Remove sensitive information
      const { password, ...userWithoutPassword } = user;
      
      // Return user with additional info
      res.json({
        ...userWithoutPassword,
        followersCount: followers.length,
        followingCount: following.length,
        isFollowing
      });
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: error.message || "Error fetching user profile" });
    }
  });

  // User follow routes
  // Get users to follow (all users except the current user) - requires authentication
  app.get("/api/users", isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Get all users
      const allUsers = await Promise.all((await storage.getUsersToFollow()).map(async (user) => {
        // Don't return passwords
        const { password, ...userWithoutPassword } = user;
        
        // Check if current user is following this user
        const isFollowing = req.session.userId ? await storage.isFollowing(req.session.userId, user.id) : false;
        
        return {
          ...userWithoutPassword,
          isFollowing
        };
      }));
      
      // Filter out the current user
      const users = allUsers.filter(user => req.session.userId ? user.id !== req.session.userId : true);
      
      res.json(users);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: error.message || "Error fetching users" });
    }
  });
  

  

  
  // Get user followers
  app.get("/api/users/:id/followers", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const followers = await storage.getUserFollowers(userId);
      const currentUserId = req.session.userId;
      
      // Don't return passwords and add youFollow and followsYou properties
      const sanitizedFollowers = await Promise.all(followers.map(async follower => {
        const { password, ...followerWithoutPassword } = follower;
        
        // Check if the current user follows this follower
        const youFollow = currentUserId ? await storage.isFollowing(currentUserId, follower.id) : false;
        
        // Check if this follower follows the current user (for mutual follows)
        const followsYou = currentUserId ? await storage.isFollowing(follower.id, currentUserId) : false;
        
        return {
          ...followerWithoutPassword,
          youFollow,
          followsYou
        };
      }));
      
      res.json(sanitizedFollowers);
    } catch (error: any) {
      console.error('Error fetching followers:', error);
      res.status(500).json({ message: error.message || "Error fetching followers" });
    }
  });
  
  // Get user following
  app.get("/api/users/:id/following", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const following = await storage.getUserFollowing(userId);
      const currentUserId = req.session.userId;
      
      // Don't return passwords and add youFollow and followsYou properties
      const sanitizedFollowing = await Promise.all(following.map(async user => {
        const { password, ...userWithoutPassword } = user;
        
        // Check if the current user follows this user (should always be true for following)
        const youFollow = currentUserId ? await storage.isFollowing(currentUserId, user.id) : false;
        
        // Check if this user follows the current user (for mutual follows)
        const followsYou = currentUserId ? await storage.isFollowing(user.id, currentUserId) : false;
        
        return {
          ...userWithoutPassword,
          youFollow,
          followsYou
        };
      }));
      
      res.json(sanitizedFollowing);
    } catch (error: any) {
      console.error('Error fetching following:', error);
      res.status(500).json({ message: error.message || "Error fetching following" });
    }
  });
  
  // Get user events (events created by a specific user)
  app.get("/api/users/:id/events", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Verify user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get events created by the user
      const events = await storage.getUserEvents(userId);
      
      res.json(events);
    } catch (error: any) {
      console.error('Error fetching user events:', error);
      res.status(500).json({ message: error.message || "Error fetching user events" });
    }
  });
  
  // Get upcoming events for a user (events they're attending)
  app.get("/api/users/:id/upcoming-events", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Verify user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get upcoming events the user is attending
      const upcomingEvents = await storage.getUpcomingUserEvents(userId);
      
      res.json(upcomingEvents);
    } catch (error: any) {
      console.error('Error fetching upcoming events:', error);
      res.status(500).json({ message: error.message || "Error fetching upcoming events" });
    }
  });
  
  // Check if current user is following a specific user
  app.get("/api/users/:id/is-following", async (req, res) => {
    try {
      const userToCheckId = parseInt(req.params.id);
      const currentUserId = req.session.userId;
      
      if (!currentUserId) {
        return res.json(false);
      }
      
      if (currentUserId === userToCheckId) {
        return res.json(false); // Cannot follow yourself
      }
      
      const isFollowing = await storage.isFollowing(currentUserId, userToCheckId);
      res.json(isFollowing);
    } catch (error: any) {
      console.error('Error checking follow status:', error);
      res.status(500).json({ message: error.message || "Error checking follow status" });
    }
  });
  
  // Follow a user
  app.post("/api/users/:id/follow", isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const followingId = parseInt(req.params.id);
      
      // Check if user is trying to follow themselves
      if (req.session.userId === followingId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }
      
      // Check if user to follow exists
      const userToFollow = await storage.getUser(followingId);
      if (!userToFollow) {
        return res.status(404).json({ message: "User to follow not found" });
      }
      
      // Follow the user
      await storage.followUser(req.session.userId, followingId);
      
      res.json({ success: true, message: "User followed successfully" });
    } catch (error: any) {
      console.error('Error following user:', error);
      res.status(500).json({ message: error.message || "Error following user" });
    }
  });
  
  // Unfollow a user
  app.delete("/api/users/:id/follow", isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const followingId = parseInt(req.params.id);
      
      // Check if user to unfollow exists
      const userToUnfollow = await storage.getUser(followingId);
      if (!userToUnfollow) {
        return res.status(404).json({ message: "User to unfollow not found" });
      }
      
      // Unfollow the user
      await storage.unfollowUser(req.session.userId, followingId);
      
      res.json({ success: true, message: "User unfollowed successfully" });
    } catch (error: any) {
      console.error('Error unfollowing user:', error);
      res.status(500).json({ message: error.message || "Error unfollowing user" });
    }
  });

  // Finance and withdrawal routes
  app.get("/api/finance/banks", async (req, res) => {
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
  });
  
  app.post("/api/finance/withdraw", isAuthenticated, async (req, res) => {
    try {
      const { amount, accountName, accountNumber, bankName } = req.body;
      
      if (!amount || !accountName || !accountNumber || !bankName) {
        return res.status(400).json({ 
          message: "All fields are required: amount, accountName, accountNumber, bankName" 
        });
      }

      const withdrawalAmount = parseFloat(amount);
      if (isNaN(withdrawalAmount) || withdrawalAmount < 50) {
        return res.status(400).json({ message: "Minimum withdrawal amount is R50" });
      }

      // Get the user's completed tickets to calculate available balance
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const user = await storage.getUser(userId);
      const userTickets = await storage.getUserTickets(userId);
      const completedTickets = userTickets.filter(ticket => ticket.paymentStatus === 'completed');
      
      const totalRevenue = completedTickets.reduce(
        (sum, ticket) => sum + parseFloat(ticket.totalAmount.toString() || '0'), 
        0
      );
      
      // Check if user is admin - admin doesn't pay platform fees
      const isAdmin = user?.isAdmin === true;
      const availableBalance = isAdmin ? totalRevenue : totalRevenue * 0.85; // Only apply 15% fee for non-admin users
      
      if (withdrawalAmount > availableBalance) {
        return res.status(400).json({ 
          message: `Insufficient funds. Available balance: ${availableBalance.toFixed(2)}` 
        });
      }
      
      // In a real app, this would integrate with Paystack's transfer API
      // For now, we'll just simulate a successful withdrawal request
      const withdrawalRequest = {
        id: Date.now(),
        userId,
        amount: withdrawalAmount,
        accountName,
        accountNumber,
        bankName,
        status: 'pending',
        createdAt: new Date()
      };
      
      // TODO: In a production app, store this in a withdrawals table

      res.status(201).json({
        success: true,
        message: "Withdrawal request submitted successfully",
        data: withdrawalRequest
      });
    } catch (error: any) {
      console.error('Error processing withdrawal request:', error);
      res.status(500).json({ message: error.message || "Error processing withdrawal request" });
    }
  });
  
  // Admin routes - require admin authentication
  
  // Create new sample events (admin only)
  app.post('/api/admin/events/sample', isAdmin, async (req, res) => {
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
  });
  
  // Delete all events (admin only)
  app.delete('/api/admin/events/all', isAdmin, async (req, res) => {
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
  });
  
  app.get('/api/admin/stats', isAdmin, async (req, res) => {
    try {
      // Get total users count
      const allUsers = await storage.getAllUsers();
      const totalUsers = allUsers.length;
      
      // Get total events count
      const allEvents = await storage.getAllEvents();
      const totalEvents = allEvents.length;
      
      // Get all tickets
      const allTickets = await storage.getAllTickets();
      const completedTickets = allTickets.filter(ticket => ticket.paymentStatus === 'completed');
      
      // Calculate total revenue and tickets sold
      const totalTicketsSold = completedTickets.length;
      const totalRevenue = completedTickets.reduce(
        (sum, ticket) => sum + parseFloat(ticket.totalAmount?.toString() || '0'), 
        0
      );
      
      // Get admin user
      const adminUser = allUsers.find(user => user.isAdmin);
      const platformBalance = adminUser ? parseFloat(adminUser.platformBalance || '0') : 0;
      
      res.json({
        totalUsers,
        totalEvents,
        totalTicketsSold,
        totalRevenue,
        platformBalance
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ message: 'Error fetching admin stats' });
    }
  });
  
  app.get('/api/admin/transactions', isAdmin, async (req, res) => {
    try {
      // Get all completed tickets for admin view
      const allTickets = await storage.getAllTickets();
      const completedTickets = allTickets.filter(ticket => 
        ticket.paymentStatus === 'completed' || ticket.paymentStatus === 'pending'
      );
      
      // Sort by date (newest first)
      const sortedTickets = completedTickets.sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      
      // Limit to most recent 20
      const recentTickets = sortedTickets.slice(0, 20);
      
      res.json(recentTickets);
    } catch (error) {
      console.error('Error fetching admin transactions:', error);
      res.status(500).json({ message: 'Error fetching admin transactions' });
    }
  });
  
  // User management endpoints
  app.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
      // Get query parameters
      const searchQuery = req.query.search as string || '';
      
      // Get all users
      const allUsers = await storage.getAllUsers();
      
      // Filter users based on search query if provided
      let filteredUsers = allUsers;
      if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        filteredUsers = allUsers.filter(user => 
          user.username.toLowerCase().includes(lowerCaseQuery) || 
          (user.displayName && user.displayName.toLowerCase().includes(lowerCaseQuery))
        );
      }
      
      // Map users to include only necessary info and exclude sensitive data like passwords
      const safeUsers = filteredUsers.map(user => ({
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        avatar: user.avatar,
        isBanned: user.isBanned || false
      }));
      
      res.json(safeUsers);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      res.status(500).json({ message: 'Error fetching users' });
    }
  });
  
  // Ban/unban a user
  app.post('/api/admin/users/:userId/toggle-ban', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Ensure user isn't trying to ban themselves
      if (userId === req.session.userId) {
        return res.status(400).json({ message: 'You cannot ban your own account' });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Toggle ban status
      const isBanned = user.isBanned || false;
      const updatedUser = await storage.updateUser(userId, { 
        isBanned: !isBanned
      });
      
      res.json({ 
        id: updatedUser.id,
        username: updatedUser.username,
        isBanned: updatedUser.isBanned || false
      });
    } catch (error) {
      console.error('Error toggling user ban status:', error);
      res.status(500).json({ message: 'Error updating user ban status' });
    }
  });
  
  // Admin endpoint to update a user's profile
  app.patch('/api/admin/users/:userId', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { username, displayName } = req.body;
      
      if (!username && !displayName) {
        return res.status(400).json({ message: 'No update data provided' });
      }
      
      // Validate the username if provided
      if (username) {
        // Check if username is already taken by another user
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: 'Username is already taken' });
        }
      }
      
      // Update the user
      const updateData: Partial<InsertUser> = {};
      if (username) updateData.username = username;
      if (displayName) updateData.displayName = displayName;
      
      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        displayName: updatedUser.displayName
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ message: 'Error updating user profile' });
    }
  });
  
  // User endpoint to update their own profile
  app.patch('/api/users/profile', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const { username, displayName } = req.body;
      
      if (!username && !displayName) {
        return res.status(400).json({ message: 'No update data provided' });
      }
      
      // Validate the username if provided
      if (username) {
        // Check if username is already taken by another user
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: 'Username is already taken' });
        }
      }
      
      // Update the user
      const updateData: Partial<InsertUser> = {};
      if (username) updateData.username = username;
      if (displayName) updateData.displayName = displayName;
      
      const updatedUser = await storage.updateUser(userId, updateData);
      
      // Update the session data if needed
      if (username) {
        // The session only stores userId, not the whole user object
        // We'll just rely on the user fetching their updated profile on next request
      }
      
      res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        displayName: updatedUser.displayName
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ message: 'Error updating user profile' });
    }
  });

  // Notification routes
  // Get notifications for authenticated user
  app.get('/api/notifications', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: error.message || 'Error fetching notifications' });
    }
  });

  // Mark a notification as read
  app.patch('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      res.json(updatedNotification);
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: error.message || 'Error marking notification as read' });
    }
  });

  // Mark all notifications as read
  app.post('/api/notifications/read-all', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ message: error.message || 'Error marking all notifications as read' });
    }
  });

  // Delete a notification
  app.delete('/api/notifications/:id', isAuthenticated, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.deleteNotification(notificationId);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ message: error.message || 'Error deleting notification' });
    }
  });
  
  // Generate dummy notifications for testing
  app.post('/api/notifications/generate', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = await storage.getUser(userId);
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }
      
      await createNotifications();
      
      res.json({ 
        success: true, 
        message: 'Dummy notifications created successfully' 
      });
    } catch (error: any) {
      console.error('Error creating dummy notifications:', error);
      res.status(500).json({ message: error.message || 'Error creating dummy notifications' });
    }
  });

  // Get user friends (mutual follows)
  app.get('/api/friends', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const friends = await storage.getFriends(userId);
      
      // Don't return passwords
      const sanitizedFriends = friends.map(friend => {
        const { password, ...userWithoutPassword } = friend;
        return userWithoutPassword;
      });
      
      res.json(sanitizedFriends);
    } catch (error: any) {
      console.error('Error fetching friends:', error);
      res.status(500).json({ message: error.message || 'Error fetching friends' });
    }
  });

  // Check friendship status
  app.get('/api/users/:id/friendship', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const otherUserId = parseInt(req.params.id);
      const isFriend = await storage.checkFriendship(userId, otherUserId);
      
      res.json({ isFriend });
    } catch (error: any) {
      console.error('Error checking friendship status:', error);
      res.status(500).json({ message: error.message || 'Error checking friendship status' });
    }
  });
  
  // Debug endpoint to add coordinates to mock events (accessible without authentication)
  app.get('/api/debug/add-coordinates', async (req, res) => {
    try {
      const coordinates = [
        // San Francisco, CA for Tech Innovation Summit
        { id: 1, latitude: '37.7749', longitude: '-122.4194' },
        
        // Austin, TX for Global Music Festival
        { id: 2, latitude: '30.2672', longitude: '-97.7431' },
        
        // New York, NY for Art Exhibition
        { id: 3, latitude: '40.7128', longitude: '-74.0060' },
        
        // London, UK for Digital Skills Workshop
        { id: 4, latitude: '51.5074', longitude: '-0.1278' },
        
        // Chicago, IL for Startup Competition
        { id: 5, latitude: '41.8781', longitude: '-87.6298' },
        
        // Paris, France for Culinary Masterclass
        { id: 6, latitude: '48.8566', longitude: '2.3522' },
        
        // Bali, Indonesia for Wellness Retreat
        { id: 7, latitude: '-8.3405', longitude: '115.0920' }
      ];
      
      // Update the events with coordinates
      for (const coord of coordinates) {
        try {
          await storage.updateEvent(coord.id, {
            latitude: coord.latitude,
            longitude: coord.longitude
          });
          console.log(`Updated event ${coord.id} with coordinates: ${coord.latitude}, ${coord.longitude}`);
        } catch (error) {
          console.error(`Error updating event ${coord.id}:`, error);
        }
      }
      
      res.json({ 
        status: 'ok', 
        message: 'Coordinates added to mock events',
        coordinates
      });
    } catch (error) {
      console.error('Error updating coordinates:', error);
      res.status(500).json({ 
        message: 'Error updating coordinates', 
        error: String(error)
      });
    }
  });

  // Register test routes for development
  registerTestRoutes(app);

  const httpServer = createServer(app);
  
  return httpServer;
}
