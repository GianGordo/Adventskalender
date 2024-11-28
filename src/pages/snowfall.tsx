import React, { useEffect, useState } from 'react';
import styles from '../styles/adventskalender.module.css';

const Snowfall = () => {
  const [flakes, setFlakes] = useState<number[]>([]);

  useEffect(() => {
    // Generiere eine bestimmte Anzahl an Schneeflocken
    const flakeArray = Array.from({ length: 50 }, (_, i) => i); // 50 Schneeflocken
    setFlakes(flakeArray);
  }, []);

  const generateRandomPosition = () => Math.random() * 100; // Zufällige horizontale Position
  const generateRandomDuration = () => Math.random() * 5 + 5; // Zufällige Animationsdauer

  return (
    <div className={styles.snowfall}>
      {flakes.map((flake) => (
        <div
          key={flake}
          className={styles.snowflake}
          style={{
            left: `${generateRandomPosition()}%`,
            animationDuration: `${generateRandomDuration()}s`,
            fontSize: `${Math.random() * 1.5 + 0.5}rem`, // Unterschiedliche Grössen
          }}
        >
          ❄️ 
        </div>
      ))}
    </div>
  );
};

export default Snowfall;
