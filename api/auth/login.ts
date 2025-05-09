// api/auth/login.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcrypt';
import { storage } from '../../server/storage'; // Adjust path relative to `api` dir
import { generateToken, setAuthCookie } from '../../server/utils/authUtils'; // Adjust path

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const { username, password: plainTextPassword } = req.body; // Renamed password to avoid confusion

        if (!username || !plainTextPassword) {
            return res.status(400).json({ message: "Username and password required" });
        }

        // Find user by username
        const user = await storage.getUserByUsername(username);
        if (!user) {
            console.log(`Login failed: User ${username} not found`);
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Check if user account is banned
        if (user.isBanned) {
            console.log(`Login failed: User ${username} is banned.`);
            return res.status(403).json({ message: "This account has been suspended." });
        }

        console.log(`Login attempt for user: ${username}, ID: ${user.id}`);

        // DEV ONLY: Special case for admin during development with plain "password"

        // It's better to create an admin user with a properly hashed password.
        if (process.env.NODE_ENV !== 'production' && username === 'admin' && plainTextPassword === 'password') {
            console.warn('Admin login bypass activated with plain text password. FOR DEVELOPMENT ONLY.');

            const token = generateToken(user.id);
            setAuthCookie(res, token);

            // Don't return the password
            const { password: hashedPassword, ...userWithoutPassword } = user;
            return res.status(200).json(userWithoutPassword);
        }

        // Check password against the stored hash
        // `user.password` should be the hashed password from the database
        if (!user.password) {
            // This case should ideally not happen if users are created correctly
            console.error(`User ${username} (ID: ${user.id}) has no password hash stored.`);
            return res.status(500).json({ message: "Authentication error. Please contact support." });
        }
        const passwordMatch = await bcrypt.compare(plainTextPassword, user.password);

        if (!passwordMatch) {
            console.log(`Password mismatch for user: ${username}`);
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Password is correct, generate JWT
        const token = generateToken(user.id);
        setAuthCookie(res, token); // Set JWT in an httpOnly, secure cookie

        // Don't return the password hash to the client
        const { password: hashedPassword, ...userWithoutPassword } = user;

        return res.status(200).json(userWithoutPassword);

    } catch (error) {
        console.error('Login error:', error);
        // Provide a generic error message to the client
        return res.status(500).json({ message: "An error occurred during login. Please try again." });
    }
}