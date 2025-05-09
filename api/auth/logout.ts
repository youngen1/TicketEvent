// api/auth/logout.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clearAuthCookie } from '../../server/utils/authUtils'; // Adjust path relative to `api` dir

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') { // Typically logout is a POST to prevent CSRF if it has side effects
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        // Clear the authentication cookie containing the JWT
        clearAuthCookie(res);

        return res.status(200).json({ message: "Logged out successfully" });

    } catch (error) {
        console.error('Logout error:', error);
        // This is unlikely to error if clearAuthCookie just sets headers,
        // but good practice to have a catch block.
        return res.status(500).json({ message: "An error occurred during logout." });
    }
}