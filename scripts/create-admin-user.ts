import { db } from '../server/db';
import { users } from '../shared/schema';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { sql } from 'drizzle-orm';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdminUser() {
  console.log('Checking for admin user...');
  
  try {
    // Check if admin user exists
    const existingAdmin = await db.select().from(users).where(sql`username = 'admin'`);
    
    if (existingAdmin.length > 0) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create admin user
    console.log('Creating admin user...');
    const hashedPassword = await hashPassword('password');
    
    await db.execute(sql`
      INSERT INTO users (username, password, display_name, email, is_admin, created_at, followers_count, following_count, platform_balance)
      VALUES ('admin', ${hashedPassword}, 'Admin User', 'admin@example.com', true, CURRENT_TIMESTAMP, 0, 0, 0)
    `);
    
    console.log('Admin user created successfully');
    
    // Create regular user
    console.log('Creating demo user...');
    const demoPassword = await hashPassword('password');
    
    await db.execute(sql`
      INSERT INTO users (username, password, display_name, email, is_admin, created_at, followers_count, following_count, platform_balance)
      VALUES ('demo', ${demoPassword}, 'Demo User', 'demo@example.com', false, CURRENT_TIMESTAMP, 0, 0, 0)
    `);
    
    console.log('Demo user created successfully');
  } catch (error) {
    console.error('Error creating users:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

createAdminUser();