import type { BlogPost } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const longContent = `
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
<p>Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi. Duis sapien sem, aliquet nec, commodo eget, consequat quis, neque. Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing sapien, sed malesuada diam lacus eget erat. Cras mollis scelerisque nunc. Nullam arcu. Aliquam erat volutpat. Duis ac turpis. Integer rutrum ante eu lacus.</p>
<h2>A Deeper Dive</h2>
<p>Vestibulum libero nisl, porta vel, scelerisque eget, malesuada at, neque. Vivamus eget nibh. Etiam cursus leo vel metus. Nulla facilisi. Aenean nec eros. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Suspendisse sollicitudin velit sed leo. Ut pharetra augue nec augue. Nam elit agna,endrerit sit amet, tincidunt ac, viverra sed, nulla. Donec porta diam eu massa. Quisque diam lorem, interdum vitae,dapibus ac, scelerisque vitae, pede. Donec eget tellus non erat lacinia fermentum. Donec in velit vel ipsum auctor pulvinar. Proin ullamcorper urna et felis.</p>
`;

const posts: BlogPost[] = [
  {
    slug: 'exploring-the-depths-of-javascript',
    title: 'Exploring the depths of Javascript',
    author: 'Jane Doe',
    date: '2024-07-28',
    excerpt: 'Dive deep into the core concepts of Javascript and uncover its hidden powers.',
    content: longContent,
    image: PlaceHolderImages.find((p) => p.id === 'js-depths')!,
  },
  {
    slug: 'a-guide-to-mastering-typescript',
    title: 'A guide to mastering Typescript',
    author: 'John Smith',
    date: '2024-07-25',
    excerpt: 'Your comprehensive roadmap to becoming a Typescript pro, from basic types to advanced patterns.',
    content: longContent,
    image: PlaceHolderImages.find((p) => p.id === 'ts-mastery')!,
  },
  {
    slug: 'the-future-of-ai-and-machine-learning',
    title: 'The future of AI and Machine Learning',
    author: 'AI Enthusiast',
    date: '2024-07-22',
    excerpt: 'Exploring the next wave of innovations in AI and their potential impact on our world.',
    content: longContent,
    image: PlaceHolderImages.find((p) => p.id === 'ai-future')!,
  },
  {
    slug: 'web-application-security-best-practices',
    title: 'Web application security best practices',
    author: 'Secure Coder',
    date: '2024-07-19',
    excerpt: 'Learn how to protect your web applications from common vulnerabilities and attacks.',
    content: longContent,
    image: PlaceHolderImages.find((p) => p.id === 'web-security')!,
  },
];

export const ALL_POST_TITLES = posts.map(p => p.title);

export const getBlogPosts = (): BlogPost[] => posts;

export const getBlogPostBySlug = (slug: string): BlogPost | undefined => {
  return posts.find((p) => p.slug === slug);
};
