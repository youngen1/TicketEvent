import { db } from '../server/db';
import * as schema from '@shared/schema';
import { sql } from 'drizzle-orm';

async function pushSchema() {
  console.log('Pushing database schema to PostgreSQL...');
  
  try {
    // Create users table
    console.log('Creating users table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        display_name VARCHAR(255),
        email VARCHAR(255),
        gender VARCHAR(50),
        date_of_birth VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE,
        bio TEXT,
        avatar TEXT,
        followers_count INTEGER DEFAULT 0,
        following_count INTEGER DEFAULT 0,
        is_admin BOOLEAN DEFAULT FALSE,
        platform_balance DECIMAL(10,2) DEFAULT 0,
        location VARCHAR(255),
        website VARCHAR(255),
        is_verified BOOLEAN DEFAULT FALSE,
        last_login TIMESTAMP WITH TIME ZONE,
        notification_preferences JSONB,
        is_banned BOOLEAN DEFAULT FALSE
      )
    `);
    
    // Create events table
    console.log('Creating events table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        date VARCHAR(255) NOT NULL,
        time VARCHAR(50),
        location VARCHAR(255),
        category VARCHAR(100),
        image TEXT,
        images TEXT,
        user_id INTEGER NOT NULL,
        max_attendees INTEGER DEFAULT 100,
        is_free BOOLEAN DEFAULT FALSE,
        price VARCHAR(50) DEFAULT '0',
        tags TEXT,
        latitude VARCHAR(50),
        longitude VARCHAR(50),
        video TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE,
        views INTEGER DEFAULT 0,
        attendees INTEGER DEFAULT 0,
        featured BOOLEAN DEFAULT FALSE,
        gender_restriction VARCHAR(50),
        has_multiple_ticket_types BOOLEAN DEFAULT FALSE,
        total_tickets INTEGER DEFAULT 0,
        tickets_sold INTEGER DEFAULT 0,
        age_restriction TEXT[]
      )
    `);
    
    // Create comments table
    console.log('Creating comments table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        event_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE
      )
    `);
    
    // Create event_ratings table
    console.log('Creating event_ratings table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS event_ratings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        event_id INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(user_id, event_id)
      )
    `);
    
    // Create event_attendees table
    console.log('Creating event_attendees table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS event_attendees (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        event_id INTEGER NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(user_id, event_id)
      )
    `);
    
    // Create event_tickets table
    console.log('Creating event_tickets table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS event_tickets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        event_id INTEGER NOT NULL,
        ticket_type_id INTEGER,
        quantity INTEGER NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        payment_reference VARCHAR(255) NOT NULL,
        payment_status VARCHAR(50) NOT NULL,
        purchase_date TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE
      )
    `);
    
    // Create ticket_types table
    console.log('Creating ticket_types table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ticket_types (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price VARCHAR(50) NOT NULL,
        quantity INTEGER NOT NULL,
        sold_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE
      )
    `);
    
    // Create user_follows table
    console.log('Creating user_follows table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_follows (
        id SERIAL PRIMARY KEY,
        follower_id INTEGER NOT NULL,
        following_id INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(follower_id, following_id)
      )
    `);
    
    // Create notifications table
    console.log('Creating notifications table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        related_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create session table
    console.log('Creating session table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR(255) PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP NOT NULL
      )
    `);
    
    console.log('Database schema created successfully!');
  } catch (error) {
    console.error('Error pushing schema:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

pushSchema();