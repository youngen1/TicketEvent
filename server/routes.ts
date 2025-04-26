import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
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

  app.post("/api/events", async (req, res) => {
    try {
      const validation = insertEventSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid event data", 
          errors: validation.error.format() 
        });
      }
      
      const event = await storage.createEvent(validation.data);
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ message: "Error creating event" });
    }
  });

  app.put("/api/events/:id/favorite", async (req, res) => {
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

  const httpServer = createServer(app);

  return httpServer;
}
