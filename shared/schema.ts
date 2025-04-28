import { pgTable, serial, text, timestamp, integer, boolean, pgEnum, date } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Event categories - used consistently across the application
export const EVENT_CATEGORIES = [
  "Technology",
  "Business",
  "Music",
  "Art",
  "Education", 
  "Sports",
  "Religious",
  "Cultural",
  "Concert",
  "Conference",
  "Workshop",
  "Meetup",
  "Party",
  "Food",
  "Health",
  "Community",
  "Recreational",
  "Other"
];

// Gender enum for consistent gender options
export const GENDER_OPTIONS = {
  MALE: "male",
  FEMALE: "female",
  NON_BINARY: "non-binary",
  OTHER: "other",
  PREFER_NOT_TO_SAY: "prefer-not-to-say"
} as const;

// Gender restriction options for events
export const GENDER_RESTRICTION = {
  NONE: "none",
  MALE_ONLY: "male-only",
  FEMALE_ONLY: "female-only"
} as const;

// Create a Zod schema for gender validation
export const genderSchema = z.enum([
  GENDER_OPTIONS.MALE,
  GENDER_OPTIONS.FEMALE, 
  GENDER_OPTIONS.NON_BINARY,
  GENDER_OPTIONS.OTHER,
  GENDER_OPTIONS.PREFER_NOT_TO_SAY
]);

// Create a Zod schema for gender restriction validation
export const genderRestrictionSchema = z.enum([
  GENDER_RESTRICTION.NONE,
  GENDER_RESTRICTION.MALE_ONLY,
  GENDER_RESTRICTION.FEMALE_ONLY
]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  email: text("email"),
  gender: text("gender"), // Store gender as text (male, female, non-binary, other, prefer-not-to-say)
  dateOfBirth: date("date_of_birth"), // Store date of birth for age calculation
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  bio: text("bio"),
  avatar: text("avatar"),
  interests: text("interests"), // Store user interests as comma-separated text
  preferences: text("preferences"),
  location: text("location"), // Store location as a string (city, country)
  latitude: text("latitude"), // Store latitude for location-based features
  longitude: text("longitude"), // Store longitude for location-based features
  followersCount: integer("followers_count").default(0),
  followingCount: integer("following_count").default(0),
  isAdmin: boolean("is_admin").default(false),
  platformBalance: text("platform_balance").default("0"),
  isBanned: boolean("is_banned").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true,
  gender: true,
  dateOfBirth: true,
  bio: true,
  avatar: true,
  interests: true,
  preferences: true,
  location: true,
  latitude: true,
  longitude: true,
  isBanned: true,
});

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: text("date").notNull(),
  time: text("time"),
  location: text("location"),
  latitude: text("latitude"), // Store latitude for geographic features
  longitude: text("longitude"), // Store longitude for geographic features
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
  // Ticket information
  hasMultipleTicketTypes: boolean("has_multiple_ticket_types").default(false),
  ticketsSold: integer("tickets_sold").default(0),
  totalTickets: integer("total_tickets").default(0),
  // Gender restriction fields
  genderRestriction: text("gender_restriction"), // Store as male-only, female-only, or null for no restriction
  ageRestriction: text("age_restriction").array(), // Store as array of age groups: ["under 18", "20s", "30s", "40+"]
});

export const insertEventSchema = createInsertSchema(events).pick({
  title: true,
  description: true,
  date: true,
  time: true,
  location: true,
  latitude: true,
  longitude: true,
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
  hasMultipleTicketTypes: true,
  totalTickets: true,
  genderRestriction: true,
  ageRestriction: true,
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
  EVENT_REMINDER: "event_reminder",        // Reminder for upcoming events
  EVENT_UPDATE: "event_update",            // Event details were updated
  EVENT_CANCELED: "event_canceled",        // Event was canceled
  NEW_FOLLOWER: "new_follower",            // Someone followed you
  NEW_FRIEND: "new_friend",                // Mutual follow created a friendship
  FOLLOWED_USER_EVENT: "followed_user_event", // Someone you follow created an event
  FOLLOWED_USER_TICKET: "followed_user_ticket", // Someone you follow bought a ticket
  NEW_COMMENT: "new_comment",              // New comment on your event
  ATTENDANCE_UPDATE: "attendance_update",  // Someone is attending your event
  ADMIN_MESSAGE: "admin_message",          // Message from admin
  EVENT_STARTING_TODAY: "event_starting_today", // Event is starting today
} as const;

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  eventId: integer("event_id").references(() => events.id),
  relatedUserId: integer("related_user_id").references(() => users.id),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  type: true,
  title: true,
  message: true,
  eventId: true,
  relatedUserId: true,
  isRead: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

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
  ticketTypeId: integer("ticket_type_id").references(() => ticketTypes.id),
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
  ticketTypeId: true,
  quantity: true,
  totalAmount: true,
  paymentReference: true,
  paymentStatus: true,
});

export type InsertEventTicket = z.infer<typeof insertEventTicketSchema>;
export type EventTicket = typeof eventTickets.$inferSelect;

// Ticket types for events with multiple ticket options
export const ticketTypes = pgTable("ticket_types", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  name: text("name").notNull(), // e.g., "General Admission", "VIP", "Early Bird"
  description: text("description"),
  price: text("price").notNull(),
  quantity: integer("quantity").notNull(), // Total number of this ticket type available
  soldCount: integer("sold_count").default(0), // Number of tickets sold of this type
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertTicketTypeSchema = createInsertSchema(ticketTypes).pick({
  eventId: true,
  name: true,
  description: true,
  price: true,
  quantity: true,
  isActive: true,
});

export type InsertTicketType = z.infer<typeof insertTicketTypeSchema>;
export type TicketType = typeof ticketTypes.$inferSelect;

// User follows table for following relationships
export const userFollows = pgTable("user_follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull().references(() => users.id),
  followingId: integer("following_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserFollowSchema = createInsertSchema(userFollows).pick({
  followerId: true,
  followingId: true,
});

export type InsertUserFollow = z.infer<typeof insertUserFollowSchema>;
export type UserFollow = typeof userFollows.$inferSelect;

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  comments: many(comments),
  ratings: many(eventRatings),
  attendees: many(eventAttendees),
  tickets: many(eventTickets),
  followers: many(userFollows, { relationName: "followers" }),
  following: many(userFollows, { relationName: "following" }),
  notifications: many(notifications)
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  user: one(users, {
    fields: [events.userId],
    references: [users.id],
  }),
  comments: many(comments),
  ratings: many(eventRatings),
  attendees: many(eventAttendees),
  tickets: many(eventTickets),
  ticketTypes: many(ticketTypes)
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
  ticketType: one(ticketTypes, {
    fields: [eventTickets.ticketTypeId],
    references: [ticketTypes.id],
  }),
}));

export const userFollowsRelations = relations(userFollows, ({ one }) => ({
  follower: one(users, {
    fields: [userFollows.followerId],
    references: [users.id],
    relationName: "following"
  }),
  following: one(users, {
    fields: [userFollows.followingId],
    references: [users.id],
    relationName: "followers"
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [notifications.eventId],
    references: [events.id],
  }),
  relatedUser: one(users, {
    fields: [notifications.relatedUserId],
    references: [users.id],
  }),
}));

export const ticketTypesRelations = relations(ticketTypes, ({ one }) => ({
  event: one(events, {
    fields: [ticketTypes.eventId],
    references: [events.id],
  }),
}));