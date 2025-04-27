import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage, DatabaseStorage } from "./storage";
import { db } from "./db";
import { registerUploadRoutes } from "./uploads";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Initialize database and seed data
const initDatabase = async () => {
  try {
    // Skip schema push for now due to interaction issues
    log('Skipping database schema push', 'database');
    
    // Seed sample data
    if (storage instanceof DatabaseStorage) {
      await storage.seedEvents();
      log('Sample events seeded', 'database');
    } else {
      // Add mock events directly to memory storage for development
      log('Adding mock events to memory storage', 'database');
      
      // Tech Conference
      await storage.createEvent({
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
        featured: true,
        maxAttendees: 200,
        isFree: false,
        price: "299.99",
        tags: "tech,conference,networking"
      });
      
      // Music Festival
      await storage.createEvent({
        title: "Summer Music Festival",
        description: "A weekend of music and fun under the sun with live performances from top artists",
        date: "2025-06-22",
        time: "12:00",
        location: "Austin, TX",
        category: "Music",
        image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=800&q=80"
        ]),
        userId: 1,
        featured: true,
        maxAttendees: 5000,
        isFree: false,
        price: "149.99",
        tags: "music,festival,summer"
      });
      
      // Art Exhibition
      await storage.createEvent({
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
        featured: false,
        maxAttendees: 100,
        isFree: false,
        price: "25",
        tags: "art,exhibition,culture"
      });
      
      // Free Workshop
      await storage.createEvent({
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
        featured: false,
        maxAttendees: 50,
        isFree: true,
        price: "0",
        tags: "education,workshop,community"
      });
      
      log('Mock events added successfully', 'database');
    }
  } catch (error) {
    log(`Database initialization error: ${error}`, 'database');
  }
};

(async () => {
  // We now have the actual DatabaseStorage class imported

  try {
    // Initialize the database before starting the server
    await initDatabase();
    
    const server = await registerRoutes(app);
    registerUploadRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });
  } catch (error) {
    log(`Server initialization error: ${error}`, 'server');
  }
})();
