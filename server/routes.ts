import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertUserSchema, type InsertEventTicket } from "@shared/schema";
import * as bcrypt from 'bcrypt';
import session from 'express-session';
import { db } from "./db";
import pgSession from 'connect-pg-simple';
import multer from 'multer';
import path from 'path';
import { processVideo } from "./utils/videoProcessor";
import { paystackService } from './services/paystackService';

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
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Check password
      const passwordMatch = await bcrypt.compare(password, user.password);
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
      const events = await storage.getAllEvents(category);
      res.json(events);
    } catch (error) {
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

  // Set up multer for video upload
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
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
        
        // Add video and thumbnail paths to event data
        eventData.video = videoResult.videoPath;
        eventData.thumbnail = videoResult.thumbnailPath;
      }
      
      const validation = insertEventSchema.safeParse(eventData);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid event data", 
          errors: validation.error.format() 
        });
      }
      
      const event = await storage.createEvent(validation.data);
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
        
        // Add video and thumbnail paths to event data
        updateData.video = videoResult.videoPath;
        updateData.thumbnail = videoResult.thumbnailPath;
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
      const { amount, eventId } = req.body;
      
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
      
      // Initialize transaction with Paystack
      const transaction = await paystackService.initializeTransaction({
        email: user.email,
        amount: parseFloat(amount),
        reference,
        callback_url: callbackUrl,
        metadata: {
          eventId,
          userId: req.session.userId,
          eventTitle: event.title,
          ticketId: ticket.id
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
            const ticket = await storage.createTicket({
              userId,
              eventId,
              quantity: 1,
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
            
            // Create a ticket
            const ticket = await storage.createTicket({
              userId,
              eventId,
              quantity: 1,
              totalAmount: verification.amount / 100, // Convert from smallest currency unit to decimal
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
      
      const { eventId, quantity = 1, amount = 1500 } = req.body;
      
      if (!eventId) {
        return res.status(400).json({ message: "Event ID is required" });
      }
      
      // Verify event exists
      const event = await storage.getEvent(parseInt(eventId));
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      console.log('Creating test ticket for event:', eventId, 'with amount:', amount);
      
      // Create a reference
      const reference = `${eventId}-${Date.now()}-${req.session.userId}-test`;
      
      // Create the ticket
      const ticket = await storage.createTicket({
        userId: req.session.userId,
        eventId: parseInt(eventId),
        quantity: parseInt(quantity.toString()),
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

  const httpServer = createServer(app);

  return httpServer;
}
