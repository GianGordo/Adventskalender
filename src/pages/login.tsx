import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import '../lib/firebase-client'; 
import styles from "../styles/login.module.css"; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // request ans Backend um einen Token zu erhalten. 
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error('Login failed');
      }

      const { token: customToken } = await res.json();

      // signIn mit dem Token
      const auth = getAuth();
      const userCredential = await signInWithCustomToken(auth, customToken);
      const idToken = await userCredential.user.getIdToken();
      // Setzt den AuthToken cookie im browser
      const sessionRes = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!sessionRes.ok) {
        throw new Error('Failed to set session');
      }
      
      const userId = auth.currentUser?.uid
      router.push(`/adventskalender?userId=${userId}`);
    } catch (error) {
      console.error('Error during login:', error);
      alert('Login failed');
    }
  };

  return (
    <div>
      <div className='hills'></div>
      <div  className={styles.loginContainer}>
        <h1 className={styles.loginTitle}>Login</h1>
        <form className={styles.loginForm} onSubmit={handleLogin}>
          <label className={styles.formLabel}>
            E-Mail:
            <input className={styles.formInput} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className={styles.formLabel}>
            Passwort:
            <input className={styles.formInput} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <button className={styles.loginButton} type="submit">Login</button>
          <p className={styles.signupText}>
            Noch keinen Account? <Link className={styles.signupLink} href="/signup">SignUp</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export async function getStaticProps() {
  return {
    props: {},
    revalidate: 3600, 
  };
}

export default Login;
