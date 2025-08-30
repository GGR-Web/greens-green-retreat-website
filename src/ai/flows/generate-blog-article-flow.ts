
'use server';
/**
 * @fileOverview An AI agent that generates a blog article from a customer review.
 *
 * - generateBlogArticle - A function that handles the generation of the blog article.
 * - GenerateBlogArticleInput - The input type for the generateBlogArticle function.
 * - GenerateBlogArticleOutput - The return type for the generateBlogArticle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getAiToneOfVoice } from '@/app/admin/settings/actions';
import { getKnowledgeBase } from '@/app/admin/knowledge-base/actions';

const GenerateBlogArticleInputSchema = z.object({
  customerReview: z.string().describe('A positive customer review of the retreat.'),
});
export type GenerateBlogArticleInput = z.infer<typeof GenerateBlogArticleInputSchema>;

const GenerateBlogArticleOutputSchema = z.object({
  title: z.string().describe('A catchy, SEO-friendly title for the blog article.'),
  content: z.string().describe('The full content of the blog article, at least 300 words long.'),
});
export type GenerateBlogArticleOutput = z.infer<typeof GenerateBlogArticleOutputSchema>;

export async function generateBlogArticle(
  input: GenerateBlogArticleInput
): Promise<GenerateBlogArticleOutput> {
  return generateBlogArticleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBlogArticlePrompt',
  input: {schema: z.object({
    customerReview: GenerateBlogArticleInputSchema.shape.customerReview,
    toneOfVoice: z.string().optional().describe("A specific tone of voice for the article."),
    knowledgeBase: z.string().describe("The knowledge base of information about the retreat."),
  })},
  output: {schema: GenerateBlogArticleOutputSchema},
  system: `You must be able to understand and respond in multiple languages. If a user asks a question in a language other than English, you must provide the answer in that same language.
  
You are an expert content marketer for Green's Green Retreat, a luxury nature sanctuary in Tigoni, Kenya. Your task is to write a compelling, natural-language blog article (a journal entry) based on a positive customer review.

    **Your Goal:** Generate a winning article that sells, markets, and highlights the unique features of the retreat. You must connect with potential, returning, and previous clients by speaking to their needs, wants, and desires.

    **Process:**
    1.  Identify the key positive themes in the provided \`customerReview\` (e.g., 'peaceful', 'great for families', 'beautiful views').
    2.  Use these themes as the core message of the article.
    3.  Expand on these themes using the specific details from the KNOWLEDGE BASE below to add depth and authenticity.
    4.  The article must have a catchy, SEO-friendly title and be at least 300 words long.
    5.  The tone should be warm, inviting, and inspiring.
    6.  End with a call-to-action inviting readers to book their own stay.

    **KNOWLEDGE BASE:**
    {{{knowledgeBase}}}

    {{#if toneOfVoice}}
**TONE & STYLE GUIDELINES:**
You must adopt the following tone of voice: {{{toneOfVoice}}}
    {{/if}}
    `,
    prompt: `Customer Review:
"{{{customerReview}}}"

Generated Article:`,
});

const generateBlogArticleFlow = ai.defineFlow(
  {
    name: 'generateBlogArticleFlow',
    inputSchema: GenerateBlogArticleInputSchema,
    outputSchema: GenerateBlogArticleOutputSchema,
  },
  async input => {
    const [toneOfVoice, knowledgeBase] = await Promise.all([
        getAiToneOfVoice(),
        getKnowledgeBase()
    ]);

    const {output} = await prompt({ ...input, toneOfVoice, knowledgeBase });
    return output!;
  }
);
