import { pgTable, serial, text, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  bio: text("bio"),
  avatar: text("avatar"),
  preferences: text("preferences"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true,
  bio: true,
  avatar: true,
  preferences: true,
});

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: text("date").notNull(),
  time: text("time"),
  location: text("location"),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  image: text("image"),
  images: text("images"),
  video: text("video"),
  featured: boolean("featured").default(false),
  views: integer("views").default(0),
  category: text("category"),
  attendees: integer("attendees").default(0),
  maxAttendees: integer("max_attendees"),
  isFree: boolean("is_free").default(true),
  price: text("price"),
  tags: text("tags"),
});

export const insertEventSchema = createInsertSchema(events).pick({
  title: true,
  description: true,
  date: true,
  time: true,
  location: true,
  userId: true,
  image: true,
  images: true,
  video: true,
  featured: true,
  category: true,
  maxAttendees: true,
  isFree: true,
  price: true,
  tags: true,
});

// Comments table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  eventId: integer("event_id").notNull().references(() => events.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  content: true,
  userId: true,
  eventId: true,
});

// Event ratings
export const eventRatings = pgTable("event_ratings", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  userId: integer("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEventRatingSchema = createInsertSchema(eventRatings).pick({
  eventId: true,
  userId: true,
  rating: true,
});

// Attendance status enum
export const ATTENDANCE_STATUS = {
  GOING: "going",
  INTERESTED: "interested",
  NOT_GOING: "not_going",
} as const;

// Event attendees
export const eventAttendees = pgTable("event_attendees", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  userId: integer("user_id").notNull().references(() => users.id),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEventAttendeeSchema = createInsertSchema(eventAttendees).pick({
  eventId: true,
  userId: true,
  status: true,
});

// Keep these as type definitions for future implementation
// These won't affect the database schema since we're not using these in our routes yet

// User Favorites (Bookmarks) - Type Definitions
export type UserFavorite = {
  id: number;
  userId: number;
  eventId: number;
  createdAt: Date | null;
};

export type InsertUserFavorite = {
  userId: number;
  eventId: number;
};

// Notification types enum
export const NOTIFICATION_TYPE = {
  EVENT_REMINDER: "event_reminder",
  EVENT_UPDATE: "event_update",
  EVENT_CANCELED: "event_canceled",
  NEW_COMMENT: "new_comment",
  ATTENDANCE_UPDATE: "attendance_update",
  ADMIN_MESSAGE: "admin_message",
} as const;

// Notifications - Type Definitions
export type Notification = {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  eventId: number | null;
  isRead: boolean | null;
  createdAt: Date | null;
};

export type InsertNotification = {
  userId: number;
  type: string;
  title: string;
  message: string;
  eventId?: number;
};

// Session table for PostgreSQL
export const session = pgTable("session", {
  sid: text("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Define core type exports
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

// Event tickets for purchased events
export const eventTickets = pgTable("event_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  eventId: integer("event_id").notNull().references(() => events.id),
  quantity: integer("quantity").notNull().default(1),
  totalAmount: integer("total_amount").notNull(),
  paymentReference: text("payment_reference").notNull(),
  paymentStatus: text("payment_status").notNull().default("completed"),
  purchaseDate: timestamp("purchase_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertEventTicketSchema = createInsertSchema(eventTickets).pick({
  userId: true,
  eventId: true,
  quantity: true,
  totalAmount: true,
  paymentReference: true,
  paymentStatus: true,
});

export type InsertEventTicket = z.infer<typeof insertEventTicketSchema>;
export type EventTicket = typeof eventTickets.$inferSelect;

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  comments: many(comments),
  ratings: many(eventRatings),
  attendees: many(eventAttendees),
  tickets: many(eventTickets)
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  user: one(users, {
    fields: [events.userId],
    references: [users.id],
  }),
  comments: many(comments),
  ratings: many(eventRatings),
  attendees: many(eventAttendees),
  tickets: many(eventTickets)
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [comments.eventId],
    references: [events.id],
  }),
}));

export const eventRatingsRelations = relations(eventRatings, ({ one }) => ({
  user: one(users, {
    fields: [eventRatings.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [eventRatings.eventId],
    references: [events.id],
  }),
}));

export const eventAttendeesRelations = relations(eventAttendees, ({ one }) => ({
  user: one(users, {
    fields: [eventAttendees.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [eventAttendees.eventId],
    references: [events.id],
  }),
}));

export const eventTicketsRelations = relations(eventTickets, ({ one }) => ({
  user: one(users, {
    fields: [eventTickets.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [eventTickets.eventId],
    references: [events.id],
  }),
}));