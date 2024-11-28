import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from "../styles/signup.module.css"
import Link from 'next/link';
const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const router = useRouter();


  // neuen User im Backend erstellen
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      if (res.ok) {
        alert('Sign up successful! Please log in.');
        router.push('/login');
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Sign up failed.');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      alert('An error occurred during sign up. Please try again.');
    }
  };

  return (
    <div>
      <div className='hills'></div>
      <div className={styles.signupContainer}>
        <h1 className={styles.signupTitle}>Sign Up</h1>
        <form className={styles.signupForm} onSubmit={handleSignUp}>
        <label className={styles.formLabel}>
            Vorname:
            <input
              className={styles.formInput}
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </label>
          <label className={styles.formLabel}>
            Nachname:
            <input
              className={styles.formInput}
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </label>
          <label className={styles.formLabel}>
            Email:
            <input
              className={styles.formInput}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className={styles.formLabel}>
            Password:
            <input
              className={styles.formInput}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className={styles.signupButton} type="submit">
            Sign Up
          </button>
          <p className={styles.loginText}>
            Bereits Registriert? <Link className={styles.loginLink} href="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export async function getStaticProps() {
  return {
    props: {},
    revalidate: 3600, // ISR: Aktualisiert alle 3600 Sekunden
  };
}

export default SignUp;
