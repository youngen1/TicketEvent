import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertUserSchema } from "@shared/schema";
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
      const { amount, eventId } = req.body;
      
      if (!amount || !eventId) {
        return res.status(400).json({ message: "Amount and event ID are required" });
      }
      
      // Get user for email
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user || !user.email) {
        return res.status(400).json({ message: "User email not found" });
      }
      
      // Get event details
      const event = await storage.getEvent(parseInt(eventId));
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Generate a unique reference
      const reference = `${eventId}-${Date.now()}-${req.session.userId}`;
      
      // Create a callback URL (both for real Paystack and our mock)
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers.host;
      // Add amount as query parameter to make it available to the success page
      const callbackUrl = `${protocol}://${host}/payment/success?amount=${encodeURIComponent(amount)}`;
      
      // Initialize transaction with Paystack
      const transaction = await paystackService.initializeTransaction({
        email: user.email,
        amount: parseFloat(amount),
        reference,
        callback_url: callbackUrl,
        metadata: {
          eventId,
          userId: req.session.userId,
          eventTitle: event.title
        }
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
      
      // Verify the transaction
      const verification = await paystackService.verifyPayment({ 
        reference, 
        amount: amount as string | undefined 
      });
      
      if (verification.status === "success") {
        // Payment successful, you could update an order, ticket, or attendance record here
        res.json({
          success: true,
          data: verification
        });
      } else {
        res.json({
          success: false,
          data: verification
        });
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

  const httpServer = createServer(app);

  return httpServer;
}
