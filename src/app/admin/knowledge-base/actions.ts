'use server';
import 'server-only';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

const KNOWLEDGE_BASE_DOC_PATH = 'siteSettings/knowledgeBase';

export async function getKnowledgeBase(): Promise<string> {
    if (!adminDb) {
        throw new Error('Database not initialized.');
    }
    try {
        const doc = await adminDb.doc(KNOWLEDGE_BASE_DOC_PATH).get();
        if (doc.exists) {
            return doc.data()?.content || '';
        }
        return '';
    } catch (error: any) {
        console.error("Error fetching knowledge base:", error);
        throw new Error(error.message || "An unknown error occurred.");
    }
}

export async function updateKnowledgeBase(content: string): Promise<{ success: boolean; error?: string }> {
    if (!adminDb) {
        return { success: false, error: 'Database not initialized.' };
    }

    try {
        await adminDb.doc(KNOWLEDGE_BASE_DOC_PATH).set({
            content: content,
        }, { merge: true });

        // This revalidation is broad, but necessary as multiple AI agents depend on this data.
        revalidatePath('/admin', 'layout');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating knowledge base:', error);
        return { success: false, error: error.message || 'An unknown error occurred.' };
    }
}
