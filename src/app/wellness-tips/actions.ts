
"use server";

import { generateWellnessPlan as generateWellnessPlanFlow, GenerateWellnessPlanInput } from "@/ai/flows/generate-wellness-plan";

export async function generateWellnessPlan(input: GenerateWellnessPlanInput): Promise<{ wellnessPlan?: string; error?: string }> {
  try {
    const result = await generateWellnessPlanFlow(input);
    return { wellnessPlan: result.wellnessPlan };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "Failed to generate wellness plan." };
  }
}
