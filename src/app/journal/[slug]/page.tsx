
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '../actions';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import LikeButton from '../like-button';
import ShareButtons from '../share-buttons';
import CommentSection from '../comment-section';

// Next 15 type compatibility: params must satisfy Promise<any> | undefined
type Params = { slug: string };
type PageProps = {
  params?: Promise<Params>;
};

export default async function JournalArticlePage({ params }: PageProps) {
  // Normalize: await works whether Next gives a promise or a plain object; if undefined, default to {}
  const p: Params = (await (params ?? ({} as any))) as Params;

  const slug = p?.slug;
  if (!slug) notFound();

  // === keep your existing page logic below ===
  const { post, error } = await getPostBySlug(slug);

  if (error || !post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
            <Button asChild variant="outline" size="sm">
                <Link href="/journal">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Journal
                </Link>
            </Button>
        </div>

        <article>
            <header className="mb-8">
                 <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg mb-8">
                    <Image
                        src={post.featuredImageUrl}
                        alt={`Featured image for ${post.title}`}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
                <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4 leading-tight">{post.title}</h1>
                <div className="flex items-center justify-between space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <time dateTime={post.createdAt}>{format(new Date(post.createdAt), 'PPP')}</time>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>By {post.author}</span>
                        </div>
                    </div>
                    <LikeButton postId={post.id} initialLikes={post.likeCount} />
                </div>
            </header>
            
            <div 
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} 
            />

            <ShareButtons post={{ title: post.title, slug: post.slug }} />

            <CommentSection postId={post.id} initialComments={post.comments} />

        </article>
      </div>
    </div>
  );
}
