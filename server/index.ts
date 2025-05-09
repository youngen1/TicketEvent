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
    // Schema was pushed using our custom script
    log('Using pre-pushed database schema', 'database');
    
    // Seed sample data
    if (storage instanceof DatabaseStorage) {
      await storage.seedEvents();
      log('Sample events seeded', 'database');
    } else {
      // Add mock events directly to memory storage for development
      log('Adding mock events to memory storage', 'database');
      
      // Tech Conference with video
      await storage.createEvent({
        title: "Tech Innovation Summit 2025",
        description: "Explore the latest in AI, blockchain, and emerging technologies at this premier tech event",
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
        tags: "tech,innovation,ai,blockchain",
        video: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      });
      
      // Music Festival with video
      await storage.createEvent({
        title: "Global Music Festival 2025",
        description: "A three-day celebration of music featuring top artists from around the world performing live",
        date: "2025-07-18",
        time: "16:00",
        location: "Austin, TX",
        category: "Music",
        image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=800&q=80"
        ]),
        userId: 1,
        featured: true,
        maxAttendees: 5000,
        isFree: false,
        price: "149.99",
        tags: "music,festival,concert,live",
        video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
      });
      
      // Art Exhibition with video
      await storage.createEvent({
        title: "Contemporary Art Exhibition",
        description: "Experience thought-provoking works from emerging and established artists exploring modern themes",
        date: "2025-05-22",
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
        tags: "art,exhibition,contemporary,culture",
        video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
      });
      
      // Digital Skills Workshop with video
      await storage.createEvent({
        title: "Digital Skills Workshop",
        description: "Learn essential digital skills for the modern workplace in this hands-on community workshop",
        date: "2025-06-10",
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
        tags: "education,workshop,digital,skills",
        video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
      });
      
      // Startup Pitch Competition with video
      await storage.createEvent({
        title: "Startup Pitch Competition",
        description: "Watch innovative startups pitch their ideas to investors and compete for funding",
        date: "2025-08-05",
        time: "13:00",
        location: "Boston, MA",
        category: "Business",
        image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80"
        ]),
        userId: 1,
        featured: true,
        maxAttendees: 200,
        isFree: false,
        price: "15",
        tags: "startup,pitch,business,investment",
        video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
      });
      
      // Culinary Masterclass with video
      await storage.createEvent({
        title: "Culinary Masterclass",
        description: "Learn gourmet cooking techniques from renowned chefs in this immersive masterclass",
        date: "2025-05-25",
        time: "17:00",
        location: "Miami, FL",
        category: "Food",
        image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?auto=format&fit=crop&w=800&q=80"
        ]),
        userId: 1,
        featured: false,
        maxAttendees: 50,
        isFree: false,
        price: "85",
        tags: "food,cooking,culinary,masterclass",
        video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
      });
      
      // Wellness Retreat with video
      await storage.createEvent({
        title: "Wellness Retreat Weekend",
        description: "Rejuvenate your mind and body with yoga, meditation, and wellness workshops",
        date: "2025-09-05",
        time: "08:00",
        location: "Santa Barbara, CA",
        category: "Health",
        image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80"
        ]),
        userId: 1,
        featured: true,
        maxAttendees: 60,
        isFree: false,
        price: "195",
        tags: "wellness,yoga,meditation,health",
        video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4"
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
