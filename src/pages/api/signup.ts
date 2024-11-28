import { NextApiRequest, NextApiResponse } from 'next';
import { auth, firestore } from '../../lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, password, firstName, lastName } = req.body;

  try {
    // Registrierung in Firebase
    const user = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`, 
    });

        // "24 Nachrichten im Backend erstellen"
        const messages = [
          "Des Jahres Hektik schwindet, und Ruhe endlich Einkehr findet. Die Tage können kaum schöner sein – als Weihnachten zu Hause im Kerzenschein.",
          "Glockenklang und Kerzenschein, das muss die Weihnachtszeit wohl sein",
          "A Plätzchen a day, keeps the stress away.",
          "Ich bin gefühlsmäßig total bereit für Weihnachten – nur finanziell noch überhaupt nicht.",
          "Zu Weihnachten habe ich schon wieder dasselbe wie letztes Jahr bekommen: Zwei Kilo mehr und Kopfschmerzen von der Familie…",
          "9 von 10 Enten empfehlen Rindersteak zu Weihnachten.",
          "Ich wollte Dir dieses Jahr zu Weihnachten etwas Bezauberndes, Aufregendes und Wunderschönes schicken. Am Postschalter befahl man mir aber, aus dem Paket zu steigen, sonst würden sie den Sicherheitsdienst holen.",
          "Liebes Christkind, guter Gast! Was hast du mir mitgebracht? Hast du was, dann setzt dich nieder – hast du nichts, dann geh gleich wieder!",
          "Rosen sind rot, der Glühwein war heif. Funge verbrannt – was für ein Feiff.",
          "Weihnachtslektion Nummer 1: Fehlendes Talent beim Verpacken wird durch Klebeband ersetzt!",
          "Ich wünsche Euch ein frohes Weihnachtsfest, und dass Ihr nicht meine Lebkuchen esst!",
          "In überfüllten Geschäften Weihnachtskäufe machen zu müssen, verursacht Santa Claustrophobie",
          "Wenn es an Weihnachten überall nach Zimt und Tannengrün duftet und die Lichter festlich glitzern, weißt du, dass es Zeit ist, die Jogginghose rauszuholen. Schließlich gibt es keinen besseren Weg, die Feiertage zu genießen, als sich durch die Plätzchen-Vorräte zu schlemmen, während man sich die x-te Wiederholung des Lieblingsweihnachtsfilms ansieht.",
          "Weihnachten ist diese magische Zeit, in der der Kühlschrank vor Leckereien überquillt, der Fernseher nur Weihnachtsklassiker spielt und du beim fünften Glühwein den Weihnachtsbaum plötzlich noch viel schöner findest. Möge dein Fest so fröhlich und beschwingt sein wie die Weihnachtslieder, die alle um dich herum singen!",
          "Weihnachten – die Zeit des Jahres, in der man sich fragt, warum man so viele Lichterketten gekauft hat, während man verzweifelt versucht, sie zu entwirren. Und doch, wenn der Baum endlich funkelt und das Wohnzimmer in warmes Licht taucht, weiß man, dass der ganze Aufwand es wert war. Frohe Weihnachten – und möge dein Baum in diesem Jahr ohne umzufallen überstehen!",
          "Jedes Jahr dasselbe Spiel: Die Suche nach dem perfekten Geschenk, das Einpacken mit viel zu wenig Geschenkpapier und dann der große Moment der Bescherung, in dem man hofft, dass das eigene Geschenk mindestens so gut ankommt wie die Leckereien vom Weihnachtsmarkt. Egal, wie es ausgeht – Hauptsache, der Weihnachtsbaum bleibt stehen!",
          "Weihnachten – die Zeit, in der man versucht, beim Weihnachtsessen nicht die eigene Familie zu überfuttern, während man gleichzeitig hofft, dass der Nachtisch genau so lecker ist wie letztes Jahr. Genieße die kulinarischen Highlights und denke daran: Kalorien zählen nicht an den Feiertagen, sondern nur die schönen Erinnerungen, die du sammelst.",
          "Weihnachten ist die perfekte Zeit, um in Jogginghosen Schokolade zu essen und Weihnachtsfilme zu schauen. Genieße die festlichen Tage in vollen Zügen!",
          "Weihnachten ist die Zeit, in der man sich fragt, warum man sich so viele Geschenke ausgedacht hat, aber am Ende zählt nur das Lächeln beim Auspacken!",
          "Weihnachten, die Zeit der Lichterketten-Chaos! Doch wenn alles funkelt, weißt du, dass es den Aufwand wert war. Frohes Fest!",
          "Weihnachten – die Zeit, in der wir hoffen, dass der Weihnachtsbaum nicht umfällt und die Geschenke alle gut ankommen. Fröhliche Feiertage!",
          "Weihnachten ist die perfekte Ausrede, um sich durch die Festtage zu schlemmen und Kalorien zu ignorieren. Genieße jede Leckerei und jede Erinnerung!",
          "Weihnachten ist die Zeit, innezuhalten und die Liebe und Wärme zu spüren, die uns umgibt. Möge dein Fest voller Frieden und Glück sein.",
          "Die Lichter von Weihnachten erinnern uns daran, dass auch in der Dunkelheit Wärme und Hoffnung zu finden sind. Möge dein Herz in dieser Zeit leuchten."
        ];
    
        // Nachrichten durchmischen
        const shuffledMessages = messages
          .map((message, index) => ({ number: index + 1, message }))
          .sort(() => Math.random() - 0.5);
    
        // Daten Speichern
        await firestore.collection('adventskalender').doc(user.uid).set({
          array: shuffledMessages,
          user: { firstName, lastName }, 
        });
        
    return res.status(201).json({ success: true, user });
  } catch (error: any) {
    console.error('Error creating user:', error);

    let errorMessage = 'Could not create user.';

    // Überprüfe Firebase-Fehlercodes und passe die Fehlermeldung an
    if (error.message.includes('The password must be a string with at least 6 characters')) {
      errorMessage = 'Das Passwort muss mindestens 6 Zeichen lang sein.';
    } else if (error.message.includes('The email address is already in use by another account.')) {
      errorMessage = 'Die E-Mail-Adresse wird bereits verwendet.';
    } else if (error.message.includes('The email address is improperly formatted')) {
      errorMessage = 'Die E-Mail-Adresse ist ungültig.';
    }

    return res.status(400).json({ error: errorMessage });
  }
}
