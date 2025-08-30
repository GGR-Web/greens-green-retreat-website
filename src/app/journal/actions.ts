
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';


export interface PublishedPost {
  id: string;
  title: string;
  excerpt: string;
  featuredImageUrl: string;
  slug: string;
  createdAt: string;
}

export interface Comment {
    id: string;
    name: string;
    comment: string;
    createdAt: string;
}

export interface FullPost extends PublishedPost {
    content: string;
    author: string;
    likeCount: number;
    comments: Comment[];
}


export async function getPublishedPosts(): Promise<{ posts: PublishedPost[], error?: string }> {
  if (!adminDb) {
    return { posts: [], error: "Database not initialized." };
  }
  try {
    const postsSnapshot = await adminDb.collection('journal')
        .where('status', '==', 'published')
        .orderBy('createdAt', 'desc')
        .get();

    if (postsSnapshot.empty) {
      return { posts: [] };
    }

    const posts = postsSnapshot.docs.map(doc => {
      const data = doc.data();
      const createdAtDate = (data.createdAt as Timestamp)?.toDate();
      return {
        id: doc.id,
        title: data.title || 'Untitled Post',
        excerpt: data.excerpt || 'No excerpt available.',
        featuredImageUrl: data.featuredImageUrl || 'https://placehold.co/600x400.png',
        slug: data.slug || doc.id,
        createdAt: createdAtDate ? createdAtDate.toISOString() : new Date().toISOString(),
      };
    });

    return { posts };
  } catch (error: any) {
    console.error("Error fetching published posts:", error);
    return { posts: [], error: error.message || "An unknown error occurred." };
  }
}

async function getComments(postId: string): Promise<Comment[]> {
    if (!adminDb) return [];
    try {
        const commentsSnapshot = await adminDb.collection('journal').doc(postId).collection('comments').orderBy('createdAt', 'asc').get();
        if (commentsSnapshot.empty) {
            return [];
        }
        return commentsSnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAtDate = (data.createdAt as Timestamp)?.toDate();
            return {
                id: doc.id,
                name: data.name,
                comment: data.comment,
                createdAt: createdAtDate ? createdAtDate.toISOString() : new Date().toISOString(),
            };
        });
    } catch (error) {
        console.error(`Error fetching comments for post ${postId}:`, error);
        return []; // Return empty on error
    }
}

export async function getPostBySlug(slug: string): Promise<{ post: FullPost | null, error?: string }> {
    if (!adminDb) {
        return { post: null, error: "Database not initialized." };
    }
     if (!slug) {
        return { post: null, error: "Slug is required." };
    }
    try {
        const postsSnapshot = await adminDb.collection('journal')
            .where('slug', '==', slug)
            .where('status', '==', 'published')
            .limit(1)
            .get();

        if (postsSnapshot.empty) {
            return { post: null, error: "Post not found." };
        }

        const postDoc = postsSnapshot.docs[0];
        const data = postDoc.data();
        const createdAtDate = (data.createdAt as Timestamp)?.toDate();
        
        const comments = await getComments(postDoc.id);

        const post: FullPost = {
            id: postDoc.id,
            title: data.title || 'Untitled Post',
            content: data.content || 'No content available.',
            author: data.author || 'Unknown Author',
            excerpt: data.excerpt || '',
            featuredImageUrl: data.featuredImageUrl || 'https://placehold.co/1200x600.png',
            slug: data.slug || postDoc.id,
            createdAt: createdAtDate ? createdAtDate.toISOString() : new Date().toISOString(),
            likeCount: data.likeCount || 0,
            comments: comments,
        };

        return { post };

    } catch (error: any) {
        console.error("Error fetching post by slug:", error);
        return { post: null, error: error.message || "An unknown error occurred." };
    }
}

export async function incrementLikeCount(postId: string): Promise<{ success: boolean; error?: string }> {
    if (!adminDb) {
        return { success: false, error: 'Database connection not available.' };
    }
    if (!postId) {
        return { success: false, error: 'Invalid post ID provided.' };
    }
    try {
        const postRef = adminDb.collection('journal').doc(postId);
        await postRef.update({
            likeCount: FieldValue.increment(1)
        });
        revalidatePath(`/journal/[slug]`, 'page');
        return { success: true };
    } catch (error: any) {
        console.error(`Error incrementing likes for post ${postId}:`, error);
        return { success: false, error: 'Could not update like count.' };
    }
}


const commentSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  comment: z.string().min(5, { message: "Comment must be at least 5 characters." }),
});

export async function addComment(postId: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
    if (!adminDb) {
        return { success: false, error: 'Database connection not available.' };
    }

    const validatedFields = commentSchema.safeParse({
        name: formData.get('name'),
        comment: formData.get('comment'),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            error: validatedFields.error.flatten().fieldErrors.comment?.[0] || validatedFields.error.flatten().fieldErrors.name?.[0] || "Invalid input.",
        };
    }

    const { name, comment } = validatedFields.data;

    try {
        const postRef = adminDb.collection('journal').doc(postId);
        const commentsRef = postRef.collection('comments');
        await commentsRef.add({
            name,
            comment,
            createdAt: FieldValue.serverTimestamp(),
        });
        
        revalidatePath(`/journal/${postId}`); // Invalidate the page to show the new comment
        return { success: true };

    } catch (error: any) {
        console.error(`Error adding comment to post ${postId}:`, error);
        return { success: false, error: 'Could not submit your comment at this time.' };
    }
}
