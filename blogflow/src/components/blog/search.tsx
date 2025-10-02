'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Search() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const searchQuery = formData.get('search') as string;
    if (searchQuery) {
      router.push(`/blog?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/blog');
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-md items-center space-x-2"
    >
      <Input
        type="text"
        name="search"
        placeholder="Search with AI..."
        defaultValue={searchParams.get('q') || ''}
        className="flex-grow text-base"
        aria-label="Search blog posts"
      />
      <Button type="submit" size="icon" aria-label="Submit search">
        <SearchIcon className="h-4 w-4" />
      </Button>
    </form>
  );
}
