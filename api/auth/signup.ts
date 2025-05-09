// api/auth/signup.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcrypt';
import { storage } from '../../server/storage'; // Adjust path relative to `api` dir
import { insertUserSchema, type User } from '../../shared/schema'; // Adjust path

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        // Vercel automatically parses JSON body if Content-Type is application/json
        const validation = insertUserSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                message: "Invalid user data",
                errors: validation.error.format(),
            });
        }

        // Check if username already exists
        // req.body should contain the parsed data from the client
        const existingUserByUsername = await storage.getUserByUsername(req.body.username);
        if (existingUserByUsername) {
            return res.status(400).json({ message: "Username already taken" });
        }

        // Optional: Check if email already exists, if email is part of your schema and unique
        if (req.body.email) {
            const existingUserByEmail = await storage.getUserByEmail?.(req.body.email); // Add getUserByEmail to storage if needed
            if (existingUserByEmail) {
                return res.status(400).json({ message: "Email already registered" });
            }
        }


        // Hash password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create user
        // `validation.data` contains the validated and typed user input
        // Make sure your `insertUserSchema` from `shared/schema.ts` includes all necessary fields for creation
        // (username, password, email, etc.), but the password here will be the hashed one.
        const newUserInput = {
            ...validation.data, // This includes username, email, etc. from the schema
            password: hashedPassword, // Override with the hashed password
            // Add any default fields your storage.createUser might expect if not in schema
            // e.g., displayName: validation.data.displayName || validation.data.username,
            //       avatar: null,
            //       bio: null,
            //       createdAt: new Date(), // storage.createUser likely handles this
            //       updatedAt: new Date(), // storage.createUser likely handles this
        };


        const createdUser = await storage.createUser(newUserInput);

        // Don't return the password or other sensitive info not needed by client post-signup
        const { password, verificationToken, resetPasswordToken, ...userForClient } = createdUser;

        // Successfully created user
        // You might choose to automatically log them in here by generating a JWT
        // For example:
        // const token = generateToken(createdUser.id);
        // setAuthCookie(res, token);
        // return res.status(201).json(userForClient);
        //
        // Or, just return the user data and let the client redirect to login
        return res.status(201).json(userForClient);

    } catch (error) {
        console.error('Signup error:', error);
        // Provide a generic error message to the client
        return res.status(500).json({ message: "An error occurred during signup. Please try again." });
    }
}