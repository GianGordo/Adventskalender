import { NextResponse } from 'next/server';
import { parse } from 'cookie';

export async function middleware(req: Request) {
  console.log(`Middleware executed for: ${req.url}`);

  const cookieHeader = req.headers.get('cookie');
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const authToken = cookies.authToken;

  if (!authToken) {
    console.log('No token found. Redirecting to login.');
    return NextResponse.redirect(new URL('/login', req.url));
  } else {
    console.log("Cookie found")
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/adventskalender/:path*', '/adventskalender'],
};
