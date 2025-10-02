'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Comment } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import Link from 'next/link';

type CommentSectionProps = {
  isLoggedIn: boolean;
  username: string;
};

const initialComments: Comment[] = [
    { id: 1, author: 'Alice', text: 'Great article, very insightful!', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 2, author: 'Bob', text: 'Thanks for sharing this. I learned a lot.', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
];

export function CommentSection({ isLoggedIn, username }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now(),
        author: username,
        text: newComment.trim(),
        timestamp: new Date().toISOString(),
      };
      setComments((prev) => [comment, ...prev]);
      setNewComment('');
    }
  };
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <section className="space-y-8">
      <h2 className="font-headline text-3xl font-bold">Comments ({comments.length})</h2>
      
      {isLoggedIn ? (
        <form onSubmit={handleAddComment} className="space-y-4">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
            className="text-base"
          />
          <Button type="submit" disabled={!newComment.trim()}>
            Post Comment
          </Button>
        </form>
      ) : (
        <div className="rounded-lg border bg-accent/50 p-6 text-center">
            <p className="text-accent-foreground">
                <Button variant="link" asChild className="p-0 text-base"><Link href="/login">Log in</Link></Button> to join the conversation.
            </p>
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-4">
            <Avatar>
              <AvatarFallback>
                {comment.author.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <p className="font-semibold">{comment.author}</p>
                <time className="text-xs text-muted-foreground">
                  {formatTimestamp(comment.timestamp)}
                </time>
              </div>
              <p className="text-muted-foreground">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
