
'use server';

/**
 * @fileOverview A file that provides wellness tips.
 */

import {z} from 'genkit';
import { generateWellnessPlan } from './generate-wellness-plan';


const GenerateWellnessTipsInputSchema = z.object({
  userRequest: z
    .string()
    .describe("The user's request for their stay, e.g., 'I'm staying for 3 days and want to relax'"),
});
export type GenerateWellnessTipsInput = z.infer<
  typeof GenerateWellnessTipsInputSchema
>;

const GenerateWellnessTipsOutputSchema = z.object({
  personalizedWellnessTips: z
    .string()
    .describe('The personalized wellness plan generated for the guest.'),
});
export type GenerateWellnessTipsOutput = z.infer<
  typeof GenerateWellnessTipsOutputSchema
>;

export async function generateWellnessTips(
  input: GenerateWellnessTipsInput
): Promise<GenerateWellnessTipsOutput> {
  const result = await generateWellnessPlan(input);
  return { personalizedWellnessTips: result.wellnessPlan };
}
