import Link from 'next/link';
import { cookies } from 'next/headers';
import { Button } from '@/components/ui/button';
import { logout } from '@/app/actions';
import { NotebookText } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

export async function Header() {
  const cookieStore = await cookies();
  const user = cookieStore.get('user');

  return (
    <header className="bg-card/80 sticky top-0 z-40 w-full border-b backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <NotebookText className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl font-bold">BlogFlow</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/blog">Blog</Link>
          </Button>
          {user ? (
            <form action={logout}>
              <Button variant="outline" type="submit">
                Logout
              </Button>
            </form>
          ) : (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
