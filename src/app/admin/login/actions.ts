'use server';

import {cookies} from 'next/headers';
import {adminAuth} from '@/lib/firebase-admin';

export async function createSessionCookie(idToken: string): Promise<{ status: string; message?: string }> {
  if (!adminAuth) {
    throw new Error('Firebase Admin SDK has not been initialized. Check for missing environment variables.');
  }
  try {
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {expiresIn});
    const cookieStore = await cookies();
    cookieStore.set('__session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    return {status: 'success'};
  } catch (error: any) {
    console.error('Error creating session cookie:', error);
    // Pass a more specific error message back to the client.
    return {status: 'error', message: error.message || 'Failed to create session'};
  }
}

export async function signOut() {
    const cookieStore = await cookies();
    cookieStore.delete('__session');
}
