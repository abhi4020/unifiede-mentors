import { getBlogPosts, ALL_POST_TITLES } from '@/lib/blog-data';
import { BlogPostCard } from '@/components/blog/blog-post-card';
import { Search } from '@/components/blog/search';
import { searchBlogPosts } from '@/ai/flows/search-blog-posts';

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params?.q;
  const allPosts = getBlogPosts();
  let displayedPosts = allPosts;

  let searchResultText = '';

  if (query) {
    const searchResults = await searchBlogPosts({ query });
    const relevantTitles = new Set(searchResults.searchResults);
    displayedPosts = allPosts.filter((post) => relevantTitles.has(post.title));
    searchResultText = `Found ${displayedPosts.length} post${
      displayedPosts.length !== 1 ? 's' : ''
    } for "${query}"`;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-4">
        <h1 className="font-headline text-4xl font-bold">From the Blog</h1>
        <p className="text-lg text-muted-foreground">
          Explore articles on web development, AI, and more.
        </p>
        <Search />
      </div>

      {searchResultText && (
        <p className="mb-8 text-center text-lg font-medium">
          {searchResultText}
        </p>
      )}

      {displayedPosts.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {displayedPosts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h3 className="font-headline text-2xl font-semibold">No Posts Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or check back later.
          </p>
        </div>
      )}
    </div>
  );
}
