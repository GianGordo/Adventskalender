import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <h1>Willkommen!</h1>
      <nav>
        <ul>
          <li><Link href="/login">Login</Link></li>
          <li><Link href="/signup">SignUp</Link></li>
          <li><Link href="/adventskalender">test</Link></li>
        </ul>
      </nav>
    </div>
  );
}
