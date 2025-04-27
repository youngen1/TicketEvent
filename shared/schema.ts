import { pgTable, text, serial, integer, boolean, timestamp, varchar, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  avatar: text("avatar"),
  bio: text("bio"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  avatar: true,
  bio: true,
  email: true,
});

// Events schema
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  location: text("location").notNull(),
  attendees: integer("attendees").default(0),
  image: text("image"),
  video: text("video"),
  thumbnail: text("thumbnail"),
  createdById: integer("created_by_id").references(() => users.id),
  isFavorite: boolean("is_favorite").default(false),
  schedule: text("schedule"),
  createdAt: timestamp("created_at").defaultNow(),
  isFeatured: boolean("is_featured").default(false),
  views: integer("views").default(0),
  rating: integer("rating").default(0),
  ratingCount: integer("rating_count").default(0),
  tags: text("tags"),
});

export const insertEventSchema = createInsertSchema(events).pick({
  title: true,
  description: true,
  category: true,
  date: true,
  time: true,
  location: true,
  image: true,
  video: true, 
  thumbnail: true,
  schedule: true,
  createdById: true,
  isFeatured: true,
  tags: true,
});

// Comments schema
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  eventId: integer("event_id").notNull().references(() => events.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  content: true,
  userId: true,
  eventId: true,
});

// Event Ratings schema
export const eventRatings = pgTable("event_ratings", {
  id: serial("id").primaryKey(),
  rating: integer("rating").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  eventId: integer("event_id").notNull().references(() => events.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEventRatingSchema = createInsertSchema(eventRatings).pick({
  rating: true,
  userId: true,
  eventId: true,
});

// Event Attendees schema
export const eventAttendees = pgTable("event_attendees", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  eventId: integer("event_id").notNull().references(() => events.id),
  status: text("status").default("attending").notNull(), // attending, interested, not attending
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEventAttendeeSchema = createInsertSchema(eventAttendees).pick({
  userId: true,
  eventId: true,
  status: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export type InsertEventRating = z.infer<typeof insertEventRatingSchema>;
export type EventRating = typeof eventRatings.$inferSelect;

export type InsertEventAttendee = z.infer<typeof insertEventAttendeeSchema>;
export type EventAttendee = typeof eventAttendees.$inferSelect;

// Session table for express-session
export const session = pgTable("session", {
  sid: varchar("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire", { mode: 'date' }).notNull(),
});
