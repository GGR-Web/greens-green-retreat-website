
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';

export interface Post {
    id: string;
    title: string;
    author: string;
    status: 'draft' | 'published';
    createdAt: string;
}

const postFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  content: z.string().min(10, 'Content must be at least 10 characters.'),
  author: z.string().min(2, 'Author name is required.'),
  status: z.enum(['draft', 'published']),
  slug: z.string().min(3, 'Slug must be at least 3 characters.'),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters.'),
  featuredImageUrl: z.string().url('Must be a valid URL.'),
});

type PostFormInput = z.infer<typeof postFormSchema>;

export async function getPosts(): Promise<{ posts?: Post[], error?: string }> {
    if (!adminDb) {
        return { error: 'Database not initialized.' };
    }

    try {
        const postsSnapshot = await adminDb.collection('journal').orderBy('createdAt', 'desc').get();

        if (postsSnapshot.empty) {
            return { posts: [] };
        }

        const posts = postsSnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAtDate = (data.createdAt as Timestamp)?.toDate();
            return {
                id: doc.id,
                title: data.title || 'Untitled Post',
                author: data.author || 'Unknown Author',
                status: data.status || 'draft',
                createdAt: createdAtDate ? createdAtDate.toLocaleDateString() : 'N/A',
            };
        });
        
        return { posts };
    } catch (error: any) {
        console.error("Error fetching posts:", error);
        return { error: error.message || "An unknown error occurred." };
    }
}


export async function createJournalPost(input: PostFormInput): Promise<{ success: boolean; postId?: string; error?: string }> {
    if (!adminDb) {
        return { success: false, error: 'Database connection not available.' };
    }

    const parsedData = postFormSchema.safeParse(input);
    if (!parsedData.success) {
        const errorDetails = parsedData.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return { success: false, error: `Invalid data provided: ${errorDetails}` };
    }
    
    const { title, content, author, status, slug, excerpt, featuredImageUrl } = parsedData.data;

    try {
        const newPostRef = await adminDb.collection('journal').add({
            title,
            content,
            author,
            status,
            slug,
            excerpt,
            featuredImageUrl,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });
        
        revalidatePath('/admin/journal');
        revalidatePath('/journal');
        return { success: true, postId: newPostRef.id };

    } catch (error: any) {
        console.error('Error creating post:', error);
        return { success: false, error: error.message || 'An unexpected error occurred.' };
    }
}

export async function getPost(postId: string) {
    if (!adminDb) return { error: "Database not initialized." };
    try {
        const postDoc = await adminDb.collection('journal').doc(postId).get();
        if (!postDoc.exists) {
            return { error: "Post not found." };
        }
        const data = postDoc.data()!;
        
        return {
            post: {
                id: postDoc.id,
                title: data.title,
                content: data.content,
                author: data.author,
                status: data.status,
                slug: data.slug,
                excerpt: data.excerpt,
                featuredImageUrl: data.featuredImageUrl,
            }
        };
    } catch (error: any) {
        console.error("Error fetching post:", error);
        return { error: error.message || "An unknown error occurred." };
    }
}


export async function updatePost(postId: string, input: PostFormInput): Promise<{ success: boolean; error?: string }> {
    if (!adminDb) {
        return { success: false, error: 'Database connection not available.' };
    }

    const parsedData = postFormSchema.safeParse(input);
    if (!parsedData.success) {
        const errorDetails = parsedData.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return { success: false, error: `Invalid data provided: ${errorDetails}` };
    }

    const { title, content, author, status, slug, excerpt, featuredImageUrl } = parsedData.data;

    try {
        await adminDb.collection('journal').doc(postId).update({
            title,
            content,
            author,
            status,
            slug,
            excerpt,
            featuredImageUrl,
            updatedAt: FieldValue.serverTimestamp(),
        });
        
        revalidatePath('/admin/journal');
        revalidatePath(`/admin/journal/edit/${postId}`);
        revalidatePath('/journal');
        revalidatePath(`/journal/${slug}`);

        return { success: true };

    } catch (error: any) {
        console.error('Error updating post:', error);
        return { success: false, error: error.message || 'An unexpected error occurred.' };
    }
}

export async function deletePost(postId: string): Promise<{ success: boolean; error?: string }> {
    if (!adminDb) {
        return { success: false, error: 'Database not initialized.' };
    }
    if (!postId) {
        return { success: false, error: 'Invalid post ID provided.'};
    }

    try {
        await adminDb.collection('journal').doc(postId).delete();
        revalidatePath('/admin/journal');
        revalidatePath('/journal');
        return { success: true };
    } catch (error: any) {
        console.error(`Error deleting post ${postId}:`, error);
        return { success: false, error: error.message || 'An unknown error occurred.'};
    }
}

export async function updatePostStatus(postId: string, status: 'draft' | 'published'): Promise<{ success: boolean; error?: string }> {
    if (!adminDb) {
        return { success: false, error: 'Database not initialized.' };
    }
    if (!postId || !status) {
        return { success: false, error: 'Invalid input provided.'};
    }

    try {
        await adminDb.collection('journal').doc(postId).update({ status, updatedAt: FieldValue.serverTimestamp() });
        revalidatePath('/admin/journal');
        revalidatePath('/journal');
        // We don't know the slug, so we can't revalidate the specific article page easily
        // A broader revalidation might be needed if slugs can change, but for now this is okay.
        return { success: true };
    } catch (error: any) {
        console.error(`Error updating status for post ${postId}:`, error);
        return { success: false, error: error.message || 'An unknown error occurred.'};
    }
}
