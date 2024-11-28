import admin, { ServiceAccount } from 'firebase-admin';


if (!admin.apps.length) {
  const credentials = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  };

  admin.initializeApp({
    credential: admin.credential.cert(credentials as ServiceAccount),
  });
}
export const auth = admin.auth();
export const firestore = admin.firestore();
