'use server';
/**
 * @fileOverview This file implements a Genkit flow to generate AI-suggested draft replies for customer support agents.
 *
 * - generateSupportMessage - A function that generates a draft reply based on conversation history.
 * - SupportMessageGenerationInput - The input type for the generateSupportMessage function.
 * - SupportMessageGenerationOutput - The return type for the generateSupportMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SupportMessageGenerationInputSchema = z.object({
  messageHistory: z.array(
    z.object({
      role: z.enum(['user', 'agent', 'system', 'driver']),
      content: z.string(),
    })
  ).describe('The history of the conversation, including previous messages from the user/customer/driver and the support agent.'),
});
export type SupportMessageGenerationInput = z.infer<typeof SupportMessageGenerationInputSchema>;

const SupportMessageGenerationOutputSchema = z.object({
  draftReply: z.string().describe('A suggested draft reply for the support agent to send.'),
});
export type SupportMessageGenerationOutput = z.infer<typeof SupportMessageGenerationOutputSchema>;

export async function generateSupportMessage(input: SupportMessageGenerationInput): Promise<SupportMessageGenerationOutput> {
  return supportMessageGenerationFlow(input);
}

const supportMessagePrompt = ai.definePrompt({
  name: 'supportMessagePrompt',
  input: {schema: SupportMessageGenerationInputSchema},
  output: {schema: SupportMessageGenerationOutputSchema},
  prompt: `You are an AI assistant helping a customer support agent.
Your goal is to suggest a concise, empathetic, and helpful draft reply based on the provided conversation history.
Do not add any greetings or sign-offs; just provide the body of the reply.

Conversation History:
{{#each messageHistory}}
  {{this.role}}: {{this.content}}
{{/each}}

Based on the above conversation, please suggest a draft reply for the support agent:`,
});

const supportMessageGenerationFlow = ai.defineFlow(
  {
    name: 'supportMessageGenerationFlow',
    inputSchema: SupportMessageGenerationInputSchema,
    outputSchema: SupportMessageGenerationOutputSchema,
  },
  async input => {
    const {output} = await supportMessagePrompt(input);
    return output!;
  }
);
