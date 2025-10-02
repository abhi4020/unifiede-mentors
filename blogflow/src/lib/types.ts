import type { ImagePlaceholder } from './placeholder-images';

export type BlogPost = {
  slug: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  content: string;
  image: ImagePlaceholder;
};

export type Comment = {
  id: number;
  author: string;
  text: string;
  timestamp: string;
};
