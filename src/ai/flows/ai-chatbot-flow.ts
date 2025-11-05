'use server';
import 'server-only';
/**
 * @fileOverview An AI chatbot that can answer guest questions about the retreat and capture leads.
 *
 * - aiChatbot - A function that handles the chatbot conversation.
 * - AiChatbotInput - The input type for the aiChatbot function.
 * - AiChatbotOutput - The return type for the aiChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {adminDb} from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getKnowledgeBase } from '@/app/admin/knowledge-base/actions';
import { getAiSettings } from '@/app/admin/settings/actions';


const createLeadTool = ai.defineTool(
    {
        name: 'createLead',
        description: "Use this tool when the user provides their name and email for a follow-up. Saves the user's contact information and the conversation history to the database.",
        inputSchema: z.object({
            name: z.string().describe("The user's full name."),
            email: z.string().describe("The user's email address."),
            conversation: z.string().describe("The recent conversation history with the user, stringified."),
        }),
        outputSchema: z.object({
            success: z.boolean(),
        }),
    },
    async ({ name, email, conversation }) => {
        if (!adminDb) {
            throw new Error('Database not initialized.');
        }
        try {
            await adminDb.collection('leads').add({
                name,
                email,
                conversation,
                status: 'new',
                createdAt: FieldValue.serverTimestamp(),
            });
            return { success: true };
        } catch (error) {
            console.error("Error creating lead:", error);
            return { success: false };
        }
    }
);


const AiChatbotInputSchema = z.object({
  history: z.array(z.object({
    sender: z.enum(['user', 'ai']),
    text: z.string(),
  })).describe('The history of the conversation so far.'),
  query: z.string().describe('The latest user query.')
});
export type AiChatbotInput = z.infer<typeof AiChatbotInputSchema>;

const AiChatbotOutputSchema = z.object({
  answer: z.string().describe("The helpful and encouraging answer to the user's question. This can be a direct answer, a clarifying question, or a request for follow-up details if the user's question cannot be answered."),
  followUpRequired: z.boolean().describe("Set to true ONLY if you cannot answer the user's question with the available information or if the question is unrelated to the retreat. In this case, the 'answer' field should ask for the user's name and email."),
});
export type AiChatbotOutput = z.infer<typeof AiChatbotOutputSchema>;

const prompt = ai.definePrompt({
   name: 'aiChatbotPrompt',
   system: `You must be able to understand and respond in multiple languages. If a user asks a question in a language other than English, you must provide the answer in that same language.\n \nYou are a virtual assistant for Green's Green Retreat, a nature sanctuary in Tigoni, Kenya. \nYour goal is to answer guest questions accurately and encourage them to book a stay.\n \n**PERSONALITY & GOAL:**\n{{#if chatbotTone}}Your personality and tone should be: {{{chatbotTone}}}.{{/if}}\n{{#if chatbotGoal}}Your primary goal is: {{{chatbotGoal}}}.{{/if}}\n \nYou must answer questions based ONLY on the following information. Do not invent details. If the answer is not in this information, say that you do not have the answer and offer to capture their contact details for a team member to follow up.\n \n**KNOWLEDGE BASE:**\n{{{knowledgeBase}}}\n \n- If a user's question cannot be answered with the KNOWLEDGE BASE, you MUST set 'followUpRequired' to true and respond with: "{{{chatbotLeadPrompt}}}"\n- If the user provides their name and email after you have asked for it, you MUST use the 'createLead' tool to save their information. The conversation history MUST be passed to the tool as a string. Your response to the user should be: "Thank you! A member of our team will be in touch with you shortly."\n- Do not ask for contact information unless you cannot answer the question.\n- Do not use the createLead tool unless the user has provided their contact details.`,
  tools: [createLeadTool],
  input: {
    schema: z.object({
      conversationHistory: z.string(),
      query: z.string(),
      knowledgeBase: z.string(),
      chatbotTone: z.string().optional(),
      chatbotGoal: z.string().optional(),
      chatbotLeadPrompt: z.string().optional(),
    }),
  },
  output: { schema: AiChatbotOutputSchema },
  prompt: `Conversation History:\n{{{conversationHistory}}}\n\nUser: {{{query}}}\nAI:`,
});


const aiChatbotFlow = ai.defineFlow(
  {
    name: 'aiChatbotFlow',
    inputSchema: AiChatbotInputSchema,
    outputSchema: AiChatbotOutputSchema,
  },
  async (input) => {
    try {
        const [knowledgeBase, aiSettings] = await Promise.all([
            getKnowledgeBase(),
            getAiSettings()
        ]);
        
        const conversationHistory = input.history.map(
          (msg) => `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.text}`
        ).join('\n');
        
        const defaultLeadPrompt = "I'm sorry, I can't seem to find the answer to that. I'd be happy to have a member of our team get back to you. What is your name and email address?";

        const llmResponse = await prompt({
          conversationHistory,
          query: input.query,
          knowledgeBase,
          chatbotTone: aiSettings.chatbotTone,
          chatbotGoal: aiSettings.chatbotGoal,
          chatbotLeadPrompt: aiSettings.chatbotLeadPrompt || defaultLeadPrompt,
        });
        const output = llmResponse.output;

        if (!output) {
            return {
              answer: "I'm sorry, I couldn't generate a response at this time. Please try again later.",
              followUpRequired: false,
            };
        }

        // Log the interaction to Firestore
        if (adminDb) {
            adminDb.collection('chatLogs').add({
                userQuery: input.query,
                aiResponse: output.answer,
                timestamp: FieldValue.serverTimestamp(),
                history: conversationHistory, // Log context
            }).catch(console.error); // Log errors but don't block response
        }
        
        return {
          answer: output.answer,
          followUpRequired: output.followUpRequired,
        };
    } catch (error) {
        console.error("Error in aiChatbotFlow:", error);
        return {
            answer: "I'm having some technical difficulties at the moment. Please try again shortly.",
            followUpRequired: false
        };
    }
  }
);


export async function aiChatbot(input: AiChatbotInput): Promise<AiChatbotOutput> {
  return aiChatbotFlow(input);
}
