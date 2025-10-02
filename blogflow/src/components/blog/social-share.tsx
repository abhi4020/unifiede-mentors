'use client';

import { Twitter, Facebook, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BlogPost } from '@/lib/types';
import { usePathname } from 'next/navigation';

type SocialShareProps = {
  post: BlogPost;
};

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

export function SocialShare({ post }: SocialShareProps) {
  const pathname = usePathname();
  const url =
    typeof window !== 'undefined'
      ? `${window.location.origin}${pathname}`
      : '';
  const text = `Check out this article: ${post.title}`;

  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
    url
  )}&text=${encodeURIComponent(text)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    url
  )}`;
  const linkedinUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
    url
  )}&title=${encodeURIComponent(post.title)}&summary=${encodeURIComponent(
    post.excerpt
  )}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${text} ${url}`
  )}`;

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium text-muted-foreground">Share this post:</span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          asChild
          aria-label="Share on Twitter"
        >
          <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
            <Twitter className="h-4 w-4" />
          </a>
        </Button>
        <Button
          variant="outline"
          size="icon"
          asChild
          aria-label="Share on Facebook"
        >
          <a href={facebookUrl} target="_blank" rel="noopener noreferrer">
            <Facebook className="h-4 w-4" />
          </a>
        </Button>
        <Button
          variant="outline"
          size="icon"
          asChild
          aria-label="Share on LinkedIn"
        >
          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
            <Linkedin className="h-4 w-4" />
          </a>
        </Button>
        <Button
          variant="outline"
          size="icon"
          asChild
          aria-label="Share on WhatsApp"
        >
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
