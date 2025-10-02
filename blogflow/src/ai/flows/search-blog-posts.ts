'use server';

/**
 * @fileOverview This file defines a Genkit flow for searching blog posts using an LLM to understand the search query.
 *
 * - searchBlogPosts - A function that searches blog posts based on the user's query, leveraging an LLM for semantic understanding.
 * - SearchBlogPostsInput - The input type for the searchBlogPosts function.
 * - SearchBlogPostsOutput - The return type for the searchBlogPosts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SearchBlogPostsInputSchema = z.object({
  query: z.string().describe('The user query to search for blog posts.'),
});
export type SearchBlogPostsInput = z.infer<typeof SearchBlogPostsInputSchema>;

const SearchBlogPostsOutputSchema = z.object({
  searchResults: z
    .array(z.string())
    .describe('A list of blog post titles that are relevant to the search query.'),
});
export type SearchBlogPostsOutput = z.infer<typeof SearchBlogPostsOutputSchema>;

export async function searchBlogPosts(input: SearchBlogPostsInput): Promise<SearchBlogPostsOutput> {
  return searchBlogPostsFlow(input);
}

const searchBlogPostsPrompt = ai.definePrompt({
  name: 'searchBlogPostsPrompt',
  input: {schema: SearchBlogPostsInputSchema},
  output: {schema: SearchBlogPostsOutputSchema},
  prompt: `You are an expert blog post search assistant. Given a user's search query, you will return a list of relevant blog post titles.

  Consider the semantic meaning of the query, and return results that are relevant even if the exact keywords are not present in the blog post titles.

  User Query: {{{query}}}

  Blog Post Titles: ["Exploring the depths of Javascript", "A guide to mastering Typescript", "The future of AI and Machine Learning", "Web application security best practices"]

  Relevant Blog Post Titles:`, // Note: This prompt can be improved with a more dynamic source of Blog Post Titles, potentially from a database or CMS.
});

const searchBlogPostsFlow = ai.defineFlow(
  {
    name: 'searchBlogPostsFlow',
    inputSchema: SearchBlogPostsInputSchema,
    outputSchema: SearchBlogPostsOutputSchema,
  },
  async input => {
    const {output} = await searchBlogPostsPrompt(input);
    return output!;
  }
);
