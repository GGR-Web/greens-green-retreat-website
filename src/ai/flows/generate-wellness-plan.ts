
'use server';
/**
 * @fileOverview An AI Wellness Expert that crafts personalized plans for guests.
 *
 * - generateWellnessPlan - A function that handles the generation of personalized wellness plans.
 * - GenerateWellnessPlanInput - The input type for the generateWellnessPlan function.
 * - GenerateWellnessPlanOutput - The return type for the generateWellnessPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getKnowledgeBase } from '@/app/admin/knowledge-base/actions';
import { getAiSettings } from '@/app/admin/settings/actions';

const GenerateWellnessPlanInputSchema = z.object({
  userRequest: z
    .string()
    .describe("The user's request for their stay, e.g., 'I'm staying for 3 days and want to relax'"),
});
export type GenerateWellnessPlanInput = z.infer<typeof GenerateWellnessPlanInputSchema>;

const GenerateWellnessPlanOutputSchema = z.object({
  wellnessPlan: z
    .string()
    .describe('The personalized wellness plan generated for the guest.'),
});
export type GenerateWellnessPlanOutput = z.infer<typeof GenerateWellnessPlanOutputSchema>;


const prompt = ai.definePrompt({
  name: 'generateWellnessPlanPrompt',
  input: {schema: z.object({
    knowledgeBaseContent: z.string(),
    focus: z.string().optional(),
    format: z.string().optional(),
    instruction: z.string().optional(),
    userRequest: z.string(),
  })},
  output: {schema: GenerateWellnessPlanOutputSchema},
  system: `You are an AI Wellness Expert for Green's Green Retreat. Your role is to craft personalized tips and simple itineraries to help guests make the most of their stay.

    **Instructions:**
    1.  Analyze the user's request.
    {{#if focus}}
    2.  Use the Primary Focus setting ('{{{focus}}}') to guide your recommendations.
    {{/if}}
    3.  Use the available activities and information from the KNOWLEDGE BASE to create your suggestions.
    {{#if format}}
    4.  Format your response according to the Output Format setting ('{{{format}}}').
    {{/if}}
    {{#if instruction}}
    5.  Always incorporate the Custom Instruction ('{{{instruction}}}').
    {{/if}}
    6.  Your tone must be consistent with the retreat's brand: warm, inviting, and knowledgeable.

    **KNOWLEDGE BASE:**
    {{{knowledgeBaseContent}}}`,
    prompt: `Guest Request: {{{userRequest}}}

Wellness Plan:`,
});

const generateWellnessPlanFlow = ai.defineFlow(
  {
    name: 'generateWellnessPlanFlow',
    inputSchema: GenerateWellnessPlanInputSchema,
    outputSchema: GenerateWellnessPlanOutputSchema,
  },
  async ({ userRequest }) => {
    const [knowledgeBaseContent, aiSettings] = await Promise.all([
        getKnowledgeBase(),
        getAiSettings()
    ]);
    
    const { wellnessExpertSettings } = aiSettings;

    const {output} = await prompt({
        userRequest,
        knowledgeBaseContent,
        focus: wellnessExpertSettings?.primaryFocus,
        format: wellnessExpertSettings?.outputFormat,
        instruction: wellnessExpertSettings?.customInstruction,
    });
    
    return { wellnessPlan: output!.wellnessPlan };
  }
);


export async function generateWellnessPlan(
  input: GenerateWellnessPlanInput
): Promise<GenerateWellnessPlanOutput> {
  return generateWellnessPlanFlow(input);
}
