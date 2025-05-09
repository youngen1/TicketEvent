// api/auth/me.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthenticatedUser } from '../../server/utils/authUtils'; // Adjust path relative to `api` dir

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        // getAuthenticatedUser will handle extracting the JWT from the cookie,
        // verifying it, and fetching the user from storage (excluding the password).
        const user = await getAuthenticatedUser(req);

        if (!user) {
            // If getAuthenticatedUser returns null, it means the token was missing,
            // invalid, or the user associated with the token was not found.
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // The 'user' object returned by getAuthenticatedUser should already
        // have sensitive information like the password removed.
        return res.status(200).json(user);

    } catch (error) {
        console.error('Error fetching authenticated user (/api/auth/me):', error);
        // This catch block is more for unexpected errors within this handler itself,
        // as getAuthenticatedUser should ideally handle its own internal errors gracefully.
        return res.status(500).json({ message: 'An error occurred while fetching user details.' });
    }
}