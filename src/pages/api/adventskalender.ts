import { NextApiRequest, NextApiResponse } from 'next';
import { firestore, auth } from '../../lib/firebase-admin';
import { parse } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Token aus dem Authorization-Header oder den Cookies lesen
    let token: string | undefined;

    //Token aus Authorization Header extrahieren
    if (req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    // Falls kein Token im Header, versuche aus Cookies
    if (!token) {
      const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
      token = cookies.authToken;
    }

    // Falls immer noch kein Token gefunden, Fehler werfen
    if (!token) {
      console.error('Unauthorized: Missing token');
      return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    // Token verifizieren und BenutzerId abrufen
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // GET: Adventskalender-Daten abrufen
    if (req.method === 'GET') {
      try {
        const userDoc = await firestore.collection('adventskalender').doc(uid).get();

        if (!userDoc.exists) {
          return res.status(404).json({ error: 'No Adventskalender data found' });
        }

        // Adventskalender Daten zurückgeben
        const data = userDoc.data();

        const user = data?.user || null;
        // Zufällige Reihenfolge der Boxen für die Anzeige hinzufügen
        const array = (data?.array || []).map((box: any) => ({
          ...box,
          randomOrder: Math.random(),
        }));

        return res.status(200).json({ array, user });
      } catch (error) {
        console.error('Error fetching Adventskalender data:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }

    // POST: Status einer spezifischen Box aktualisieren
    if (req.method === 'POST') {
      const { number } = req.body;

      if (!number) {
        return res.status(400).json({ error: 'Missing required field: number' });
      }

      try {
        const userDocRef = firestore.collection('adventskalender').doc(uid);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
          return res.status(404).json({ error: 'User document not found.' });
        }

        const data = userDoc.data();
        const array = data?.array || [];

        // Box mit entsprechender Nummer suchen
        const boxIndex = array.findIndex((box: any) => box.number === number);
        if (boxIndex === -1) {
          return res.status(404).json({ error: `Box with number ${number} not found.` });
        }

        // Status der Box aktualisieren
        array[boxIndex].status = 'opened';

        // Aktualisierte Daten zurück in Firestore speichern
        await userDocRef.update({ array });

        return res.status(200).json({ success: true, message: `Box ${number} status updated to opened.` });
      } catch (error) {
        console.error('Error updating box status in Firestore:', error);
        return res.status(500).json({ error: 'Error updating box status in Firestore.' });
      }
    }

    // Wenn Methode weder GET noch POST ist, abbrechen
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
