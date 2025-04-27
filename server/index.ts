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
    // Push schema to database
    await import('child_process').then(async (cp) => {
      return new Promise<void>((resolve, reject) => {
        const child = cp.exec('npm run db:push');
        
        child.stdout?.on('data', (data) => {
          log(`[db:push] ${data}`, 'database');
        });
        
        child.stderr?.on('data', (data) => {
          log(`[db:push] ERROR: ${data}`, 'database');
        });
        
        child.on('close', (code) => {
          if (code === 0) {
            log('Database schema pushed successfully', 'database');
            resolve();
          } else {
            const err = new Error(`Database schema push failed with code ${code}`);
            log(err.message, 'database');
            reject(err);
          }
        });
      });
    });
    
    // Seed sample data
    if (storage instanceof DatabaseStorage) {
      await storage.seedEvents();
      log('Sample events seeded', 'database');
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
