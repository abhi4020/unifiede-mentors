'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const username = formData.get('username') as string;

  if (username) {
    const cookieStore = await cookies();
    cookieStore.set('user', username, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    redirect('/blog');
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('user');
  redirect('/');
}
