
'use server';

import { aiChatbot, AiChatbotInput, AiChatbotOutput } from '@/ai/flows/ai-chatbot-flow';

type ChatHistory = AiChatbotInput['history'];

export async function sendMessage(conversationHistory: ChatHistory): Promise<AiChatbotOutput> {
    
    const latestMessage = conversationHistory[conversationHistory.length - 1];
    if (latestMessage.sender !== 'user') {
        return {
            answer: "An internal error occurred. Please try sending your message again.",
            followUpRequired: false
        };
    }

    const input: AiChatbotInput = { 
        history: conversationHistory.slice(0, -1), // All but the last message
        query: latestMessage.text,
    };
    
    try {
        const response = await aiChatbot(input);
        return response;
    } catch (error) {
        console.error('Error calling AI Chatbot:', error);
        return {
            answer: "I'm sorry, but I'm having trouble connecting to my knowledge base right now. Please try again in a moment.",
            followUpRequired: false
        };
    }
}
