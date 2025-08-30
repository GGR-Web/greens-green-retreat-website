
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { getPublishedPosts } from './actions';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';

const AdPlaceholder = () => (
    <Card className="flex flex-col items-center justify-center bg-muted/50 p-6 text-center h-full">
        <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-widest">Advertisement</h3>
            <p className="text-muted-foreground text-xs">Your ad could be here. Contact us for details.</p>
        </div>
    </Card>
);

export default async function JournalPage() {
  const { posts, error } = await getPublishedPosts();

  if (error) {
    return (
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
            <h1 className="text-2xl font-bold text-destructive">Failed to load articles</h1>
            <p className="text-muted-foreground">{error}</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">From the Journal</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          Insights, stories, and updates from the heart of Green's Green Retreat.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16">
            <p className="text-muted-foreground">No articles have been published yet. Please check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.flatMap((post, index) => {
            const items = [(
                <Card key={post.id} className="overflow-hidden flex flex-col group transition-shadow hover:shadow-xl">
                    <Link href={`/journal/${post.slug}`} className="block">
                        <div className="relative w-full h-56">
                            <Image
                                src={post.featuredImageUrl}
                                alt={`Image for ${post.title}`}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                data-ai-hint="blog post image"
                            />
                        </div>
                    </Link>
                    <CardContent className="p-6 flex flex-col flex-grow">
                        <h3 className="font-headline text-xl font-bold text-primary mb-2 line-clamp-2 leading-tight">
                             <Link href={`/journal/${post.slug}`} className="hover:text-accent transition-colors">{post.title}</Link>
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 flex-grow line-clamp-3">{post.excerpt}</p>
                        <div className="flex justify-between items-center mt-auto text-xs text-muted-foreground">
                            <span>{format(new Date(post.createdAt), "PPP")}</span>
                             <Link href={`/journal/${post.slug}`} className="flex items-center gap-1 font-semibold hover:text-primary transition-colors">
                                Read More <BookOpen className="h-3 w-3" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )];

            // Insert an ad placeholder after every 3rd article (index 2, 5, 8...)
            if ((index + 1) % 3 === 0) {
              items.push(<AdPlaceholder key={`ad-${index}`} />);
            }
            return items;
          })}
        </div>
      )}
    </div>
  );
}

