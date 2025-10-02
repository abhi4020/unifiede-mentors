import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const heroImage = PlaceHolderImages.find((p) => p.id === 'hero-home');
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
        <div className="flex flex-col items-start space-y-6">
          <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Welcome to BlogFlow
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl">
            Discover insightful articles, powered by AI-driven search. A clean,
            calm space for reading and learning.
          </p>
          <Button asChild size="lg">
            <Link href="/blog">Explore Posts</Link>
          </Button>
        </div>
        <div className="relative h-64 w-full overflow-hidden rounded-lg shadow-xl md:h-96">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
        </div>
      </div>
    </div>
  );
}
