import { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie'; // Import cookie parser to handle cookies
import { auth } from '../../lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Cookie vom Header parsen
    const cookieHeader = req.headers.cookie;
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const token = cookies.authToken; // Retrieve authToken from cookies

    if (!token) {
      return res.status(401).json({ valid: false, error: 'Unauthorized: Missing token' });
    }

    // Token verifizieren
    const decodedToken = await auth.verifyIdToken(token);
    console.log('Token verified for user:', decodedToken.uid);

    return res.status(200).json({ valid: true, uid: decodedToken.uid });
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ valid: false, error: 'Invalid token' });
  }
}
