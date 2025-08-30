
'use server';

import { adminDb } from '@/lib/firebase-admin';

export interface Cottage {
  id: string;
  name: string;
  excerpt: string;
  featuredImageUrl: string;
  pricePerNight: number;
  slug: string;
}

export async function getCottages(): Promise<{ cottages: Cottage[], error?: string }> {
  if (!adminDb) {
    const errorMessage = "Firebase Admin SDK not initialized. Make sure service account key is set.";
    console.error(errorMessage);
    return { cottages: [], error: errorMessage };
  }
  try {
    const cottagesSnapshot = await adminDb.collection('cottages').orderBy('name').get();
    if (cottagesSnapshot.empty) {
      return { cottages: [] };
    }
    const cottages = cottagesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'Unnamed Cottage',
        excerpt: data.excerpt || 'No description available.',
        featuredImageUrl: data.featuredImageUrl || 'https://placehold.co/600x400.png',
        pricePerNight: data.pricePerNight || 0,
        slug: data.slug || doc.id,
      };
    });
    return { cottages };
  } catch (error: any) {
    console.error("Error fetching cottages:", error);
    return { cottages: [], error: error.message || "An unknown error occurred." };
  }
}
