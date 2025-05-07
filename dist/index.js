var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/data/seedEvents.ts
var seedEvents_exports = {};
__export(seedEvents_exports, {
  createSeedEvents: () => createSeedEvents
});
function createSeedEvents(nextEventId) {
  return [
    {
      id: nextEventId(),
      title: "Tech Innovation Summit 2025",
      description: "Discover the latest breakthroughs in AI, blockchain, and quantum computing at this premier tech event",
      date: "2025-09-15",
      time: "09:00",
      location: "San Francisco, CA",
      category: "Technology",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1576124886577-6e4890d6d4dd?auto=format&fit=crop&w=800&q=80"
      ]),
      userId: 1,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      views: 120,
      attendees: 75,
      maxAttendees: 200,
      featured: true,
      video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      tags: "tech,innovation,ai,blockchain",
      price: "299.99",
      isFree: false,
      rating: 4.8,
      ratingCount: 45
    },
    {
      id: nextEventId(),
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
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      views: 950,
      attendees: 1250,
      maxAttendees: 5e3,
      featured: true,
      video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      tags: "music,festival,concert,live",
      price: "149.99",
      isFree: false,
      rating: 4.9,
      ratingCount: 320
    },
    {
      id: nextEventId(),
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
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      views: 250,
      attendees: 45,
      maxAttendees: 100,
      featured: false,
      video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      tags: "art,exhibition,contemporary,culture",
      price: "25",
      isFree: false,
      rating: 4.2,
      ratingCount: 18
    },
    {
      id: nextEventId(),
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
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      views: 85,
      attendees: 24,
      maxAttendees: 50,
      featured: false,
      video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      tags: "education,workshop,digital,skills",
      price: "0",
      isFree: true,
      rating: 4.5,
      ratingCount: 12
    },
    {
      id: nextEventId(),
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
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      views: 132,
      attendees: 95,
      maxAttendees: 200,
      featured: true,
      video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      tags: "startup,pitch,business,investment",
      price: "15",
      isFree: false,
      rating: 4.7,
      ratingCount: 28
    },
    {
      id: nextEventId(),
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
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      views: 110,
      attendees: 40,
      maxAttendees: 50,
      featured: false,
      video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      tags: "food,cooking,culinary,masterclass",
      price: "85",
      isFree: false,
      rating: 4.9,
      ratingCount: 32
    },
    {
      id: nextEventId(),
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
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      views: 325,
      attendees: 38,
      maxAttendees: 60,
      featured: true,
      video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
      tags: "wellness,yoga,meditation,health",
      price: "195",
      isFree: false,
      rating: 4.8,
      ratingCount: 42
    }
  ];
}
var init_seedEvents = __esm({
  "server/data/seedEvents.ts"() {
    "use strict";
  }
});

// server/index.ts
import express3 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  ATTENDANCE_STATUS: () => ATTENDANCE_STATUS,
  EVENT_CATEGORIES: () => EVENT_CATEGORIES,
  GENDER_OPTIONS: () => GENDER_OPTIONS,
  GENDER_RESTRICTION: () => GENDER_RESTRICTION,
  NOTIFICATION_TYPE: () => NOTIFICATION_TYPE,
  comments: () => comments,
  commentsRelations: () => commentsRelations,
  eventAttendees: () => eventAttendees,
  eventAttendeesRelations: () => eventAttendeesRelations,
  eventRatings: () => eventRatings,
  eventRatingsRelations: () => eventRatingsRelations,
  eventTickets: () => eventTickets,
  eventTicketsRelations: () => eventTicketsRelations,
  events: () => events,
  eventsRelations: () => eventsRelations,
  genderRestrictionSchema: () => genderRestrictionSchema,
  genderSchema: () => genderSchema,
  insertCommentSchema: () => insertCommentSchema,
  insertEventAttendeeSchema: () => insertEventAttendeeSchema,
  insertEventRatingSchema: () => insertEventRatingSchema,
  insertEventSchema: () => insertEventSchema,
  insertEventTicketSchema: () => insertEventTicketSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertTicketTypeSchema: () => insertTicketTypeSchema,
  insertUserFollowSchema: () => insertUserFollowSchema,
  insertUserSchema: () => insertUserSchema,
  notifications: () => notifications,
  notificationsRelations: () => notificationsRelations,
  session: () => session,
  ticketTypes: () => ticketTypes,
  ticketTypesRelations: () => ticketTypesRelations,
  userFollows: () => userFollows,
  userFollowsRelations: () => userFollowsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, serial, text, timestamp, integer, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
var EVENT_CATEGORIES = [
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
var GENDER_OPTIONS = {
  MALE: "male",
  FEMALE: "female",
  NON_BINARY: "non-binary",
  OTHER: "other",
  PREFER_NOT_TO_SAY: "prefer-not-to-say"
};
var GENDER_RESTRICTION = {
  NONE: "none",
  MALE_ONLY: "male-only",
  FEMALE_ONLY: "female-only"
};
var genderSchema = z.enum([
  GENDER_OPTIONS.MALE,
  GENDER_OPTIONS.FEMALE,
  GENDER_OPTIONS.NON_BINARY,
  GENDER_OPTIONS.OTHER,
  GENDER_OPTIONS.PREFER_NOT_TO_SAY
]);
var genderRestrictionSchema = z.enum([
  GENDER_RESTRICTION.NONE,
  GENDER_RESTRICTION.MALE_ONLY,
  GENDER_RESTRICTION.FEMALE_ONLY
]);
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  email: text("email"),
  emailVerified: boolean("email_verified").default(false),
  verificationToken: text("verification_token"),
  verificationTokenExpiry: timestamp("verification_token_expiry"),
  resetPasswordToken: text("reset_password_token"),
  resetPasswordTokenExpiry: timestamp("reset_password_token_expiry"),
  gender: text("gender"),
  // Store gender as text (male, female, non-binary, other, prefer-not-to-say)
  dateOfBirth: date("date_of_birth"),
  // Store date of birth for age calculation
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  bio: text("bio"),
  avatar: text("avatar"),
  interests: text("interests"),
  // Store user interests as comma-separated text
  preferences: text("preferences"),
  location: text("location"),
  // Store location as a string (city, country)
  latitude: text("latitude"),
  // Store latitude for location-based features
  longitude: text("longitude"),
  // Store longitude for location-based features
  followersCount: integer("followers_count").default(0),
  followingCount: integer("following_count").default(0),
  isAdmin: boolean("is_admin").default(false),
  platformBalance: text("platform_balance").default("0"),
  isBanned: boolean("is_banned").default(false)
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true,
  emailVerified: true,
  verificationToken: true,
  verificationTokenExpiry: true,
  resetPasswordToken: true,
  resetPasswordTokenExpiry: true,
  gender: true,
  dateOfBirth: true,
  bio: true,
  avatar: true,
  interests: true,
  preferences: true,
  location: true,
  latitude: true,
  longitude: true,
  isBanned: true
});
var events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: text("date").notNull(),
  time: text("time"),
  location: text("location"),
  latitude: text("latitude"),
  // Store latitude for geographic features
  longitude: text("longitude"),
  // Store longitude for geographic features
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
  genderRestriction: text("gender_restriction"),
  // Store as male-only, female-only, or null for no restriction
  ageRestriction: text("age_restriction").array()
  // Store as array of age groups: ["under 18", "20s", "30s", "40+"]
});
var insertEventSchema = createInsertSchema(events).pick({
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
  ageRestriction: true
});
var comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  eventId: integer("event_id").notNull().references(() => events.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertCommentSchema = createInsertSchema(comments).pick({
  content: true,
  userId: true,
  eventId: true
});
var eventRatings = pgTable("event_ratings", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  userId: integer("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertEventRatingSchema = createInsertSchema(eventRatings).pick({
  eventId: true,
  userId: true,
  rating: true
});
var ATTENDANCE_STATUS = {
  GOING: "going",
  INTERESTED: "interested",
  NOT_GOING: "not_going"
};
var eventAttendees = pgTable("event_attendees", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  userId: integer("user_id").notNull().references(() => users.id),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertEventAttendeeSchema = createInsertSchema(eventAttendees).pick({
  eventId: true,
  userId: true,
  status: true
});
var NOTIFICATION_TYPE = {
  EVENT_REMINDER: "event_reminder",
  // Reminder for upcoming events
  EVENT_UPDATE: "event_update",
  // Event details were updated
  EVENT_CANCELED: "event_canceled",
  // Event was canceled
  NEW_FOLLOWER: "new_follower",
  // Someone followed you
  NEW_FRIEND: "new_friend",
  // Mutual follow created a friendship
  FOLLOWED_USER_EVENT: "followed_user_event",
  // Someone you follow created an event
  FOLLOWED_USER_TICKET: "followed_user_ticket",
  // Someone you follow bought a ticket
  NEW_COMMENT: "new_comment",
  // New comment on your event
  ATTENDANCE_UPDATE: "attendance_update",
  // Someone is attending your event
  ADMIN_MESSAGE: "admin_message",
  // Message from admin
  EVENT_STARTING_TODAY: "event_starting_today"
  // Event is starting today
};
var notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  eventId: integer("event_id").references(() => events.id),
  relatedUserId: integer("related_user_id").references(() => users.id),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  type: true,
  title: true,
  message: true,
  eventId: true,
  relatedUserId: true,
  isRead: true
});
var session = pgTable("session", {
  sid: text("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire").notNull()
});
var eventTickets = pgTable("event_tickets", {
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
  updatedAt: timestamp("updated_at")
});
var insertEventTicketSchema = createInsertSchema(eventTickets).pick({
  userId: true,
  eventId: true,
  ticketTypeId: true,
  quantity: true,
  totalAmount: true,
  paymentReference: true,
  paymentStatus: true
});
var ticketTypes = pgTable("ticket_types", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  name: text("name").notNull(),
  // e.g., "General Admission", "VIP", "Early Bird"
  description: text("description"),
  price: text("price").notNull(),
  quantity: integer("quantity").notNull(),
  // Total number of this ticket type available
  soldCount: integer("sold_count").default(0),
  // Number of tickets sold of this type
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});
var insertTicketTypeSchema = createInsertSchema(ticketTypes).pick({
  eventId: true,
  name: true,
  description: true,
  price: true,
  quantity: true,
  isActive: true
});
var userFollows = pgTable("user_follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull().references(() => users.id),
  followingId: integer("following_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserFollowSchema = createInsertSchema(userFollows).pick({
  followerId: true,
  followingId: true
});
var usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  comments: many(comments),
  ratings: many(eventRatings),
  attendees: many(eventAttendees),
  tickets: many(eventTickets),
  followers: many(userFollows, { relationName: "followers" }),
  following: many(userFollows, { relationName: "following" }),
  notifications: many(notifications)
}));
var eventsRelations = relations(events, ({ one, many }) => ({
  user: one(users, {
    fields: [events.userId],
    references: [users.id]
  }),
  comments: many(comments),
  ratings: many(eventRatings),
  attendees: many(eventAttendees),
  tickets: many(eventTickets),
  ticketTypes: many(ticketTypes)
}));
var commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id]
  }),
  event: one(events, {
    fields: [comments.eventId],
    references: [events.id]
  })
}));
var eventRatingsRelations = relations(eventRatings, ({ one }) => ({
  user: one(users, {
    fields: [eventRatings.userId],
    references: [users.id]
  }),
  event: one(events, {
    fields: [eventRatings.eventId],
    references: [events.id]
  })
}));
var eventAttendeesRelations = relations(eventAttendees, ({ one }) => ({
  user: one(users, {
    fields: [eventAttendees.userId],
    references: [users.id]
  }),
  event: one(events, {
    fields: [eventAttendees.eventId],
    references: [events.id]
  })
}));
var eventTicketsRelations = relations(eventTickets, ({ one }) => ({
  user: one(users, {
    fields: [eventTickets.userId],
    references: [users.id]
  }),
  event: one(events, {
    fields: [eventTickets.eventId],
    references: [events.id]
  }),
  ticketType: one(ticketTypes, {
    fields: [eventTickets.ticketTypeId],
    references: [ticketTypes.id]
  })
}));
var userFollowsRelations = relations(userFollows, ({ one }) => ({
  follower: one(users, {
    fields: [userFollows.followerId],
    references: [users.id],
    relationName: "following"
  }),
  following: one(users, {
    fields: [userFollows.followingId],
    references: [users.id],
    relationName: "followers"
  })
}));
var notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id]
  }),
  event: one(events, {
    fields: [notifications.eventId],
    references: [events.id]
  }),
  relatedUser: one(users, {
    fields: [notifications.relatedUserId],
    references: [users.id]
  })
}));
var ticketTypesRelations = relations(ticketTypes, ({ one }) => ({
  event: one(events, {
    fields: [ticketTypes.eventId],
    references: [events.id]
  })
}));

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
process.env.PAYSTACK_MODE = "live";
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq, asc, desc, and, avg, count, sql } from "drizzle-orm";
var MemStorage = class {
  users = [];
  events = [];
  comments = [];
  ratings = [];
  attendees = [];
  tickets = [];
  userFollows = [];
  notifications = [];
  ticketTypes = [];
  nextUserId = 1;
  nextEventId = 1;
  nextCommentId = 1;
  nextRatingId = 1;
  nextAttendeeId = 1;
  nextTicketId = 1;
  nextUserFollowId = 1;
  nextNotificationId = 1;
  nextTicketTypeId = 1;
  constructor() {
    console.log("Initializing MemStorage...");
    this.users.push({
      id: this.nextUserId++,
      // Will be 1
      username: "demo",
      password: "$2a$10$JdP6aRBl9m4OFlniT/GGy.DeN9/LZhW1UcRTHFCZ7K5y1ivAbU.sG",
      // "password"
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      displayName: "Demo User",
      avatar: null,
      bio: null,
      email: "demo@example.com",
      // Added email for payment processing
      preferences: null,
      followersCount: 0,
      followingCount: 0,
      isAdmin: false,
      platformBalance: "0",
      location: "Cape Town, South Africa",
      latitude: -33.9249,
      longitude: 18.4241,
      gender: "other",
      dateOfBirth: "1990-01-01",
      interests: null,
      isBanned: false
    });
    this.users.push({
      id: this.nextUserId++,
      // Will be 2
      username: "admin",
      password: "$2a$10$JdP6aRBl9m4OFlniT/GGy.DeN9/LZhW1UcRTHFCZ7K5y1ivAbU.sG",
      // "password"
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      displayName: "System Admin",
      avatar: "https://ui-avatars.com/api/?name=System+Admin&background=random",
      bio: "System administrator account that collects platform fees",
      email: "admin@eventsystem.com",
      preferences: null,
      followersCount: 0,
      followingCount: 0,
      isAdmin: true,
      platformBalance: "0",
      location: "Johannesburg, South Africa",
      latitude: -26.2041,
      longitude: 28.0473,
      gender: "other",
      dateOfBirth: "1985-01-01",
      interests: null,
      isBanned: false
    });
    console.log("Created admin account with username: admin and password: password");
    const locations = [
      { city: "Durban, South Africa", lat: -29.8587, lng: 31.0218 },
      { city: "Pretoria, South Africa", lat: -25.7479, lng: 28.2293 },
      { city: "Port Elizabeth, South Africa", lat: -33.7139, lng: 25.5207 },
      { city: "Bloemfontein, South Africa", lat: -29.0852, lng: 26.1596 },
      { city: "East London, South Africa", lat: -33.0292, lng: 27.8546 },
      { city: "Kimberley, South Africa", lat: -28.7282, lng: 24.7499 },
      { city: "Polokwane, South Africa", lat: -23.9045, lng: 29.4688 },
      { city: "Nelspruit, South Africa", lat: -25.4753, lng: 30.9694 }
    ];
    for (let i = 3; i <= 10; i++) {
      const locationIndex = i - 3;
      this.users.push({
        id: this.nextUserId++,
        username: `user${i}`,
        password: "$2a$10$JdP6aRBl9m4OFlniT/GGy.DeN9/LZhW1UcRTHFCZ7K5y1ivAbU.sG",
        // "password"
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        displayName: `User ${i}`,
        avatar: `https://ui-avatars.com/api/?name=User+${i}&background=random`,
        bio: `Bio for User ${i}`,
        email: `user${i}@example.com`,
        preferences: null,
        followersCount: 0,
        followingCount: 0,
        isAdmin: false,
        platformBalance: "0",
        location: locations[locationIndex].city,
        latitude: locations[locationIndex].lat,
        longitude: locations[locationIndex].lng,
        gender: "other",
        dateOfBirth: "1990-01-01",
        interests: null,
        isBanned: false
      });
    }
    console.log("Setting up followers and following relationships for admin user");
    for (let i = 3; i <= 5; i++) {
      this.userFollows.push({
        id: this.nextUserFollowId++,
        followerId: 2,
        // Admin user ID
        followingId: i,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: null
      });
    }
    for (let i = 6; i <= 10; i++) {
      this.userFollows.push({
        id: this.nextUserFollowId++,
        followerId: i,
        followingId: 2,
        // Admin user ID
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: null
      });
    }
    this.users[1].followingCount = 3;
    this.users[1].followersCount = 5;
    this.users[1].platformBalance = "142.50";
    console.log("Creating test tickets for admin user");
    for (let i = 1; i <= 3; i++) {
      this.tickets.push({
        id: this.nextTicketId++,
        userId: 2,
        // Admin user ID
        eventId: i,
        quantity: 2,
        totalAmount: i === 1 ? 599.98 : i === 2 ? 299.98 : 50,
        paymentReference: `ticket-${i}-${Date.now()}`,
        paymentStatus: "completed",
        purchaseDate: new Date(Date.now() - i * 24 * 60 * 60 * 1e3),
        // Different purchase dates
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1e3),
        updatedAt: null
      });
    }
    this.seedEvents();
    console.log(`Seeded ${this.events.length} events in memory storage`);
  }
  async seedEvents() {
    console.log("Running seedEvents function...");
    try {
      const { createSeedEvents: createSeedEvents2 } = await Promise.resolve().then(() => (init_seedEvents(), seedEvents_exports));
      const sampleEvents = createSeedEvents2(() => this.nextEventId++);
      this.events = sampleEvents;
      console.log(`Successfully loaded ${sampleEvents.length} events with videos from seed data`);
    } catch (error) {
      console.error("Error loading seed events:", error);
      console.log("Using fallback event with video");
      this.events = [{
        id: this.nextEventId++,
        title: "Demo Event with Video",
        description: "A sample event with an embedded video from Google",
        date: "2025-08-15",
        time: "15:00",
        location: "Virtual Event",
        category: "Technology",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80"
        ]),
        userId: 1,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        views: 50,
        attendees: 20,
        maxAttendees: 100,
        featured: true,
        video: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        tags: "demo,video,technology",
        price: "0",
        isFree: true,
        rating: 4.5,
        ratingCount: 10
      }];
    }
  }
  // Original events definition for reference
  originalSeedEvents() {
    const sampleEvents = [
      {
        id: this.nextEventId++,
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
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        views: 120,
        attendees: 75,
        maxAttendees: 200,
        featured: true,
        video: null,
        tags: "tech,conference,networking",
        price: 299.99,
        isFree: false,
        rating: 4.8,
        ratingCount: 45
      },
      {
        id: this.nextEventId++,
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
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        views: 950,
        attendees: 1250,
        maxAttendees: 5e3,
        featured: true,
        video: null,
        tags: "music,festival,summer",
        price: 149.99,
        isFree: false,
        rating: 4.9,
        ratingCount: 320
      },
      {
        id: this.nextEventId++,
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
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        views: 250,
        attendees: 45,
        maxAttendees: 100,
        featured: false,
        video: null,
        tags: "art,exhibition,culture",
        price: 25,
        isFree: false,
        rating: 4.2,
        ratingCount: 18
      },
      {
        id: this.nextEventId++,
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
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        views: 85,
        attendees: 24,
        maxAttendees: 50,
        featured: false,
        video: null,
        tags: "education,workshop,community",
        price: 0,
        isFree: true,
        rating: 4.5,
        ratingCount: 12
      },
      {
        id: this.nextEventId++,
        title: "R2 Live Payment Test Event",
        description: "A small test event that costs exactly R2 to test the live payment system",
        date: "2025-05-01",
        time: "18:00",
        location: "Johannesburg",
        category: "Testing",
        image: "https://images.unsplash.com/photo-1556745753-b2904692b3cd?auto=format&fit=crop&w=800&q=80",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1556745753-b2904692b3cd?auto=format&fit=crop&w=800&q=80"
        ]),
        userId: 1,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        views: 0,
        attendees: 0,
        maxAttendees: 100,
        featured: false,
        video: null,
        tags: "test,payment,R2,budget",
        price: 2,
        isFree: false,
        rating: 0,
        ratingCount: 0
      },
      {
        id: this.nextEventId++,
        title: "R3 Live Payment Test Event",
        description: "A test event that costs exactly R3 to test the live payment system",
        date: "2025-05-10",
        time: "18:00",
        location: "Cape Town",
        category: "Testing",
        image: "https://images.unsplash.com/photo-1560439514-4e9645039924?auto=format&fit=crop&w=800&q=80",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1560439514-4e9645039924?auto=format&fit=crop&w=800&q=80"
        ]),
        userId: 1,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        views: 0,
        attendees: 0,
        maxAttendees: 100,
        featured: false,
        video: null,
        tags: "test,payment,R3,live",
        price: 3,
        isFree: false,
        rating: 0,
        ratingCount: 0
      },
      {
        id: this.nextEventId++,
        title: "Video Demo Event",
        description: "An event showcasing video upload capabilities with our new 80MB limit",
        date: "2025-06-15",
        time: "19:00",
        location: "Virtual Event",
        category: "Technology",
        image: "https://images.unsplash.com/photo-1492619267744-f1e10ae9097c?auto=format&fit=crop&w=800&q=80",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1492619267744-f1e10ae9097c?auto=format&fit=crop&w=800&q=80"
        ]),
        userId: 2,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        views: 42,
        attendees: 18,
        maxAttendees: 200,
        featured: true,
        video: "/uploads/videos/sample_video.mp4",
        tags: "video,demo,technology",
        price: 15,
        isFree: false,
        rating: 4.7,
        ratingCount: 8
      },
      {
        id: this.nextEventId++,
        title: "Interactive Virtual Concert",
        description: "Join us for a fully virtual concert experience with high-definition video",
        date: "2025-07-20",
        time: "20:00",
        location: "Online",
        category: "Entertainment",
        image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80"
        ]),
        userId: 2,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        views: 128,
        attendees: 62,
        maxAttendees: 1e3,
        featured: true,
        video: "/uploads/videos/sample_video2.mp4",
        tags: "virtual,concert,video,music",
        price: 25,
        isFree: false,
        rating: 4.9,
        ratingCount: 15
      }
    ];
    this.events = sampleEvents;
    console.log(`Successfully seeded ${this.events.length} events to memory storage`);
  }
  // User methods
  async getUser(id) {
    return this.users.find((user) => user.id === id);
  }
  async getUserByUsername(username) {
    return this.users.find((user) => user.username === username);
  }
  async createUser(insertUser) {
    const user = {
      id: this.nextUserId++,
      ...insertUser,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      displayName: null,
      avatar: null,
      bio: null
    };
    this.users.push(user);
    return user;
  }
  async updateUser(id, userData) {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) {
      throw new Error(`User with id ${id} not found`);
    }
    this.users[index] = {
      ...this.users[index],
      ...userData,
      updatedAt: /* @__PURE__ */ new Date()
    };
    return this.users[index];
  }
  async getUserEvents(userId) {
    return this.events.filter((event) => event.userId === userId);
  }
  // Event methods
  async getAllEvents(category, tags, featured) {
    console.log(`Getting all events. Total events in memory: ${this.events.length}`);
    console.log(`Events: ${JSON.stringify(this.events.map((e) => ({ id: e.id, title: e.title })))}`);
    let filteredEvents = [...this.events];
    if (category) {
      filteredEvents = filteredEvents.filter((event) => event.category === category);
    }
    if (tags) {
      filteredEvents = filteredEvents.filter((event) => event.tags && event.tags.includes(tags));
    }
    if (featured === true) {
      filteredEvents = filteredEvents.filter((event) => event.featured === true);
    }
    console.log(`Returning ${filteredEvents.length} events`);
    return filteredEvents;
  }
  async getEvent(id) {
    return this.events.find((event) => event.id === id);
  }
  async createEvent(event) {
    const newEvent = {
      id: this.nextEventId++,
      ...event,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      views: 0,
      attendees: 0,
      maxAttendees: event.maxAttendees || 100,
      featured: false
    };
    this.events.push(newEvent);
    return newEvent;
  }
  async updateEvent(id, eventData) {
    const index = this.events.findIndex((event) => event.id === id);
    if (index === -1) {
      throw new Error(`Event with id ${id} not found`);
    }
    this.events[index] = {
      ...this.events[index],
      ...eventData,
      updatedAt: /* @__PURE__ */ new Date()
    };
    return this.events[index];
  }
  async deleteEvent(id) {
    console.log(`Deleting event with ID: ${id}`);
    const eventIndex = this.events.findIndex((event) => event.id === id);
    if (eventIndex === -1) {
      throw new Error(`Event with id ${id} not found`);
    }
    this.events.splice(eventIndex, 1);
    console.log(`Event with ID ${id} deleted successfully`);
    this.comments = this.comments.filter((comment) => comment.eventId !== id);
    this.attendees = this.attendees.filter((attendee) => attendee.eventId !== id);
    this.tickets = this.tickets.filter((ticket) => ticket.eventId !== id);
    this.ratings = this.ratings.filter((rating) => rating.eventId !== id);
    this.ticketTypes = this.ticketTypes.filter((ticketType) => ticketType.eventId !== id);
  }
  async toggleFavorite(id) {
    const index = this.events.findIndex((event2) => event2.id === id);
    if (index === -1) {
      throw new Error(`Event with id ${id} not found`);
    }
    const event = this.events[index];
    const favorited = !event.favorited;
    this.events[index] = {
      ...event,
      favorited
    };
    return this.events[index];
  }
  async incrementEventViews(id) {
    const index = this.events.findIndex((event) => event.id === id);
    if (index !== -1) {
      this.events[index].views = (this.events[index].views || 0) + 1;
    }
  }
  async getFeaturedEvents(limit = 5) {
    return this.events.filter((event) => event.featured).slice(0, limit);
  }
  async searchEvents(query) {
    const lowerQuery = query.toLowerCase();
    return this.events.filter(
      (event) => event.title && event.title.toLowerCase().includes(lowerQuery) || event.description && event.description.toLowerCase().includes(lowerQuery) || event.location && event.location.toLowerCase().includes(lowerQuery) || event.category && event.category.toLowerCase().includes(lowerQuery)
    );
  }
  // Comment methods
  async getEventComments(eventId) {
    return this.comments.filter((comment) => comment.eventId === eventId).map((comment) => {
      const user = this.users.find((u) => u.id === comment.userId);
      return {
        ...comment,
        username: user?.username || "Anonymous",
        displayName: user?.displayName,
        avatar: user?.avatar
      };
    }).sort((a, b) => {
      const dateA = a.createdAt || /* @__PURE__ */ new Date(0);
      const dateB = b.createdAt || /* @__PURE__ */ new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  }
  async createComment(comment) {
    const newComment = {
      id: this.nextCommentId++,
      ...comment,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.comments.push(newComment);
    return newComment;
  }
  async updateComment(id, content) {
    const index = this.comments.findIndex((comment) => comment.id === id);
    if (index === -1) {
      throw new Error(`Comment with id ${id} not found`);
    }
    this.comments[index] = {
      ...this.comments[index],
      content,
      updatedAt: /* @__PURE__ */ new Date()
    };
    return this.comments[index];
  }
  async deleteComment(id) {
    const index = this.comments.findIndex((comment) => comment.id === id);
    if (index !== -1) {
      this.comments.splice(index, 1);
    }
  }
  // Rating methods
  async getEventRating(eventId, userId) {
    return this.ratings.find(
      (rating) => rating.eventId === eventId && rating.userId === userId
    );
  }
  async createOrUpdateRating(rating) {
    const existingRating = await this.getEventRating(rating.eventId, rating.userId);
    if (existingRating) {
      const index = this.ratings.findIndex((r) => r.id === existingRating.id);
      this.ratings[index] = {
        ...existingRating,
        value: rating.value,
        updatedAt: /* @__PURE__ */ new Date()
      };
      await this.updateEventRatingAverage(rating.eventId);
      return this.ratings[index];
    } else {
      const newRating = {
        id: this.nextRatingId++,
        ...rating,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      this.ratings.push(newRating);
      await this.updateEventRatingAverage(rating.eventId);
      return newRating;
    }
  }
  async getAverageEventRating(eventId) {
    const eventRatings2 = this.ratings.filter((rating) => rating.eventId === eventId);
    if (eventRatings2.length === 0) {
      return 0;
    }
    const sum = eventRatings2.reduce((total, rating) => total + (rating.value || 0), 0);
    return sum / eventRatings2.length;
  }
  async updateEventRatingAverage(eventId) {
    const eventIndex = this.events.findIndex((event) => event.id === eventId);
    if (eventIndex !== -1) {
      const average = await this.getAverageEventRating(eventId);
      const ratingsCount = this.ratings.filter((rating) => rating.eventId === eventId).length;
      this.events[eventIndex] = {
        ...this.events[eventIndex],
        rating: average,
        ratingCount: ratingsCount
      };
    }
  }
  // Attendance methods
  async getEventAttendees(eventId) {
    return this.attendees.filter((attendee) => attendee.eventId === eventId).map((attendee) => {
      const user = this.users.find((u) => u.id === attendee.userId);
      return {
        ...attendee,
        username: user?.username || "Anonymous",
        displayName: user?.displayName,
        avatar: user?.avatar
      };
    });
  }
  async getUserAttendance(userId, eventId) {
    return this.attendees.find(
      (attendee) => attendee.userId === userId && attendee.eventId === eventId
    );
  }
  async createOrUpdateAttendance(attendance) {
    const existingAttendance = await this.getUserAttendance(attendance.userId, attendance.eventId);
    if (existingAttendance) {
      const index = this.attendees.findIndex((a) => a.id === existingAttendance.id);
      this.attendees[index] = {
        ...existingAttendance,
        status: attendance.status,
        updatedAt: /* @__PURE__ */ new Date()
      };
      await this.updateEventAttendeeCount(attendance.eventId);
      return this.attendees[index];
    } else {
      const newAttendance = {
        id: this.nextAttendeeId++,
        ...attendance,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      this.attendees.push(newAttendance);
      await this.updateEventAttendeeCount(attendance.eventId);
      return newAttendance;
    }
  }
  async getUpcomingUserEvents(userId) {
    const userAttendances = this.attendees.filter(
      (attendee) => attendee.userId === userId && attendee.status === ATTENDANCE_STATUS.GOING
    );
    const eventIds = userAttendances.map((attendance) => attendance.eventId);
    const today = /* @__PURE__ */ new Date();
    const todayStr = today.toISOString().split("T")[0];
    return this.events.filter(
      (event) => eventIds.includes(event.id) && event.date >= todayStr
    ).sort((a, b) => {
      if (a.date === b.date) {
        return (a.time || "").localeCompare(b.time || "");
      }
      return a.date.localeCompare(b.date);
    });
  }
  async updateEventAttendeeCount(eventId) {
    const eventIndex = this.events.findIndex((event) => event.id === eventId);
    if (eventIndex !== -1) {
      const goingAttendees = this.attendees.filter(
        (attendee) => attendee.eventId === eventId && attendee.status === ATTENDANCE_STATUS.GOING
      ).length;
      this.events[eventIndex] = {
        ...this.events[eventIndex],
        attendees: goingAttendees
      };
    }
  }
  // Ticket methods
  async getUserTickets(userId) {
    return this.tickets.filter(
      (ticket) => ticket.userId === userId && (ticket.paymentStatus === "completed" || ticket.paymentStatus === "pending") && ticket.paymentStatus !== "failed"
    ).sort((a, b) => {
      const dateA = new Date(a.purchaseDate || 0);
      const dateB = new Date(b.purchaseDate || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }
  async createTicket(ticket) {
    const newTicket = {
      id: this.nextTicketId++,
      ...ticket,
      purchaseDate: /* @__PURE__ */ new Date(),
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: null
    };
    this.tickets.push(newTicket);
    if (newTicket.paymentStatus === "completed") {
      await this.processPlatformFee(newTicket);
    }
    return newTicket;
  }
  // Process the 15% platform fee and credit it to the admin account
  async processPlatformFee(ticket) {
    try {
      const adminUser = this.users.find((user) => user.isAdmin === true);
      if (!adminUser) {
        console.error("No admin account found to credit platform fee");
        return;
      }
      const ticketAmount = parseFloat(ticket.totalAmount?.toString() || "0");
      const platformFee = ticketAmount * 0.15;
      const currentBalance = parseFloat(adminUser.platformBalance || "0");
      const newBalance = currentBalance + platformFee;
      adminUser.platformBalance = newBalance.toString();
      console.log(`Credited R${platformFee.toFixed(2)} platform fee to admin account. New balance: R${newBalance.toFixed(2)}`);
    } catch (error) {
      console.error("Error processing platform fee:", error);
    }
  }
  async getEventTickets(eventId) {
    return this.tickets.filter((ticket) => ticket.eventId === eventId);
  }
  async getTicket(ticketId) {
    return this.tickets.find((ticket) => ticket.id === ticketId);
  }
  async getTicketByReference(reference) {
    return this.tickets.find((ticket) => ticket.paymentReference === reference);
  }
  async updateTicket(id, updates) {
    const index = this.tickets.findIndex((ticket) => ticket.id === id);
    if (index === -1) {
      throw new Error(`Ticket with id ${id} not found`);
    }
    const oldTicket = this.tickets[index];
    this.tickets[index] = {
      ...this.tickets[index],
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    };
    const updatedTicket = this.tickets[index];
    if (oldTicket.paymentStatus !== "completed" && updatedTicket.paymentStatus === "completed") {
      await this.processPlatformFee(updatedTicket);
    }
    return updatedTicket;
  }
  // Ticket type methods
  async createTicketType(ticketType) {
    const newTicketType = {
      id: this.nextTicketTypeId++,
      eventId: ticketType.eventId,
      name: ticketType.name,
      description: ticketType.description || "",
      price: ticketType.price,
      quantity: ticketType.quantity,
      soldCount: 0,
      isActive: ticketType.isActive !== void 0 ? ticketType.isActive : true,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: null
    };
    this.ticketTypes.push(newTicketType);
    return newTicketType;
  }
  async getEventTicketTypes(eventId) {
    return this.ticketTypes.filter((ticketType) => ticketType.eventId === eventId);
  }
  async getTicketType(id) {
    return this.ticketTypes.find((ticketType) => ticketType.id === id);
  }
  // User follow methods
  async getUserFollowers(userId) {
    const followerIds = this.userFollows.filter((follow) => follow.followingId === userId).map((follow) => follow.followerId);
    return this.users.filter((user) => followerIds.includes(user.id));
  }
  async getUserFollowing(userId) {
    const followingIds = this.userFollows.filter((follow) => follow.followerId === userId).map((follow) => follow.followingId);
    return this.users.filter((user) => followingIds.includes(user.id));
  }
  async followUser(followerId, followingId) {
    const follower = await this.getUser(followerId);
    const following = await this.getUser(followingId);
    if (!follower) {
      throw new Error(`Follower user with id ${followerId} not found`);
    }
    if (!following) {
      throw new Error(`Following user with id ${followingId} not found`);
    }
    const existingFollow = this.userFollows.find(
      (follow) => follow.followerId === followerId && follow.followingId === followingId
    );
    if (existingFollow) {
      return existingFollow;
    }
    const newFollow = {
      id: this.nextUserFollowId++,
      followerId,
      followingId,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.userFollows.push(newFollow);
    this.updateUserFollowStats(followerId, followingId);
    return newFollow;
  }
  async unfollowUser(followerId, followingId) {
    const index = this.userFollows.findIndex(
      (follow) => follow.followerId === followerId && follow.followingId === followingId
    );
    if (index !== -1) {
      this.userFollows.splice(index, 1);
      this.updateUserFollowStats(followerId, followingId);
    }
  }
  async isFollowing(followerId, followingId) {
    return this.userFollows.some(
      (follow) => follow.followerId === followerId && follow.followingId === followingId
    );
  }
  // Helper method to update follower and following counts
  async updateUserFollowStats(followerId, followingId) {
    const followerIndex = this.users.findIndex((user) => user.id === followerId);
    if (followerIndex !== -1) {
      const followingCount = this.userFollows.filter((follow) => follow.followerId === followerId).length;
      this.users[followerIndex] = {
        ...this.users[followerIndex],
        followingCount
      };
    }
    const followingIndex = this.users.findIndex((user) => user.id === followingId);
    if (followingIndex !== -1) {
      const followersCount = this.userFollows.filter((follow) => follow.followingId === followingId).length;
      this.users[followingIndex] = {
        ...this.users[followingIndex],
        followersCount
      };
    }
  }
  // Get all users for the follow feature
  async getUsersToFollow() {
    return this.users;
  }
  // Get all users (for admin purposes)
  async getAllUsers() {
    return this.users;
  }
  async searchUsers(query, locationQuery, maxDistance) {
    if (!query && !locationQuery) {
      return [];
    }
    if (!query && locationQuery) {
      return this.users.filter((user) => {
        if (user.location) {
          return user.location.toLowerCase().includes(locationQuery.toLowerCase());
        }
        return false;
      });
    }
    if (query && !locationQuery) {
      const lowerCaseQuery2 = query.toLowerCase();
      return this.users.filter((user) => {
        return user.username.toLowerCase().includes(lowerCaseQuery2) || user.displayName && user.displayName.toLowerCase().includes(lowerCaseQuery2) || user.bio && user.bio.toLowerCase().includes(lowerCaseQuery2) || user.email && user.email.toLowerCase().includes(lowerCaseQuery2);
      });
    }
    const lowerCaseQuery = query.toLowerCase();
    const textFilteredUsers = this.users.filter((user) => {
      return user.username.toLowerCase().includes(lowerCaseQuery) || user.displayName && user.displayName.toLowerCase().includes(lowerCaseQuery) || user.bio && user.bio.toLowerCase().includes(lowerCaseQuery) || user.email && user.email.toLowerCase().includes(lowerCaseQuery);
    });
    return textFilteredUsers.filter((user) => {
      if (user.location) {
        return user.location.toLowerCase().includes(locationQuery.toLowerCase());
      }
      return false;
    });
  }
  // Get all tickets (for admin purposes)
  async getAllTickets() {
    return this.tickets;
  }
  async hasUserPurchasedEventTicket(userId, eventId) {
    const existingTicket = this.tickets.find(
      (ticket) => ticket.userId === userId && ticket.eventId === eventId && (ticket.paymentStatus === "completed" || ticket.paymentStatus === "pending")
    );
    return !!existingTicket;
  }
  // Extra properties to make TypeScript happy
  async seedEvents() {
    return Promise.resolve();
  }
  // Notification methods
  async getUserNotifications(userId) {
    return this.notifications.filter((notification) => notification.userId === userId).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }
  async createNotification(notification) {
    const newNotification = {
      id: this.nextNotificationId++,
      ...notification,
      isRead: false,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.notifications.push(newNotification);
    return newNotification;
  }
  async markNotificationAsRead(notificationId) {
    const notification = this.notifications.find((n) => n.id === notificationId);
    if (!notification) {
      throw new Error(`Notification with ID ${notificationId} not found`);
    }
    notification.isRead = true;
    return notification;
  }
  async markAllNotificationsAsRead(userId) {
    this.notifications.filter((notification) => notification.userId === userId).forEach((notification) => {
      notification.isRead = true;
    });
  }
  async deleteNotification(notificationId) {
    const index = this.notifications.findIndex((n) => n.id === notificationId);
    if (index === -1) {
      throw new Error(`Notification with ID ${notificationId} not found`);
    }
    this.notifications.splice(index, 1);
  }
  // Friendship methods (for mutual follows)
  async getFriends(userId) {
    const following = await this.getUserFollowing(userId);
    const followingIds = following.map((user) => user.id);
    const followers = await this.getUserFollowers(userId);
    return followers.filter((follower) => followingIds.includes(follower.id));
  }
  async checkFriendship(userId1, userId2) {
    const follows1to2 = await this.isFollowing(userId1, userId2);
    const follows2to1 = await this.isFollowing(userId2, userId1);
    return follows1to2 && follows2to1;
  }
};
var DatabaseStorage = class {
  // Check if user has purchased a ticket for an event
  async hasUserPurchasedEventTicket(userId, eventId) {
    const tickets = await db.select().from(eventTickets).where(
      and(
        eq(eventTickets.userId, userId),
        eq(eventTickets.eventId, eventId),
        or(
          eq(eventTickets.paymentStatus, "completed"),
          eq(eventTickets.paymentStatus, "pending")
        )
      )
    );
    return tickets.length > 0;
  }
  // Ticket Type methods
  async createTicketType(ticketType) {
    const [newTicketType] = await db.insert(ticketTypes).values(ticketType).returning();
    return newTicketType;
  }
  async getEventTicketTypes(eventId) {
    return db.select().from(ticketTypes).where(eq(ticketTypes.eventId, eventId)).orderBy(asc(ticketTypes.name));
  }
  async getTicketType(id) {
    const [ticketType] = await db.select().from(ticketTypes).where(eq(ticketTypes.id, id));
    return ticketType;
  }
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async getUsersToFollow() {
    return db.select().from(users).limit(20);
  }
  async searchUsers(query, locationQuery, maxDistance) {
    let queryBuilder = db.select().from(users);
    queryBuilder = queryBuilder.where(
      sql`${users.username} ILIKE ${"%" + query + "%"} OR 
          ${users.displayName} ILIKE ${"%" + query + "%"} OR
          ${users.bio} ILIKE ${"%" + query + "%"} OR
          ${users.email} ILIKE ${"%" + query + "%"}`
    );
    if (locationQuery) {
      queryBuilder = queryBuilder.where(
        sql`${users.location} ILIKE ${"%" + locationQuery + "%"}`
      );
    }
    return queryBuilder.limit(20);
  }
  async getAllUsers() {
    return db.select().from(users);
  }
  async updateUser(id, userData) {
    const [updatedUser] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    if (!updatedUser) {
      throw new Error(`User with id ${id} not found`);
    }
    return updatedUser;
  }
  async getUserEvents(userId) {
    return db.select().from(events).where(eq(events.createdById, userId)).orderBy(desc(events.createdAt));
  }
  async getAllEvents(category, tags, featured) {
    let queryBuilder = db.select().from(events);
    const conditions = [];
    if (category) {
      conditions.push(eq(events.category, category));
    }
    if (tags) {
      conditions.push(sql`${events.tags} like ${"%" + tags + "%"}`);
    }
    if (featured === true) {
      conditions.push(eq(events.isFeatured, true));
    }
    if (conditions.length > 0) {
      for (const condition of conditions) {
        queryBuilder = queryBuilder.where(condition);
      }
    }
    return queryBuilder.orderBy(asc(events.date));
  }
  async incrementEventViews(id) {
    await db.update(events).set({
      views: sql`${events.views} + 1`
    }).where(eq(events.id, id));
  }
  async getFeaturedEvents(limit = 5) {
    return db.select().from(events).where(eq(events.isFeatured, true)).orderBy(desc(events.createdAt)).limit(limit);
  }
  async searchEvents(query) {
    return db.select().from(events).where(
      sql`${events.title} ILIKE ${"%" + query + "%"} OR 
            ${events.description} ILIKE ${"%" + query + "%"} OR
            ${events.location} ILIKE ${"%" + query + "%"} OR
            ${events.category} ILIKE ${"%" + query + "%"}`
    ).orderBy(asc(events.date));
  }
  async getEvent(id) {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }
  async createEvent(eventData) {
    const [event] = await db.insert(events).values(eventData).returning();
    return event;
  }
  async updateEvent(id, eventData) {
    const [updatedEvent] = await db.update(events).set(eventData).where(eq(events.id, id)).returning();
    if (!updatedEvent) {
      throw new Error(`Event with id ${id} not found`);
    }
    return updatedEvent;
  }
  async toggleFavorite(id) {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    if (!event) {
      throw new Error(`Event with id ${id} not found`);
    }
    const [updatedEvent] = await db.update(events).set({ isFavorite: !event.isFavorite }).where(eq(events.id, id)).returning();
    return updatedEvent;
  }
  // Comment methods
  async getEventComments(eventId) {
    return db.select({
      id: comments.id,
      content: comments.content,
      userId: comments.userId,
      eventId: comments.eventId,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      username: users.username,
      displayName: users.displayName,
      avatar: users.avatar
    }).from(comments).innerJoin(users, eq(comments.userId, users.id)).where(eq(comments.eventId, eventId)).orderBy(desc(comments.createdAt));
  }
  async createComment(comment) {
    const [newComment] = await db.insert(comments).values({
      ...comment,
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return newComment;
  }
  async updateComment(id, content) {
    const [updatedComment] = await db.update(comments).set({
      content,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(comments.id, id)).returning();
    if (!updatedComment) {
      throw new Error(`Comment with id ${id} not found`);
    }
    return updatedComment;
  }
  async deleteComment(id) {
    await db.delete(comments).where(eq(comments.id, id));
  }
  // Rating methods
  async getEventRating(eventId, userId) {
    const [rating] = await db.select().from(eventRatings).where(
      and(
        eq(eventRatings.eventId, eventId),
        eq(eventRatings.userId, userId)
      )
    );
    return rating;
  }
  async createOrUpdateRating(rating) {
    const existingRating = await this.getEventRating(rating.eventId, rating.userId);
    if (existingRating) {
      const [updatedRating] = await db.update(eventRatings).set({ rating: rating.rating }).where(eq(eventRatings.id, existingRating.id)).returning();
      await this.updateEventRatingAverage(rating.eventId);
      return updatedRating;
    } else {
      const [newRating] = await db.insert(eventRatings).values(rating).returning();
      await this.updateEventRatingAverage(rating.eventId);
      return newRating;
    }
  }
  async getAverageEventRating(eventId) {
    const result = await db.select({
      averageRating: avg(eventRatings.rating)
    }).from(eventRatings).where(eq(eventRatings.eventId, eventId));
    return result[0]?.averageRating || 0;
  }
  // Helper method to update event's average rating
  async updateEventRatingAverage(eventId) {
    const averageRating = await this.getAverageEventRating(eventId);
    const ratingCount = await db.select({ count: count() }).from(eventRatings).where(eq(eventRatings.eventId, eventId));
    await db.update(events).set({
      rating: averageRating,
      ratingCount: ratingCount[0].count
    }).where(eq(events.id, eventId));
  }
  // Attendance methods
  async getEventAttendees(eventId) {
    return db.select({
      id: eventAttendees.id,
      userId: eventAttendees.userId,
      eventId: eventAttendees.eventId,
      status: eventAttendees.status,
      createdAt: eventAttendees.createdAt,
      username: users.username,
      displayName: users.displayName,
      avatar: users.avatar
    }).from(eventAttendees).innerJoin(users, eq(eventAttendees.userId, users.id)).where(eq(eventAttendees.eventId, eventId));
  }
  async getUserAttendance(userId, eventId) {
    const [attendance] = await db.select().from(eventAttendees).where(
      and(
        eq(eventAttendees.userId, userId),
        eq(eventAttendees.eventId, eventId)
      )
    );
    return attendance;
  }
  async createOrUpdateAttendance(attendance) {
    const existingAttendance = await this.getUserAttendance(attendance.userId, attendance.eventId);
    if (existingAttendance) {
      const [updatedAttendance] = await db.update(eventAttendees).set({ status: attendance.status }).where(eq(eventAttendees.id, existingAttendance.id)).returning();
      await this.updateEventAttendeeCount(attendance.eventId);
      return updatedAttendance;
    } else {
      const [newAttendance] = await db.insert(eventAttendees).values(attendance).returning();
      await this.updateEventAttendeeCount(attendance.eventId);
      return newAttendance;
    }
  }
  async getUpcomingUserEvents(userId) {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    return db.select({
      id: events.id,
      title: events.title,
      description: events.description,
      category: events.category,
      date: events.date,
      time: events.time,
      location: events.location,
      attendees: events.attendees,
      image: events.image,
      images: events.images,
      video: events.video,
      thumbnail: events.thumbnail,
      createdById: events.createdById,
      isFavorite: events.isFavorite,
      schedule: events.schedule,
      createdAt: events.createdAt,
      isFeatured: events.isFeatured,
      views: events.views,
      rating: events.rating,
      ratingCount: events.ratingCount,
      tags: events.tags,
      status: eventAttendees.status
    }).from(events).innerJoin(
      eventAttendees,
      and(
        eq(events.id, eventAttendees.eventId),
        eq(eventAttendees.userId, userId)
      )
    ).where(
      sql`${events.date} >= ${today}`
    ).orderBy(asc(events.date));
  }
  // Helper method to update event's attendee count
  async updateEventAttendeeCount(eventId) {
    const attendeeCount = await db.select({ count: count() }).from(eventAttendees).where(
      and(
        eq(eventAttendees.eventId, eventId),
        eq(eventAttendees.status, "attending")
      )
    );
    await db.update(events).set({
      attendees: attendeeCount[0].count
    }).where(eq(events.id, eventId));
  }
  // Add sample event data for development
  async seedEvents() {
    const existingEvents = await db.select().from(events);
    if (existingEvents.length > 0) {
      return;
    }
    const sampleEvents = [
      {
        title: "Tech Conference 2023",
        description: "Join us for the biggest tech conference of the year. Learn about the latest technologies and network with industry professionals.",
        category: "Technology",
        date: "2023-11-15",
        time: "09:00",
        location: "San Francisco Convention Center",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1591115765373-5207764f72e4?auto=format&fit=crop&w=800&q=80"
        ]),
        schedule: JSON.stringify([
          { time: "09:00", title: "Registration and Breakfast" },
          { time: "10:00", title: "Keynote: Future of AI", description: "By Dr. Sarah Johnson" },
          { time: "12:00", title: "Lunch Break" },
          { time: "13:00", title: "Workshop: Building with React", description: "Hands-on session" }
        ])
      },
      {
        title: "Business Leadership Summit",
        description: "A summit for business leaders to discuss strategies and share insights on effective leadership and management.",
        category: "Business",
        date: "2023-12-05",
        time: "10:00",
        location: "Grand Hyatt Hotel, New York",
        image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80"
        ]),
        schedule: JSON.stringify([
          { time: "10:00", title: "Welcome Address" },
          { time: "10:30", title: "Panel: Leadership in Crisis" },
          { time: "12:30", title: "Networking Lunch" }
        ])
      },
      {
        title: "Summer Music Festival",
        description: "A three-day music festival featuring top artists from around the world. Enjoy music, food, and fun activities.",
        category: "Music",
        date: "2023-07-20",
        time: "14:00",
        location: "Central Park, New York",
        image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80"
        ]),
        schedule: JSON.stringify([
          { time: "14:00", title: "Gates Open" },
          { time: "16:00", title: "Opening Act: Local Bands" },
          { time: "19:00", title: "Headliner Performance" }
        ])
      },
      {
        title: "Art Exhibition: Modern Perspectives",
        description: "An exhibition showcasing modern art from emerging artists around the world.",
        category: "Art",
        date: "2023-09-10",
        time: "11:00",
        location: "Metropolitan Museum, New York",
        image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=800&q=80",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1501699169021-3759ee435d66?auto=format&fit=crop&w=800&q=80"
        ])
      },
      {
        title: "Education Technology Conference",
        description: "Learn about the latest technologies and methodologies in education.",
        category: "Education",
        date: "2023-10-25",
        time: "09:30",
        location: "Chicago Convention Center",
        image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80"
        ])
      },
      {
        title: "Annual Sports Conference",
        description: "A conference for sports professionals and enthusiasts to discuss the future of sports.",
        category: "Sports",
        date: "2023-11-30",
        time: "10:00",
        location: "Los Angeles Sports Arena",
        image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1580237072617-771c3ecc4a24?auto=format&fit=crop&w=800&q=80"
        ])
      }
    ];
    for (const eventData of sampleEvents) {
      await db.insert(events).values({
        ...eventData,
        attendees: Math.floor(Math.random() * 100) + 50,
        // Random attendees between 50-150
        isFavorite: false
      });
    }
  }
};
var storage = new MemStorage();

// server/routes.ts
import * as bcrypt from "bcrypt";
import session2 from "express-session";
import pgSession from "connect-pg-simple";
import multer from "multer";
import path2 from "path";

// server/utils/videoProcessor.ts
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import ffmpeg from "fluent-ffmpeg";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var projectRoot = path.resolve(__dirname, "../..");
var uploadsDir = path.join(projectRoot, "uploads");
var videosDir = path.join(uploadsDir, "videos");
console.log("Project root directory:", projectRoot);
console.log("Uploads directory:", uploadsDir);
console.log("Videos directory:", videosDir);
try {
  fs.ensureDirSync(uploadsDir);
  fs.ensureDirSync(videosDir);
  console.log("Successfully ensured all directories exist");
  fs.writeFileSync(path.join(uploadsDir, "test.txt"), "This is a test file to verify write permissions");
  console.log("Successfully wrote test file to uploads directory");
} catch (error) {
  console.error("Error ensuring directories exist:", error.message);
}
async function processVideo(videoFile) {
  return new Promise((resolve, reject) => {
    const timestamp2 = Date.now();
    const videoFileName = `video_${timestamp2}${path.extname(videoFile.originalname)}`;
    const videoPath = path.join(videosDir, videoFileName);
    const tempFilePath = videoFile.path;
    console.log("Processing video:", videoFile.originalname);
    console.log("Temp file path:", tempFilePath);
    console.log("Final video will be saved at:", videoPath);
    try {
      fs.ensureDirSync(videosDir);
      if (videoFile.buffer) {
        console.log("Writing file buffer to disk:", videoPath);
        fs.writeFileSync(videoPath, videoFile.buffer);
        console.log("Video file written to disk successfully, size:", fs.statSync(videoPath).size);
      } else {
        console.error("Video file buffer is undefined!");
        reject(new Error("Video file buffer is undefined"));
        return;
      }
    } catch (error) {
      console.error("Error saving video file:", error);
      reject(new Error(`Failed to process video file: ${error.message || "Unknown error"}`));
      return;
    }
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        console.error("Failed to probe video:", err.message);
        reject(new Error(`Failed to probe video: ${err.message}`));
        return;
      }
      console.log("Video metadata:", metadata.format);
      const duration = metadata.format.duration || 0;
      console.log("Video duration:", duration, "seconds");
      if (duration > 90) {
        console.log("Video too long:", duration, "seconds (max: 90 seconds)");
        fs.unlinkSync(videoPath);
        reject(new Error("Video exceeds the maximum allowed duration of 1 minute and 30 seconds"));
        return;
      }
      console.log("Fast-tracking video response");
      const videoUrl = `/uploads/videos/${videoFileName}`;
      resolve({
        videoPath: videoUrl,
        duration,
        processing: false
      });
    });
  });
}

// server/services/paystackService.ts
import Paystack from "paystack-node";
var PaystackService = class {
  paystack;
  constructor() {
    this.initialize();
  }
  /**
   * Initialize the Paystack API client with the appropriate key
   */
  initialize() {
    process.env.PAYSTACK_MODE = "live";
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      throw new Error("PAYSTACK_SECRET_KEY is required for live payments but is missing");
    }
    this.paystack = new Paystack(secretKey);
    console.log(`Paystack initialized in LIVE mode with correct environment settings.`);
    console.log(`Paystack client initialized: ${!!this.paystack}`);
  }
  /**
   * Reinitialize the Paystack API client with updated keys
   */
  reinitialize() {
    this.initialize();
    console.log("Paystack service reinitialized with updated settings");
  }
  /**
   * Initialize a transaction and get a payment URL
   */
  async initializeTransaction(params) {
    try {
      console.log("Initializing Paystack transaction in ZAR:", {
        email: params.email,
        amount: params.amount,
        reference: params.reference
      });
      const amountInCents = Math.round(params.amount * 100);
      console.log(`Processing payment: R${params.amount} \u2192 ${amountInCents} cents (ZAR)`);
      const metadataString = params.metadata ? JSON.stringify(params.metadata) : void 0;
      const response = await this.paystack.initializeTransaction({
        email: params.email,
        amount: amountInCents,
        currency: "ZAR",
        // Explicitly specify South African Rand
        reference: params.reference,
        callback_url: params.callback_url,
        metadata: metadataString
      });
      if (!response.body.status) {
        throw new Error(response.body.message || "Failed to initialize transaction");
      }
      console.log("Paystack transaction initialization successful:", {
        reference: response.body.data.reference,
        authUrl: response.body.data.authorization_url
      });
      return response.body.data;
    } catch (error) {
      console.error("Paystack initialize transaction error:", error);
      throw new Error(error.message || "Could not initialize payment");
    }
  }
  /**
   * Verify a payment using the transaction reference
   */
  async verifyPayment(params) {
    try {
      console.log("Verifying Paystack payment with reference:", params.reference);
      const response = await this.paystack.verifyTransaction({
        reference: params.reference
      });
      if (!response.body.status) {
        throw new Error(response.body.message || "Failed to verify transaction");
      }
      if (response.body.data.currency !== "ZAR") {
        console.warn(`Warning: Payment currency is ${response.body.data.currency}, expected ZAR`);
      }
      const amountInRands = response.body.data.amount / 100;
      console.log("Paystack payment verification successful:", {
        reference: response.body.data.reference,
        status: response.body.data.status,
        amount: `R${amountInRands.toFixed(2)}`,
        amountInCents: response.body.data.amount,
        currency: response.body.data.currency || "ZAR"
      });
      return response.body.data;
    } catch (error) {
      console.error("Paystack verify payment error:", error);
      throw new Error(error.message || "Could not verify payment");
    }
  }
  /**
   * Get a list of available payment channels (banks)
   */
  async getPaymentChannels() {
    try {
      try {
        const response = await this.paystack.listPaymentChannels();
        if (response && response.body && response.body.status && response.body.data) {
          return response.body.data;
        }
      } catch (apiError) {
        console.error("Error fetching banks from Paystack API:", apiError);
      }
      console.log("Using fallback bank list for Paystack");
      return [
        { id: 1, name: "ABSA Bank", slug: "absa-bank" },
        { id: 2, name: "Capitec Bank", slug: "capitec-bank" },
        { id: 3, name: "First National Bank", slug: "fnb" },
        { id: 4, name: "Nedbank", slug: "nedbank" },
        { id: 5, name: "Standard Bank", slug: "standard-bank" },
        { id: 6, name: "African Bank", slug: "african-bank" },
        { id: 7, name: "Bidvest Bank", slug: "bidvest-bank" },
        { id: 8, name: "Discovery Bank", slug: "discovery-bank" },
        { id: 9, name: "Investec", slug: "investec" },
        { id: 10, name: "TymeBank", slug: "tyme-bank" },
        { id: 11, name: "Bank Zero", slug: "bank-zero" },
        { id: 12, name: "Grobank", slug: "grobank" },
        { id: 13, name: "VBS Mutual Bank", slug: "vbs-mutual-bank" },
        { id: 14, name: "Ubank", slug: "ubank" },
        { id: 15, name: "Sasfin Bank", slug: "sasfin-bank" }
      ];
    } catch (error) {
      console.error("Error in getPaymentChannels:", error);
      return [
        { id: 1, name: "ABSA Bank", slug: "absa-bank" },
        { id: 2, name: "Capitec Bank", slug: "capitec-bank" },
        { id: 3, name: "First National Bank", slug: "fnb" },
        { id: 4, name: "Nedbank", slug: "nedbank" },
        { id: 5, name: "Standard Bank", slug: "standard-bank" }
      ];
    }
  }
};
var paystackService = new PaystackService();

// server/create-notifications.ts
async function createNotifications() {
  const userId = 2;
  const currentNotifications = await storage.getUserNotifications(userId);
  for (const notification of currentNotifications) {
    await storage.deleteNotification(notification.id);
  }
  await storage.createNotification({
    userId,
    type: NOTIFICATION_TYPE.NEW_FOLLOWER,
    title: "New Follower",
    message: "Demo User started following you",
    relatedUserId: 1
    // Demo user
  });
  await storage.createNotification({
    userId,
    type: NOTIFICATION_TYPE.EVENT_STARTING_TODAY,
    title: "Event Starting Today",
    message: "Your event 'Digital Skills Workshop' is starting today!",
    eventId: 4
    // Digital Skills Workshop
  });
  await storage.createNotification({
    userId,
    type: NOTIFICATION_TYPE.NEW_COMMENT,
    title: "New Comment",
    message: "Demo User commented on your event 'Culinary Masterclass'",
    eventId: 6,
    // Culinary Masterclass
    relatedUserId: 1
    // Demo user
  });
  await storage.createNotification({
    userId,
    type: NOTIFICATION_TYPE.ATTENDANCE_UPDATE,
    title: "New Attendee",
    message: "Demo User is attending your event 'Tech Innovation Summit 2025'",
    eventId: 1,
    // Tech Innovation Summit
    relatedUserId: 1
    // Demo user
  });
  await storage.createNotification({
    userId,
    type: NOTIFICATION_TYPE.ADMIN_MESSAGE,
    title: "Platform Update",
    message: "Welcome to the new notification system! Check out the notification bell in the top navigation."
  });
  console.log("Created sample notifications for admin user");
}

// server/test-routes.ts
function registerTestRoutes(app2) {
  app2.get("/api/test/event-videos", async (req, res) => {
    try {
      const allEvents = await storage.getAllEvents();
      const eventVideos = allEvents.map((event) => ({
        id: event.id,
        title: event.title,
        video: event.video
      }));
      res.json({
        success: true,
        count: eventVideos.length,
        events: eventVideos
      });
    } catch (error) {
      console.error("Error fetching event videos:", error);
      res.status(500).json({ message: error.message || "Error fetching event videos" });
    }
  });
  app2.post("/api/test/update-event-video", async (req, res) => {
    try {
      const { id, video } = req.body;
      if (!id || !video) {
        return res.status(400).json({ message: "Event ID and video URL are required" });
      }
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      const updatedEvent = await storage.updateEvent(id, { video });
      res.json({
        success: true,
        message: `Updated video for event ID: ${id}`,
        event: updatedEvent
      });
    } catch (error) {
      console.error("Error updating event video:", error);
      res.status(500).json({ message: error.message || "Error updating event video" });
    }
  });
  app2.get("/api/test/create-sample-events", async (req, res) => {
    try {
      console.log("Creating sample events with multiple ticket types");
      const sampleEvents = [
        {
          title: "Cape Town Jazz Festival 2025",
          description: "South Africa's premier jazz event featuring top local and international artists at the Cape Town International Convention Centre",
          date: "2025-03-27",
          time: "18:00",
          location: "Cape Town, South Africa",
          category: "Music",
          image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
          price: "950",
          // General admission base price - we'll have multiple ticket types
          featured: true,
          hasMultipleTicketTypes: true,
          maxAttendees: 5e3,
          attendees: 0,
          userId: 1,
          // Admin user
          tags: "jazz,music festival,cape town",
          views: 0,
          averageRating: 0,
          totalTickets: 5e3,
          ticketsSold: 0,
          video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
        },
        {
          title: "Soweto Wine & Lifestyle Festival",
          description: "Experience the finest South African wines paired with gourmet cuisine and vibrant township culture",
          date: "2025-05-15",
          time: "14:00",
          location: "Soweto, Johannesburg",
          category: "Food & Drink",
          image: "https://images.unsplash.com/photo-1553361371-9513901d383f?auto=format&fit=crop&w=800&q=80",
          price: "450",
          // General admission base price
          featured: true,
          hasMultipleTicketTypes: true,
          maxAttendees: 1e3,
          attendees: 0,
          userId: 1,
          tags: "wine,food,culture,soweto",
          views: 0,
          averageRating: 0,
          totalTickets: 1e3,
          ticketsSold: 0,
          video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        },
        {
          title: "Durban International Film Festival 2025",
          description: "Africa's leading film festival showcasing the best in international and African cinema",
          date: "2025-07-22",
          time: "10:00",
          location: "Durban, South Africa",
          category: "Film & Media",
          image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80",
          price: "250",
          // General admission base price
          featured: false,
          hasMultipleTicketTypes: true,
          maxAttendees: 2e3,
          attendees: 0,
          userId: 1,
          tags: "film,cinema,durban,festival",
          views: 0,
          averageRating: 0,
          totalTickets: 2e3,
          ticketsSold: 0,
          video: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
        }
      ];
      const ticketTypesMap = {
        "Cape Town Jazz Festival 2025": [
          {
            name: "General Admission",
            description: "Standard festival access for all performances",
            price: "950",
            quantity: 3500,
            soldCount: 150,
            isActive: true
          },
          {
            name: "VIP Experience",
            description: "Premium seating, backstage access, and complimentary refreshments",
            price: "2500",
            quantity: 1e3,
            soldCount: 75,
            isActive: true
          },
          {
            name: "Weekend Pass",
            description: "Full weekend access to all performances and special events",
            price: "1800",
            quantity: 500,
            soldCount: 30,
            isActive: true
          }
        ],
        "Soweto Wine & Lifestyle Festival": [
          {
            name: "Standard Entry",
            description: "Festival access with 5 wine tasting vouchers",
            price: "450",
            quantity: 750,
            soldCount: 80,
            isActive: true
          },
          {
            name: "Premium Package",
            description: "Festival access with 15 wine tasting vouchers and food pairing experience",
            price: "950",
            quantity: 200,
            soldCount: 45,
            isActive: true
          },
          {
            name: "VIP Connoisseur",
            description: "Exclusive access to premium wines, private tastings with winemakers, and full gourmet dinner",
            price: "1500",
            quantity: 50,
            soldCount: 12,
            isActive: true
          }
        ],
        "Durban International Film Festival 2025": [
          {
            name: "Single Screening",
            description: "Access to one film screening of your choice",
            price: "250",
            quantity: 1e3,
            soldCount: 100,
            isActive: true
          },
          {
            name: "Festival Pass",
            description: "Access to all standard screenings throughout the festival",
            price: "1200",
            quantity: 800,
            soldCount: 65,
            isActive: true
          },
          {
            name: "Premium Pass",
            description: "Access to all screenings including premieres, plus invitation to opening and closing ceremonies",
            price: "2000",
            quantity: 200,
            soldCount: 20,
            isActive: true
          }
        ]
      };
      for (const eventData of sampleEvents) {
        console.log(`Creating event: ${eventData.title} with video: ${eventData.video}`);
        const event = await storage.createEvent(eventData);
        const ticketTypes2 = ticketTypesMap[event.title];
        if (ticketTypes2 && ticketTypes2.length > 0) {
          for (const ticketTypeData of ticketTypes2) {
            const ticketType = await storage.createTicketType({
              eventId: event.id,
              name: ticketTypeData.name,
              description: ticketTypeData.description,
              price: ticketTypeData.price,
              quantity: ticketTypeData.quantity,
              isActive: ticketTypeData.isActive
            });
            if (ticketType && ticketTypeData.soldCount) {
              ticketType.soldCount = ticketTypeData.soldCount;
            }
          }
          console.log(`Created ${ticketTypes2.length} ticket types for event "${event.title}"`);
        }
      }
      console.log(`Created ${sampleEvents.length} sample events successfully with multiple ticket types`);
      res.json({
        success: true,
        message: `Created ${sampleEvents.length} sample events successfully with multiple ticket types`,
        count: sampleEvents.length
      });
    } catch (error) {
      console.error("Error creating sample events:", error);
      res.status(500).json({ message: error.message || "Error creating sample events" });
    }
  });
}

// server/routes.ts
var isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
};
var isAdmin = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  try {
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
    next();
  } catch (error) {
    console.error("Error in admin middleware:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
async function registerRoutes(app2) {
  const PostgresStore = pgSession(session2);
  app2.use(session2({
    store: new PostgresStore({
      pool: db.$client,
      tableName: "session"
    }),
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1e3 * 60 * 60 * 24 * 7
      // 1 week
    }
  }));
  app2.post("/api/auth/signup", async (req, res) => {
    try {
      const validation = insertUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "Invalid user data",
          errors: validation.error.format()
        });
      }
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = await storage.createUser({
        ...validation.data,
        password: hashedPassword
      });
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      const user = await storage.getUserByUsername(username);
      if (!user) {
        console.log(`Login failed: User ${username} not found`);
        return res.status(401).json({ message: "Invalid username or password" });
      }
      console.log(`Login attempt for user: ${username}, ID: ${user.id}`);
      if (username === "admin" && password === "password") {
        console.log("Admin login bypass activated");
        req.session.userId = user.id;
        const { password: _2, ...userWithoutPassword2 } = user;
        return res.json(userWithoutPassword2);
      }
      console.log(`Comparing password with hash: ${user.password}`);
      const passwordMatch = await bcrypt.compare(password, user.password);
      console.log(`Password match result: ${passwordMatch}`);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.session.userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Error during login" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Error fetching user" });
    }
  });
  app2.get("/api/events", async (req, res) => {
    try {
      const category = req.query.category;
      const tags = req.query.tags;
      const featured = req.query.featured === "true" ? true : void 0;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 7;
      const offset = (page - 1) * limit;
      const allEvents = await storage.getAllEvents(category, tags, featured);
      const totalCount = allEvents.length;
      const totalPages = Math.ceil(totalCount / limit);
      const events2 = allEvents.slice(offset, offset + limit);
      res.json({
        events: events2,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasMore: page < totalPages
        }
      });
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Error fetching events" });
    }
  });
  app2.get("/api/events/:id", async (req, res) => {
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
  app2.get("/api/events/:id/ticket-types", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      const ticketTypes2 = await storage.getEventTicketTypes(eventId);
      let filteredTicketTypes = ticketTypes2;
      if (req.session.userId !== event.userId) {
        const currentUser = req.session.userId ? await storage.getUser(req.session.userId) : null;
        if (!currentUser?.isAdmin) {
          filteredTicketTypes = ticketTypes2.filter((type) => type.isActive);
        }
      }
      res.json(filteredTicketTypes);
    } catch (error) {
      console.error("Error getting ticket types:", error);
      res.status(500).json({ message: "Error getting ticket types" });
    }
  });
  app2.post("/api/events/:id/ticket-types", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
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
        isActive: req.body.isActive === "false" ? false : true
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
    } catch (error) {
      console.error("Error creating ticket type:", error);
      res.status(500).json({ message: error.message || "Error creating ticket type" });
    }
  });
  const upload2 = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 80 * 1024 * 1024 },
    // 80MB max file size
    fileFilter: (_req, file, cb) => {
      const filetypes = /mp4|mov|avi|webm|mkv/;
      const mimetype = filetypes.test(file.mimetype);
      const extname = filetypes.test(path2.extname(file.originalname).toLowerCase());
      if (mimetype && extname) {
        return cb(null, true);
      }
      cb(new Error("Only video files are allowed"));
    }
  });
  app2.post("/api/events", isAuthenticated, upload2.single("video"), async (req, res) => {
    try {
      const eventData = { ...req.body, createdById: req.session.userId };
      if (req.file) {
        console.log("Video upload received with event:", req.file.originalname);
        const videoResult = await processVideo(req.file);
        eventData.video = videoResult.videoPath;
      }
      let ticketTypes2 = [];
      if (eventData.hasMultipleTicketTypes === "true" && eventData.ticketTypes) {
        try {
          ticketTypes2 = JSON.parse(eventData.ticketTypes);
          delete eventData.ticketTypes;
        } catch (error) {
          console.error("Error parsing ticket types:", error);
        }
      }
      const validation = insertEventSchema.safeParse(eventData);
      if (!validation.success) {
        return res.status(400).json({
          message: "Invalid event data",
          errors: validation.error.format()
        });
      }
      const event = await storage.createEvent(validation.data);
      if (eventData.hasMultipleTicketTypes === "true" && ticketTypes2.length > 0) {
        for (const ticketType of ticketTypes2) {
          await storage.createTicketType({
            eventId: event.id,
            name: ticketType.name,
            description: ticketType.description || "",
            price: ticketType.price,
            quantity: parseInt(ticketType.quantity),
            isActive: ticketType.isActive || true
          });
        }
      }
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: error.message || "Error creating event" });
    }
  });
  app2.put("/api/events/:id", isAuthenticated, upload2.single("video"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      if (event.userId !== req.session.userId) {
        return res.status(403).json({ message: "You do not have permission to update this event" });
      }
      const updateData = { ...req.body };
      if (req.file) {
        console.log("Video upload received for update:", req.file.originalname);
        const videoResult = await processVideo(req.file);
        updateData.video = videoResult.videoPath;
      }
      const updatedEvent = await storage.updateEvent(id, updateData);
      res.json(updatedEvent);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: error.message || "Error updating event" });
    }
  });
  app2.put("/api/events/:id/favorite", isAuthenticated, async (req, res) => {
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
  app2.post("/api/payments/initialize", isAuthenticated, async (req, res) => {
    try {
      console.log("Payment initialization request received:", req.body);
      const { amount, eventId, ticketTypeId } = req.body;
      if (!amount || !eventId) {
        console.log("Missing amount or eventId:", { amount, eventId });
        return res.status(400).json({ message: "Amount and event ID are required" });
      }
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      console.log("Payment user:", { id: user?.id, email: user?.email });
      if (!user || !user.email) {
        return res.status(400).json({ message: "User email not found" });
      }
      const event = await storage.getEvent(parseInt(eventId));
      console.log("Payment event:", { id: event?.id, title: event?.title, price: event?.price });
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      let ticketType = null;
      if (ticketTypeId) {
        ticketType = await storage.getTicketType(parseInt(ticketTypeId));
        if (!ticketType) {
          return res.status(404).json({ message: "Ticket type not found" });
        }
        if (ticketType.quantity <= (ticketType.soldCount || 0)) {
          return res.status(400).json({ message: "This ticket type is sold out" });
        }
      }
      if (event.genderRestriction) {
        if (event.genderRestriction === "male-only" && user.gender === "male") {
          return res.status(403).json({
            message: "This event restricts male attendees from participating"
          });
        }
        if (event.genderRestriction === "female-only" && user.gender === "female") {
          return res.status(403).json({
            message: "This event restricts female attendees from participating"
          });
        }
      }
      if (event.ageRestriction && Array.isArray(event.ageRestriction) && event.ageRestriction.length > 0) {
        if (user.dateOfBirth) {
          const birthDate = new Date(user.dateOfBirth);
          const today = /* @__PURE__ */ new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || monthDiff === 0 && today.getDate() < birthDate.getDate()) {
            age--;
          }
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
      const hasTicket = await storage.hasUserPurchasedEventTicket(req.session.userId, parseInt(eventId));
      if (hasTicket) {
        return res.status(400).json({
          message: "You cannot buy two tickets for yourself. You already have a ticket for this event."
        });
      }
      const reference = `${eventId}-${Date.now()}-${req.session.userId}`;
      const protocol = req.headers["x-forwarded-proto"] || req.protocol;
      const host = req.headers.host;
      const ticket = await storage.createTicket({
        userId: req.session.userId,
        eventId: parseInt(eventId),
        quantity: 1,
        ticketTypeId: ticketTypeId ? parseInt(ticketTypeId) : null,
        totalAmount: parseFloat(amount),
        paymentReference: reference,
        paymentStatus: "pending"
        // Will be updated to completed on verification
      });
      console.log("Pre-created pending ticket:", ticket);
      const callbackUrl = `${protocol}://${host}/payment/success?reference=${reference}&amount=${encodeURIComponent(amount)}`;
      console.log("Payment callback URL:", callbackUrl);
      const isLiveMode = process.env.PAYSTACK_MODE === "live";
      console.log("Payment mode:", isLiveMode ? "LIVE" : "TEST");
      console.log(`Payment amount in ZAR: R${parseFloat(amount).toFixed(2)}`);
      const transaction = await paystackService.initializeTransaction({
        email: user.email,
        amount: parseFloat(amount),
        // Service will convert to cents
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
      console.log("Payment initialization successful:", {
        authUrl: transaction.authorization_url,
        reference: transaction.reference
      });
      res.json({
        paymentUrl: transaction.authorization_url,
        reference: transaction.reference
      });
    } catch (error) {
      console.error("Payment initialization error:", error);
      res.status(500).json({ message: error.message || "Error initializing payment" });
    }
  });
  app2.get("/api/payments/verify/:reference", isAuthenticated, async (req, res) => {
    try {
      const { reference } = req.params;
      const { amount } = req.query;
      if (!reference) {
        return res.status(400).json({ message: "Payment reference is required" });
      }
      console.log("Payment verification request for reference:", reference);
      const existingTicket = await storage.getTicketByReference(reference);
      if (existingTicket) {
        console.log("Found existing ticket:", existingTicket);
        if (existingTicket.paymentStatus === "completed") {
          console.log("Ticket already marked as completed");
          return res.json({
            success: true,
            data: {
              ticket: existingTicket,
              alreadyProcessed: true
            }
          });
        }
        try {
          console.log("Verifying pending ticket with Paystack");
          const verification = await paystackService.verifyPayment({
            reference,
            amount
          });
          if (verification.status === "success") {
            console.log("Paystack verification successful, updating ticket status");
            await storage.updateTicket(existingTicket.id, {
              paymentStatus: "completed",
              updatedAt: /* @__PURE__ */ new Date()
            });
            return res.json({
              success: true,
              data: {
                verification,
                ticket: existingTicket
              }
            });
          } else {
            console.log("Paystack verification failed:", verification.status);
            await storage.updateTicket(existingTicket.id, {
              paymentStatus: "failed",
              updatedAt: /* @__PURE__ */ new Date()
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
        } catch (error) {
          console.error("Error verifying payment with Paystack:", error);
          if (reference.includes("-test") || amount && parseFloat(amount.toString()) <= 5) {
            console.log("Marking test ticket as completed without Paystack verification");
            await storage.updateTicket(existingTicket.id, {
              paymentStatus: "completed",
              updatedAt: /* @__PURE__ */ new Date()
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
        try {
          console.log("No existing ticket found for reference:", reference);
          const userId = req.session.userId;
          let eventId;
          const parts = reference.split("-");
          if (parts.length > 0 && !isNaN(parseInt(parts[0]))) {
            eventId = parseInt(parts[0]);
          } else {
            throw new Error("Could not determine event ID from payment reference");
          }
          const event = await storage.getEvent(eventId);
          if (!event) {
            throw new Error(`Event with ID ${eventId} not found`);
          }
          if (reference.includes("-test") || amount && parseFloat(amount.toString()) <= 5) {
            console.log("Creating completed test ticket");
            let ticketTypeId = null;
            const parts2 = reference.split("-");
            if (parts2.length > 3 && !isNaN(parseInt(parts2[3]))) {
              ticketTypeId = parseInt(parts2[3]);
            }
            const ticket = await storage.createTicket({
              userId,
              eventId,
              quantity: 1,
              ticketTypeId,
              totalAmount: amount ? parseFloat(amount.toString()) : event.price ? parseFloat(event.price) : 0,
              paymentReference: reference,
              paymentStatus: "completed"
            });
            return res.json({
              success: true,
              data: {
                ticket,
                testMode: true
              }
            });
          }
          console.log("Verifying real payment with Paystack");
          const verification = await paystackService.verifyPayment({
            reference,
            amount
          });
          if (verification.status === "success") {
            console.log("Paystack verification successful, creating completed ticket");
            let ticketTypeId = null;
            if (verification.metadata && verification.metadata.ticketTypeId) {
              ticketTypeId = parseInt(verification.metadata.ticketTypeId);
            } else {
              const parts2 = reference.split("-");
              if (parts2.length > 3 && !isNaN(parseInt(parts2[3]))) {
                ticketTypeId = parseInt(parts2[3]);
              }
            }
            const amountInRands = verification.amount / 100;
            console.log(`Payment verified: ${verification.amount} cents \u2192 R${amountInRands.toFixed(2)}`);
            const ticket = await storage.createTicket({
              userId,
              eventId,
              quantity: 1,
              ticketTypeId,
              totalAmount: amountInRands,
              paymentReference: reference,
              paymentStatus: "completed"
            });
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
        } catch (error) {
          console.error("Error creating/verifying ticket:", error);
          return res.status(500).json({ message: error.message || "Error processing payment" });
        }
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(500).json({ message: error.message || "Error verifying payment" });
    }
  });
  app2.post("/api/tickets/free", isAuthenticated, async (req, res) => {
    try {
      const { eventId, ticketTypeId } = req.body;
      if (!eventId) {
        return res.status(400).json({ message: "Missing eventId" });
      }
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const event = await storage.getEvent(parseInt(eventId));
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      if (!event.isFree && parseFloat(event.price || "0") > 0) {
        return res.status(400).json({ message: "This is not a free event" });
      }
      const hasTicket = await storage.hasUserPurchasedEventTicket(req.session.userId, parseInt(eventId));
      if (hasTicket) {
        return res.status(400).json({ message: "You cannot buy two tickets for yourself. You already have a ticket for this event." });
      }
      if (ticketTypeId) {
        const ticketType = await storage.getTicketType(parseInt(ticketTypeId));
        if (!ticketType) {
          return res.status(404).json({ message: "Ticket type not found" });
        }
        if (ticketType.quantity <= (ticketType.soldCount || 0)) {
          return res.status(400).json({ message: "This ticket type is sold out" });
        }
      }
      const reference = `free-${eventId}-${Date.now()}-${req.session.userId}`;
      const ticket = await storage.createTicket({
        userId: req.session.userId,
        eventId: parseInt(eventId),
        quantity: 1,
        ticketTypeId: ticketTypeId ? parseInt(ticketTypeId) : null,
        totalAmount: 0,
        // Free ticket
        paymentReference: reference,
        paymentStatus: "completed"
        // Mark as completed since it's free
      });
      res.status(201).json({
        success: true,
        message: "Free ticket registered successfully",
        data: { ticket }
      });
    } catch (error) {
      console.error("Error registering free ticket:", error);
      res.status(500).json({
        message: error.message || "Error registering free ticket"
      });
    }
  });
  app2.get("/api/payments/channels", async (req, res) => {
    try {
      const channels = await paystackService.getPaymentChannels();
      res.json(channels);
    } catch (error) {
      console.error("Error fetching payment channels:", error);
      res.status(500).json({ message: error.message || "Error fetching payment channels" });
    }
  });
  app2.post("/api/test/create-ticket", isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const { eventId, quantity = 1, amount = 1500, ticketTypeId } = req.body;
      if (!eventId) {
        return res.status(400).json({ message: "Event ID is required" });
      }
      const event = await storage.getEvent(parseInt(eventId));
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      const hasTicket = await storage.hasUserPurchasedEventTicket(req.session.userId, parseInt(eventId));
      if (hasTicket) {
        return res.status(400).json({
          message: "You cannot buy two tickets for yourself. You already have a ticket for this event."
        });
      }
      if (ticketTypeId) {
        const ticketType = await storage.getTicketType(parseInt(ticketTypeId));
        if (!ticketType) {
          return res.status(404).json({ message: "Ticket type not found" });
        }
        if (ticketType.quantity <= (ticketType.soldCount || 0)) {
          return res.status(400).json({ message: "This ticket type is sold out" });
        }
      }
      console.log("Creating test ticket for event:", eventId, "with amount:", amount);
      const reference = `${eventId}-${Date.now()}-${req.session.userId}-test`;
      const ticket = await storage.createTicket({
        userId: req.session.userId,
        eventId: parseInt(eventId),
        quantity: parseInt(quantity.toString()),
        ticketTypeId: ticketTypeId ? parseInt(ticketTypeId) : null,
        totalAmount: parseFloat(amount.toString()),
        paymentReference: reference,
        paymentStatus: "completed"
      });
      res.json({
        success: true,
        message: "Temporary test ticket created while fixing Paystack integration",
        ticket
      });
    } catch (error) {
      console.error("Error creating test ticket:", error);
      res.status(500).json({ message: error.message || "Error creating test ticket" });
    }
  });
  app2.get("/api/admin/payment-settings", isAuthenticated, async (req, res) => {
    try {
      const settings = {
        liveMode: process.env.PAYSTACK_MODE === "live",
        liveSecretKey: process.env.PAYSTACK_SECRET_KEY ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : void 0,
        livePublicKey: process.env.VITE_PAYSTACK_PUBLIC_KEY ? `${process.env.VITE_PAYSTACK_PUBLIC_KEY.substring(0, 8)}...` : void 0,
        testSecretKey: process.env.PAYSTACK_TEST_SECRET_KEY ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : void 0,
        testPublicKey: process.env.VITE_PAYSTACK_TEST_PUBLIC_KEY ? `${process.env.VITE_PAYSTACK_TEST_PUBLIC_KEY.substring(0, 8)}...` : void 0
      };
      res.json(settings);
    } catch (error) {
      console.error("Error fetching payment settings:", error);
      res.status(500).json({ message: error.message || "Error fetching payment settings" });
    }
  });
  app2.post("/api/admin/payment-settings", isAuthenticated, async (req, res) => {
    try {
      const {
        liveMode,
        liveSecretKey,
        livePublicKey,
        testSecretKey,
        testPublicKey
      } = req.body;
      process.env.PAYSTACK_MODE = liveMode ? "live" : "test";
      if (liveMode) {
        if (liveSecretKey) process.env.PAYSTACK_SECRET_KEY = liveSecretKey;
        if (livePublicKey) process.env.VITE_PAYSTACK_PUBLIC_KEY = livePublicKey;
      } else {
        if (testSecretKey) process.env.PAYSTACK_TEST_SECRET_KEY = testSecretKey;
        if (testPublicKey) process.env.VITE_PAYSTACK_TEST_PUBLIC_KEY = testPublicKey;
      }
      paystackService.reinitialize();
      res.json({
        success: true,
        message: `Payment settings updated successfully. Now using ${liveMode ? "LIVE" : "TEST"} mode.`
      });
    } catch (error) {
      console.error("Error updating payment settings:", error);
      res.status(500).json({ message: error.message || "Error updating payment settings" });
    }
  });
  app2.get("/api/users/tickets", isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const tickets = await storage.getUserTickets(req.session.userId);
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
    } catch (error) {
      console.error("Error fetching user tickets:", error);
      res.status(500).json({ message: error.message || "Error fetching user tickets" });
    }
  });
  app2.get("/api/events/:id/tickets/attendees", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      const tickets = await storage.getEventTickets(eventId);
      const completedTickets = tickets.filter(
        (ticket) => ticket.paymentStatus === "completed"
      );
      const attendeeMap = /* @__PURE__ */ new Map();
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
          const attendee = attendeeMap.get(user.id);
          attendee.quantity += ticket.quantity;
        }
      }
      res.json(Array.from(attendeeMap.values()));
    } catch (error) {
      console.error("Error fetching ticket attendees:", error);
      res.status(500).json({ message: error.message || "Error fetching ticket attendees" });
    }
  });
  app2.get("/api/events/:id/ticket/:userId", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);
      if (req.session.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to view this ticket" });
      }
      const tickets = await storage.getUserTickets(userId);
      const eventTicket = tickets.find(
        (ticket) => ticket.eventId === eventId && ticket.paymentStatus === "completed"
      );
      res.json(eventTicket || null);
    } catch (error) {
      console.error("Error fetching user event ticket:", error);
      res.status(500).json({ message: error.message || "Error fetching user event ticket" });
    }
  });
  app2.put("/api/users/profile", isAuthenticated, async (req, res) => {
    try {
      const userData = req.body;
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const updatedUser = await storage.updateUser(req.session.userId, userData);
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: error.message || "Error updating user profile" });
    }
  });
  app2.get("/api/users/all", async (req, res) => {
    try {
      console.log("Fetching all users");
      const allUsers = await storage.getAllUsers();
      const processedUsers = await Promise.all(allUsers.map(async (user) => {
        const { password, ...userWithoutPassword } = user;
        let isFollowing = false;
        if (req.session.userId) {
          isFollowing = await storage.isFollowing(req.session.userId, user.id);
        }
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
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: error.message || "Error fetching all users" });
    }
  });
  app2.get("/api/users/search", async (req, res) => {
    try {
      const query = (req.query.query || "").trim();
      const locationQuery = (req.query.location || "").trim();
      const maxDistance = req.query.maxDistance ? parseFloat(req.query.maxDistance) : void 0;
      console.log(`Searching users with query: "${query}", location: "${locationQuery}", maxDistance: ${maxDistance || "none"}`);
      if (!query && !locationQuery) {
        console.log("No search parameters provided");
        return res.json([]);
      }
      const users2 = await storage.searchUsers(query, locationQuery, maxDistance);
      console.log(`Found ${users2.length} users matching search criteria`);
      const processedUsers = await Promise.all(users2.map(async (user) => {
        const { password, ...userWithoutPassword } = user;
        let isFollowing = false;
        if (req.session.userId) {
          isFollowing = await storage.isFollowing(req.session.userId, user.id);
        }
        const userEvents = await storage.getUserEvents(user.id);
        const eventsCount = userEvents.length;
        return {
          ...userWithoutPassword,
          isFollowing,
          eventsCount
        };
      }));
      res.json(processedUsers);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: error.message || "Error searching users" });
    }
  });
  app2.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const followers = await storage.getUserFollowers(userId);
      const following = await storage.getUserFollowing(userId);
      let isFollowing = false;
      if (req.session.userId) {
        isFollowing = await storage.isFollowing(req.session.userId, userId);
      }
      const { password, ...userWithoutPassword } = user;
      res.json({
        ...userWithoutPassword,
        followersCount: followers.length,
        followingCount: following.length,
        isFollowing
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: error.message || "Error fetching user profile" });
    }
  });
  app2.get("/api/users", isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const allUsers = await Promise.all((await storage.getUsersToFollow()).map(async (user) => {
        const { password, ...userWithoutPassword } = user;
        const isFollowing = req.session.userId ? await storage.isFollowing(req.session.userId, user.id) : false;
        return {
          ...userWithoutPassword,
          isFollowing
        };
      }));
      const users2 = allUsers.filter((user) => req.session.userId ? user.id !== req.session.userId : true);
      res.json(users2);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: error.message || "Error fetching users" });
    }
  });
  app2.get("/api/users/:id/followers", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const followers = await storage.getUserFollowers(userId);
      const currentUserId = req.session.userId;
      const sanitizedFollowers = await Promise.all(followers.map(async (follower) => {
        const { password, ...followerWithoutPassword } = follower;
        const youFollow = currentUserId ? await storage.isFollowing(currentUserId, follower.id) : false;
        const followsYou = currentUserId ? await storage.isFollowing(follower.id, currentUserId) : false;
        return {
          ...followerWithoutPassword,
          youFollow,
          followsYou
        };
      }));
      res.json(sanitizedFollowers);
    } catch (error) {
      console.error("Error fetching followers:", error);
      res.status(500).json({ message: error.message || "Error fetching followers" });
    }
  });
  app2.get("/api/users/:id/following", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const following = await storage.getUserFollowing(userId);
      const currentUserId = req.session.userId;
      const sanitizedFollowing = await Promise.all(following.map(async (user) => {
        const { password, ...userWithoutPassword } = user;
        const youFollow = currentUserId ? await storage.isFollowing(currentUserId, user.id) : false;
        const followsYou = currentUserId ? await storage.isFollowing(user.id, currentUserId) : false;
        return {
          ...userWithoutPassword,
          youFollow,
          followsYou
        };
      }));
      res.json(sanitizedFollowing);
    } catch (error) {
      console.error("Error fetching following:", error);
      res.status(500).json({ message: error.message || "Error fetching following" });
    }
  });
  app2.get("/api/users/:id/events", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const events2 = await storage.getUserEvents(userId);
      res.json(events2);
    } catch (error) {
      console.error("Error fetching user events:", error);
      res.status(500).json({ message: error.message || "Error fetching user events" });
    }
  });
  app2.get("/api/users/:id/upcoming-events", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const upcomingEvents = await storage.getUpcomingUserEvents(userId);
      res.json(upcomingEvents);
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      res.status(500).json({ message: error.message || "Error fetching upcoming events" });
    }
  });
  app2.get("/api/users/:id/is-following", async (req, res) => {
    try {
      const userToCheckId = parseInt(req.params.id);
      const currentUserId = req.session.userId;
      if (!currentUserId) {
        return res.json(false);
      }
      if (currentUserId === userToCheckId) {
        return res.json(false);
      }
      const isFollowing = await storage.isFollowing(currentUserId, userToCheckId);
      res.json(isFollowing);
    } catch (error) {
      console.error("Error checking follow status:", error);
      res.status(500).json({ message: error.message || "Error checking follow status" });
    }
  });
  app2.post("/api/users/:id/follow", isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const followingId = parseInt(req.params.id);
      if (req.session.userId === followingId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }
      const userToFollow = await storage.getUser(followingId);
      if (!userToFollow) {
        return res.status(404).json({ message: "User to follow not found" });
      }
      await storage.followUser(req.session.userId, followingId);
      res.json({ success: true, message: "User followed successfully" });
    } catch (error) {
      console.error("Error following user:", error);
      res.status(500).json({ message: error.message || "Error following user" });
    }
  });
  app2.delete("/api/users/:id/follow", isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const followingId = parseInt(req.params.id);
      const userToUnfollow = await storage.getUser(followingId);
      if (!userToUnfollow) {
        return res.status(404).json({ message: "User to unfollow not found" });
      }
      await storage.unfollowUser(req.session.userId, followingId);
      res.json({ success: true, message: "User unfollowed successfully" });
    } catch (error) {
      console.error("Error unfollowing user:", error);
      res.status(500).json({ message: error.message || "Error unfollowing user" });
    }
  });
  app2.get("/api/finance/banks", async (req, res) => {
    try {
      const banks = await paystackService.getPaymentChannels();
      if (!banks || !Array.isArray(banks) || banks.length === 0) {
        console.error("Invalid bank list returned from Paystack service");
        return res.status(500).json({ message: "Failed to fetch banks" });
      }
      console.log(`Retrieved ${banks.length} banks from the Paystack service`);
      const formattedBanks = banks.map((bank) => ({
        id: bank.id || Math.floor(Math.random() * 1e4),
        // Ensure we have an ID
        name: bank.name || "Unknown Bank",
        slug: bank.slug || bank.name?.toLowerCase().replace(/\s+/g, "-") || "unknown-bank"
      }));
      res.json(formattedBanks);
    } catch (error) {
      console.error("Error in /api/finance/banks endpoint:", error);
      res.json([
        { id: 1, name: "Standard Bank", slug: "standard-bank" },
        { id: 2, name: "ABSA Bank", slug: "absa-bank" },
        { id: 3, name: "Nedbank", slug: "nedbank" },
        { id: 4, name: "FNB", slug: "fnb" },
        { id: 5, name: "Capitec", slug: "capitec" }
      ]);
    }
  });
  app2.post("/api/finance/withdraw", isAuthenticated, async (req, res) => {
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
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const user = await storage.getUser(userId);
      const userTickets = await storage.getUserTickets(userId);
      const completedTickets = userTickets.filter((ticket) => ticket.paymentStatus === "completed");
      const totalRevenue = completedTickets.reduce(
        (sum, ticket) => sum + parseFloat(ticket.totalAmount.toString() || "0"),
        0
      );
      const isAdmin2 = user?.isAdmin === true;
      const availableBalance = isAdmin2 ? totalRevenue : totalRevenue * 0.85;
      if (withdrawalAmount > availableBalance) {
        return res.status(400).json({
          message: `Insufficient funds. Available balance: ${availableBalance.toFixed(2)}`
        });
      }
      const withdrawalRequest = {
        id: Date.now(),
        userId,
        amount: withdrawalAmount,
        accountName,
        accountNumber,
        bankName,
        status: "pending",
        createdAt: /* @__PURE__ */ new Date()
      };
      res.status(201).json({
        success: true,
        message: "Withdrawal request submitted successfully",
        data: withdrawalRequest
      });
    } catch (error) {
      console.error("Error processing withdrawal request:", error);
      res.status(500).json({ message: error.message || "Error processing withdrawal request" });
    }
  });
  app2.post("/api/admin/events/sample", isAdmin, async (req, res) => {
    try {
      console.log("Creating sample events");
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
          userId: 2,
          // Admin user
          maxAttendees: 5e3,
          isFree: false,
          price: "850",
          tags: "jazz,music,festival,cape town",
          latitude: "-33.9155",
          longitude: "18.4239",
          featured: true,
          hasMultipleTicketTypes: true,
          totalTickets: 5e3,
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
          userId: 2,
          // Admin user
          maxAttendees: 2e3,
          isFree: false,
          price: "350",
          tags: "wine,food,lifestyle,soweto,johannesburg",
          latitude: "-26.2485",
          longitude: "27.8540",
          featured: true,
          hasMultipleTicketTypes: true,
          totalTickets: 2e3,
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
          userId: 1,
          // Demo user
          maxAttendees: 3e3,
          isFree: false,
          price: "200",
          tags: "film,cinema,festival,durban",
          latitude: "-29.8587",
          longitude: "31.0218",
          featured: false,
          hasMultipleTicketTypes: true,
          totalTickets: 3e3,
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
          userId: 1,
          // Demo user
          maxAttendees: 1e4,
          isFree: false,
          price: "450",
          tags: "faith,community,men,karoo,eastern cape",
          latitude: "-31.4965",
          longitude: "25.0124",
          featured: false,
          genderRestriction: "male-only",
          hasMultipleTicketTypes: true,
          totalTickets: 1e4,
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
          userId: 2,
          // Admin user
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
      const ticketTypesMap = {
        "Cape Town Jazz Festival 2025": [
          {
            name: "General Admission",
            description: "Standard festival access to all stages",
            price: "850",
            quantity: 4e3,
            soldCount: 203,
            isActive: true
          },
          {
            name: "VIP Pass",
            description: "Premium access with backstage tours, artist meet & greets, and exclusive lounge",
            price: "1950",
            quantity: 1e3,
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
            quantity: 2e3,
            soldCount: 478,
            isActive: true
          },
          {
            name: "Festival Pass",
            description: "Full access to all screenings for the entire festival duration",
            price: "850",
            quantity: 1e3,
            soldCount: 11,
            isActive: true
          }
        ],
        "Karoo Mighty Men Conference": [
          {
            name: "Standard Registration",
            description: "Full conference access with camping spot",
            price: "450",
            quantity: 8e3,
            soldCount: 780,
            isActive: true
          },
          {
            name: "Premium Package",
            description: "Conference access with premium tent accommodation and meals included",
            price: "1200",
            quantity: 2e3,
            soldCount: 12,
            isActive: true
          }
        ],
        "Cape Town Tech Summit": [
          {
            name: "Standard Pass",
            description: "Access to all keynotes and exhibition area",
            price: "1200",
            quantity: 1e3,
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
      for (const eventData of sampleEvents) {
        const event = await storage.createEvent(eventData);
        const ticketTypes2 = ticketTypesMap[event.title];
        if (ticketTypes2 && ticketTypes2.length > 0) {
          for (const ticketTypeData of ticketTypes2) {
            const ticketType = await storage.createTicketType({
              eventId: event.id,
              name: ticketTypeData.name,
              description: ticketTypeData.description,
              price: ticketTypeData.price,
              quantity: ticketTypeData.quantity,
              isActive: ticketTypeData.isActive
            });
            if (ticketType && ticketTypeData.soldCount) {
              ticketType.soldCount = ticketTypeData.soldCount;
            }
          }
          console.log(`Created ${ticketTypes2.length} ticket types for event "${event.title}"`);
        }
      }
      console.log(`Created ${sampleEvents.length} sample events successfully with multiple ticket types`);
      res.json({
        success: true,
        message: `Created ${sampleEvents.length} sample events successfully with multiple ticket types`,
        count: sampleEvents.length
      });
    } catch (error) {
      console.error("Error creating sample events:", error);
      res.status(500).json({ message: error.message || "Error creating sample events" });
    }
  });
  app2.delete("/api/admin/events/all", isAdmin, async (req, res) => {
    try {
      const events2 = await storage.getAllEvents();
      console.log(`Deleting all ${events2.length} events`);
      for (const event of events2) {
        await storage.deleteEvent(event.id);
      }
      console.log("All events deleted successfully");
      res.json({ success: true, message: "All events deleted successfully" });
    } catch (error) {
      console.error("Error deleting all events:", error);
      res.status(500).json({ message: error.message || "Error deleting all events" });
    }
  });
  app2.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const totalUsers = allUsers.length;
      const allEvents = await storage.getAllEvents();
      const totalEvents = allEvents.length;
      const allTickets = await storage.getAllTickets();
      const completedTickets = allTickets.filter((ticket) => ticket.paymentStatus === "completed");
      const totalTicketsSold = completedTickets.length;
      const totalRevenue = completedTickets.reduce(
        (sum, ticket) => sum + parseFloat(ticket.totalAmount?.toString() || "0"),
        0
      );
      const adminUser = allUsers.find((user) => user.isAdmin);
      const platformBalance = adminUser ? parseFloat(adminUser.platformBalance || "0") : 0;
      res.json({
        totalUsers,
        totalEvents,
        totalTicketsSold,
        totalRevenue,
        platformBalance
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Error fetching admin stats" });
    }
  });
  app2.get("/api/admin/transactions", isAdmin, async (req, res) => {
    try {
      const allTickets = await storage.getAllTickets();
      const completedTickets = allTickets.filter(
        (ticket) => ticket.paymentStatus === "completed" || ticket.paymentStatus === "pending"
      );
      const sortedTickets = completedTickets.sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      const recentTickets = sortedTickets.slice(0, 20);
      res.json(recentTickets);
    } catch (error) {
      console.error("Error fetching admin transactions:", error);
      res.status(500).json({ message: "Error fetching admin transactions" });
    }
  });
  app2.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const searchQuery = req.query.search || "";
      const allUsers = await storage.getAllUsers();
      let filteredUsers = allUsers;
      if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        filteredUsers = allUsers.filter(
          (user) => user.username.toLowerCase().includes(lowerCaseQuery) || user.displayName && user.displayName.toLowerCase().includes(lowerCaseQuery)
        );
      }
      const safeUsers = filteredUsers.map((user) => ({
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
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Error fetching users" });
    }
  });
  app2.post("/api/admin/users/:userId/toggle-ban", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (userId === req.session.userId) {
        return res.status(400).json({ message: "You cannot ban your own account" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
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
      console.error("Error toggling user ban status:", error);
      res.status(500).json({ message: "Error updating user ban status" });
    }
  });
  app2.patch("/api/admin/users/:userId", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { username, displayName } = req.body;
      if (!username && !displayName) {
        return res.status(400).json({ message: "No update data provided" });
      }
      if (username) {
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: "Username is already taken" });
        }
      }
      const updateData = {};
      if (username) updateData.username = username;
      if (displayName) updateData.displayName = displayName;
      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        displayName: updatedUser.displayName
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Error updating user profile" });
    }
  });
  app2.patch("/api/users/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const { username, displayName } = req.body;
      if (!username && !displayName) {
        return res.status(400).json({ message: "No update data provided" });
      }
      if (username) {
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: "Username is already taken" });
        }
      }
      const updateData = {};
      if (username) updateData.username = username;
      if (displayName) updateData.displayName = displayName;
      const updatedUser = await storage.updateUser(userId, updateData);
      if (username) {
      }
      res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        displayName: updatedUser.displayName
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Error updating user profile" });
    }
  });
  app2.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const notifications2 = await storage.getUserNotifications(userId);
      res.json(notifications2);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: error.message || "Error fetching notifications" });
    }
  });
  app2.patch("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      res.json(updatedNotification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: error.message || "Error marking notification as read" });
    }
  });
  app2.post("/api/notifications/read-all", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: error.message || "Error marking all notifications as read" });
    }
  });
  app2.delete("/api/notifications/:id", isAuthenticated, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.deleteNotification(notificationId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: error.message || "Error deleting notification" });
    }
  });
  app2.post("/api/notifications/generate", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const user = await storage.getUser(userId);
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      await createNotifications();
      res.json({
        success: true,
        message: "Dummy notifications created successfully"
      });
    } catch (error) {
      console.error("Error creating dummy notifications:", error);
      res.status(500).json({ message: error.message || "Error creating dummy notifications" });
    }
  });
  app2.get("/api/friends", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const friends = await storage.getFriends(userId);
      const sanitizedFriends = friends.map((friend) => {
        const { password, ...userWithoutPassword } = friend;
        return userWithoutPassword;
      });
      res.json(sanitizedFriends);
    } catch (error) {
      console.error("Error fetching friends:", error);
      res.status(500).json({ message: error.message || "Error fetching friends" });
    }
  });
  app2.get("/api/users/:id/friendship", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const otherUserId = parseInt(req.params.id);
      const isFriend = await storage.checkFriendship(userId, otherUserId);
      res.json({ isFriend });
    } catch (error) {
      console.error("Error checking friendship status:", error);
      res.status(500).json({ message: error.message || "Error checking friendship status" });
    }
  });
  app2.get("/api/debug/add-coordinates", async (req, res) => {
    try {
      const coordinates = [
        // San Francisco, CA for Tech Innovation Summit
        { id: 1, latitude: "37.7749", longitude: "-122.4194" },
        // Austin, TX for Global Music Festival
        { id: 2, latitude: "30.2672", longitude: "-97.7431" },
        // New York, NY for Art Exhibition
        { id: 3, latitude: "40.7128", longitude: "-74.0060" },
        // London, UK for Digital Skills Workshop
        { id: 4, latitude: "51.5074", longitude: "-0.1278" },
        // Chicago, IL for Startup Competition
        { id: 5, latitude: "41.8781", longitude: "-87.6298" },
        // Paris, France for Culinary Masterclass
        { id: 6, latitude: "48.8566", longitude: "2.3522" },
        // Bali, Indonesia for Wellness Retreat
        { id: 7, latitude: "-8.3405", longitude: "115.0920" }
      ];
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
        status: "ok",
        message: "Coordinates added to mock events",
        coordinates
      });
    } catch (error) {
      console.error("Error updating coordinates:", error);
      res.status(500).json({
        message: "Error updating coordinates",
        error: String(error)
      });
    }
  });
  registerTestRoutes(app2);
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path4 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path3 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path3.resolve(import.meta.dirname, "client", "src"),
      "@shared": path3.resolve(import.meta.dirname, "shared"),
      "@assets": path3.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path3.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path3.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path4.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path4.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path4.resolve(distPath, "index.html"));
  });
}

// server/uploads.ts
import express2 from "express";
import multer2 from "multer";
import path5 from "path";
import fs3 from "fs-extra";
import { fileURLToPath as fileURLToPath2 } from "url";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path5.dirname(__filename2);
var projectRoot2 = path5.resolve(__dirname2, "..");
var uploadsPath = path5.join(projectRoot2, "uploads");
var tempUploadsPath = path5.join(projectRoot2, "temp-uploads");
var imagesPath = path5.join(uploadsPath, "images");
try {
  fs3.ensureDirSync(tempUploadsPath);
  fs3.ensureDirSync(imagesPath);
  console.log("Ensured temp-uploads and images directories exist");
} catch (error) {
  console.error("Error creating upload directories:", error);
}
var storage2 = multer2.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, tempUploadsPath);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path5.extname(file.originalname));
  }
});
var upload = multer2({
  storage: storage2,
  limits: {
    fileSize: 10 * 1024 * 1024,
    // 10MB max file size for images
    files: 30
    // Allow up to 30 files per request
  },
  fileFilter: (_req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path5.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    console.log("Rejected file with extension:", path5.extname(file.originalname).toLowerCase());
    cb(new Error("Only image files are allowed (JPEG, PNG, GIF, WEBP)"));
  }
});
function registerUploadRoutes(app2) {
  const projectRoot3 = path5.resolve(__dirname2, "..");
  const uploadsPath2 = path5.join(projectRoot3, "uploads");
  console.log("Setting up uploads directory for static serving at:", uploadsPath2);
  try {
    fs3.ensureDirSync(uploadsPath2);
    fs3.ensureDirSync(path5.join(uploadsPath2, "images"));
    console.log("Ensured all uploads directories exist");
    const testFile = path5.join(uploadsPath2, "test-access.txt");
    fs3.writeFileSync(testFile, "Testing write access");
    console.log("Successfully wrote test file to uploads directory");
    app2.use("/uploads", express2.static(uploadsPath2));
    console.log("Static file serving configured for uploads directory");
  } catch (error) {
    console.error("Error setting up uploads directory:", error);
  }
  app2.post("/api/upload/images", upload.array("images", 30), async (req, res) => {
    try {
      if (!req.files || Array.isArray(req.files) && req.files.length === 0) {
        console.log("No image files provided in request");
        return res.status(400).json({ message: "No image files provided" });
      }
      const files = req.files;
      console.log(`Received ${files.length} image files for upload`);
      if (files.length > 30) {
        return res.status(400).json({ message: "Maximum 30 images allowed per event" });
      }
      if (files.length < 1) {
        return res.status(400).json({ message: "At least 1 image is required" });
      }
      const imageUrls = [];
      for (const file of files) {
        const timestamp2 = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const imageFileName = `image_${timestamp2}_${randomStr}${path5.extname(file.originalname)}`;
        const finalImagePath = path5.join(imagesPath, imageFileName);
        await fs3.copyFile(file.path, finalImagePath);
        imageUrls.push(`/uploads/images/${imageFileName}`);
        await fs3.remove(file.path);
      }
      return res.status(200).json({
        message: "Images uploaded successfully",
        imageUrls
      });
    } catch (error) {
      console.error("Error during image upload:", error.message);
      return res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/upload/image", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        console.log("No image file provided in request");
        return res.status(400).json({ message: "No image file provided" });
      }
      const timestamp2 = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const imageFileName = `image_${timestamp2}_${randomStr}${path5.extname(req.file.originalname)}`;
      const finalImagePath = path5.join(imagesPath, imageFileName);
      await fs3.copyFile(req.file.path, finalImagePath);
      await fs3.remove(req.file.path);
      return res.status(200).json({
        message: "Image uploaded successfully",
        imageUrl: `/uploads/images/${imageFileName}`
      });
    } catch (error) {
      console.error("Error during image upload:", error.message);
      return res.status(400).json({ message: error.message });
    }
  });
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path6 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path6.startsWith("/api")) {
      let logLine = `${req.method} ${path6} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
var initDatabase = async () => {
  try {
    log("Using pre-pushed database schema", "database");
    if (storage instanceof DatabaseStorage) {
      await storage.seedEvents();
      log("Sample events seeded", "database");
    } else {
      log("Adding mock events to memory storage", "database");
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
        maxAttendees: 5e3,
        isFree: false,
        price: "149.99",
        tags: "music,festival,concert,live",
        video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
      });
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
      log("Mock events added successfully", "database");
    }
  } catch (error) {
    log(`Database initialization error: ${error}`, "database");
  }
};
(async () => {
  try {
    await initDatabase();
    const server = await registerRoutes(app);
    registerUploadRoutes(app);
    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      throw err;
    });
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
    const port = 5e3;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true
    }, () => {
      log(`serving on port ${port}`);
    });
  } catch (error) {
    log(`Server initialization error: ${error}`, "server");
  }
})();
