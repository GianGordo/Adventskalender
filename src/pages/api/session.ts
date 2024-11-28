import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
import { auth } from '../../lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { idToken } = req.body;

  // Token format überprüfen
  if (typeof idToken !== 'string' || idToken.trim() === '') {
    return res.status(400).json({ error: 'Invalid ID token format' });
  }

  try {
    // idToken mit firebase prüfen
    const decodedToken = await auth.verifyIdToken(idToken);

    // authToken setzen
    const cookie = serialize('authToken', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    res.setHeader('Set-Cookie', cookie);
    return res.status(200).json({ success: true, uid: decodedToken.uid });
  } catch (error) {
    console.error('Error setting session:', error);
    return res.status(401).json({ error: 'Invalid or expired ID token' });
  }
}
