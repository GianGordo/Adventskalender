import { useEffect, useState } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import styles from '../styles/adventskalender.module.css';
import Snowfall from './snowfall';
import { GetServerSideProps } from 'next';

interface AdventDay {
  number: number;
  message: string;
  status: string;
  randomOrder?: number;
}

interface AdventskalenderProps {
  days: AdventDay[];
  currentDay: number | null;
  user: {firstName: string, lastName: string}
  error?: string;
}

const Adventskalender = ({ days: initialDays, currentDay: initialCurrentDay, user, error }: AdventskalenderProps) => {
  const [days, setDays] = useState<AdventDay[]>(initialDays); // Initialisiere mit SSR-Daten
  const [currentDay] = useState<number | null>(initialCurrentDay); // SSR-Daten
  const [openedDay, setOpenedDay] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);



  // Daten cashen und laden 
  useEffect(() => {
    const cachedDays = localStorage.getItem('adventDays');
    const cacheTimestamp = localStorage.getItem('cacheTimestamp');
    const oneDayInMs = 24 * 60 * 60 * 1000;
  
    if (cachedDays && cacheTimestamp && Date.now() - Number(cacheTimestamp) < oneDayInMs) {
      console.log('Cache verwendet: Daten aus localStorage geladen.');
      setDays(JSON.parse(cachedDays));
    } else {
      console.log('Kein gültiger Cache: Initialisiere mit SSR-Daten.');
      setDays(initialDays);
      localStorage.setItem('adventDays', JSON.stringify(initialDays));
      localStorage.setItem('cacheTimestamp', Date.now().toString());
    }
  }, [initialDays]);
  

  // Box öffnen und Status aktualisieren
  const openBox = async (dayNumber: number) => {
    try {
      setAnimationComplete(false); // Animationsstatus zurücksetzen

      const res = await fetch('/api/adventskalender', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ number: dayNumber }),
      });

      if (!res.ok) {
        throw new Error('Failed to update box status');
      }

      const updatedDays = days.map((day) =>
        day.number === dayNumber ? { ...day, status: 'opened' } : day
      );

      setDays(updatedDays);
      localStorage.setItem('adventDays', JSON.stringify(updatedDays));
      setOpenedDay(dayNumber);

      const day = days.find((d) => d.number === dayNumber);
      setTimeout(() => {
        setMessage(day?.message || '🎁 Diese Box hat keine Nachricht.');
        setShowMessage(true);
      }, 2000);
    } catch (err) {
      console.error('Error updating box status:', err);
      setMessage('Fehler beim Öffnen der Box. Bitte versuche es erneut.');
      setShowMessage(true);
    }
  };

  const handleBoxClick = (dayNumber: number) => {
    const selectedDay = days.find((day) => day.number === dayNumber);

    if (!selectedDay) {
      setMessage('Error: Box not found.');
      setShowMessage(true);
      return;
    }

    if (selectedDay.status === 'opened') {
      setMessage('🎅 Du hast diese Box bereits geöffnet.');
      setShowMessage(true);
      return;
    }

    if (currentDay === null) {
      setMessage('Der Adventskalender ist nur im Dezember verfügbar.');
      setShowMessage(true);
      return;
    }

    if (currentDay >= dayNumber) {
      setShowMessage(false);
      openBox(dayNumber);
    } else {
      setMessage('Du kannst diese Box noch nicht öffnen!');
      setShowMessage(true);
    }
  };

  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.adventCalendar}>
      <h1 className={styles.title}>{`${user.firstName} ${user.lastName}'s Adventskalender`}</h1>
      <Snowfall />
      {showMessage && (
        <>
          <div className={styles.overlay} />
          <div className={styles.letter}>
            <p>{message}</p>
            <button
              className={styles.closeButton}
              onClick={() => setShowMessage(false)}
            >
              Schliessen
            </button>
          </div>
        </>
      )}
      <div className={styles.calendarGrid}>
        {days.map((day) => (
          <div
            key={day.number}
            className={styles.calendarBox}
            onClick={() => handleBoxClick(day.number)}
          >
            {openedDay === day.number && !animationComplete ? (
              <Player
                autoplay
                loop={false}
                src="/PresentAnimation.json"
                className={styles.giftBoxAnimation}
                onEvent={(event) => {
                  if (event === 'complete') {
                    setAnimationComplete(true);
                  }
                }}
              />
            ) : day.status === 'opened' ? (
              <img
                src="/openedPresent.png"
                alt="Opened Gift Box"
                className={styles.giftBoxImageOpened}
              />
            ) : (
              <img
                src="/present.png"
                alt="Closed Gift Box"
                className={styles.giftBoxImage}
              />
            )}
            <span className={styles.boxNumber}>{day.number}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const cookies = req.headers.cookie || '';
  const authToken = cookies
    .split(';')
    .find((c) => c.trim().startsWith('authToken='))
    ?.split('=')[1];

  if (!authToken) {
    console.error('Kein Token im Cookie gefunden.');
    return {
      redirect: { destination: '/login', permanent: false },
    };
  }

  try {
    const res = await fetch('http://localhost:3000/api/adventskalender', {
      method: 'GET',
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!res.ok) {
      throw new Error(`Fetch failed with status: ${res.status}`);
    }

    const data = await res.json();
    const { array: days, user } = data;
    const today = new Date();
    const currentDay = today.getMonth() === 10 ? today.getDate() : null;

    return {
      props: {
        days: data.array || [],
        currentDay,
        user
      },
    };
  } catch (error) {
    console.error('SSR Error:', error);
    return {
      props: {
        error: 'Fehler beim Laden der Daten.',
      },
    };
  }
};

export default Adventskalender;
