import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '../../lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.body;

  try {
    // user mit dem email holen 
    const user = await auth.getUserByEmail(email);

    // customToken für den Benutzer erstellen
    const customToken = await auth.createCustomToken(user.uid);

    // customToken ans frontend schicken
    return res.status(200).json({ token: customToken });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(401).json({ error: 'Invalid credentials' });
  }
}
