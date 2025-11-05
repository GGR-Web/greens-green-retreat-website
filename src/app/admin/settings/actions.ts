'use server';
import 'server-only';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';


const aiSettingsSchema = z.object({
  chatbotTone: z.string().optional(),
  chatbotGoal: z.string().optional(),
  chatbotLeadPrompt: z.string().optional(),
  contentStyle: z.string().optional(),
  contentAudience: z.string().optional(),
  contentLength: z.string().optional(),
  wellnessExpertSettings: z.object({
    primaryFocus: z.string().optional(),
    outputFormat: z.string().optional(),
    customInstruction: z.string().optional(),
  }).optional(),
});

export type AiSettings = z.infer<typeof aiSettingsSchema>;

const AI_CONFIG_DOC_PATH = 'siteSettings/aiConfig';

export async function getAiSettings(): Promise<AiSettings> {
    if (!adminDb) {
        throw new Error('Database not initialized.');
    }
    try {
        const doc = await adminDb.doc(AI_CONFIG_DOC_PATH).get();
        if (doc.exists) {
            const data = doc.data() as Partial<AiSettings>;
            return {
                chatbotTone: data.chatbotTone || '',
                chatbotGoal: data.chatbotGoal || '',
                chatbotLeadPrompt: data.chatbotLeadPrompt || '',
                contentStyle: data.contentStyle || '',
                contentAudience: data.contentAudience || '',
                contentLength: data.contentLength || '',
                wellnessExpertSettings: {
                    primaryFocus: data.wellnessExpertSettings?.primaryFocus || '',
                    outputFormat: data.wellnessExpertSettings?.outputFormat || '',
                    customInstruction: data.wellnessExpertSettings?.customInstruction || '',
                }
            };
        }
        return {
            chatbotTone: '',
            chatbotGoal: '',
            chatbotLeadPrompt: '',
            contentStyle: '',
            contentAudience: '',
            contentLength: '',
            wellnessExpertSettings: {
                primaryFocus: '',
                outputFormat: '',
                customInstruction: '',
            }
        };
    } catch (error: any) {
        console.error("Error fetching AI settings:", error);
        throw new Error(error.message || "An unknown error occurred.");
    }
}

export async function updateAiSettings(settings: AiSettings): Promise<{ success: boolean; error?: string }> {
    if (!adminDb) {
        return { success: false, error: 'Database not initialized.' };
    }

    const parsedData = aiSettingsSchema.safeParse(settings);
    if (!parsedData.success) {
        const errorDetails = parsedData.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return { success: false, error: `Invalid settings data provided: ${errorDetails}` };
    }

    try {
        await adminDb.doc(AI_CONFIG_DOC_PATH).set(parsedData.data, { merge: true });

        revalidatePath('/admin/settings');
        revalidatePath('/admin/journal/ai-studio');
        revalidatePath('/admin/knowledge-base'); 

        return { success: true };
    } catch (error: any) {
        console.error('Error updating AI settings:', error);
        return { success: false, error: error.message || 'An unknown error occurred.' };
    }
}

export async function getAiToneOfVoice(): Promise<string> {
    try {
        const settings = await getAiSettings();
        const parts = [];
        if (settings.contentStyle) parts.push(`The writing style should be: ${settings.contentStyle}.`);
        if (settings.contentAudience) parts.push(`The target audience is: ${settings.contentAudience}.`);
        if (settings.contentLength) parts.push(`The desired article length is: ${settings.contentLength}.`);
        
        return parts.filter(Boolean).join(' ');
    } catch (error) {
        console.error("Could not get AI Tone of voice, will proceed without it.", error);
        return "";
    }
}
