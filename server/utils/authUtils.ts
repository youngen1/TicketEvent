// server/utils/authUtils.ts
import jwt from 'jsonwebtoken';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../storage'; // Adjust path if needed
import type { User } from '@shared/schema'; // Assuming User type is exported

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-super-secret-key';
const JWT_COOKIE_NAME = 'authToken';

interface DecodedToken {
    userId: number;
    // iat, exp if you add them
}

export function generateToken(userId: number): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function setAuthCookie(res: VercelResponse, token: string): void {
    res.setHeader('Set-Cookie', `${JWT_COOKIE_NAME}=${token}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`); // 7 days
}

export function clearAuthCookie(res: VercelResponse): void {
    res.setHeader('Set-Cookie', `${JWT_COOKIE_NAME}=; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=0`);
}

export async function getAuthenticatedUser(req: VercelRequest): Promise<User | null> {
    const token = req.cookies?.[JWT_COOKIE_NAME];

    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
        if (decoded && decoded.userId) {
            const user = await storage.getUser(decoded.userId);
            // Omit password or other sensitive fields if User type includes them
            if (user) {
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword as User; // Cast if necessary
            }
        }
        return null;
    } catch (error) {
        console.error('JWT verification error:', error);
        return null;
    }
}

// Helper to replace `isAuthenticated` middleware
export async function requireAuth(req: VercelRequest, res: VercelResponse): Promise<User | null> {
    const user = await getAuthenticatedUser(req);
    if (!user) {
        res.status(401).json({ message: 'Not authenticated' });
        return null;
    }
    return user;
}

// Helper to replace `isAdmin` middleware
export async function requireAdmin(req: VercelRequest, res: VercelResponse): Promise<User | null> {
    const user = await requireAuth(req, res);
    if (user && !user.isAdmin) {
        res.status(403).json({ message: 'Forbidden: Admin privileges required.' });
        return null;
    }
    return user; // Will be null if requireAuth failed or user is not admin
}