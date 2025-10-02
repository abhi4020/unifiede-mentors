import { getBlogPostBySlug } from '@/lib/blog-data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Calendar, User } from 'lucide-react';
import { SocialShare } from '@/components/blog/social-share';
import { CommentSection } from '@/components/blog/comment-section';
import { cookies } from 'next/headers';
import { Separator } from '@/components/ui/separator';

type BlogPostPageProps = {
  params: {
    slug: string;
  };
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPostBySlug(params.slug);
  const cookieStore = await cookies();
  const user = cookieStore.get('user');

  if (!post) {
    notFound();
  }

  return (
    <article className="container mx-auto max-w-3xl px-4 py-8">
      <header className="mb-8 space-y-4">
        <h1 className="font-headline text-4xl font-bold leading-tight md:text-5xl">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{post.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <time dateTime={post.date}>{post.date}</time>
          </div>
        </div>
      </header>

      <div className="relative mb-8 h-64 w-full overflow-hidden rounded-lg md:h-96">
        <Image
          src={post.image.imageUrl}
          alt={post.image.description}
          fill
          className="object-cover"
          data-ai-hint={post.image.imageHint}
          priority
        />
      </div>

      <div
        className="prose prose-lg max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      
      <Separator className="my-8" />
      
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <SocialShare post={post} />
      </div>

      <Separator className="my-8" />

      <CommentSection
        isLoggedIn={!!user}
        username={user?.value || ''}
      />
    </article>
  );
}
