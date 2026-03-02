'use server';
/**
 * @fileOverview Provides an AI-generated explanation for a driver assignment, detailing key influencing factors.
 *
 * - dispatchAssignmentExplanation - A function that provides an explanation for a driver assignment.
 * - DispatchAssignmentExplanationInput - The input type for the dispatchAssignmentExplanation function.
 * - DispatchAssignmentExplanationOutput - The return type for the dispatchAssignmentExplanation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DispatchAssignmentExplanationInputSchema = z.object({
  orderId: z.string().describe('The unique identifier of the order.'),
  assignedDriverId: z.string().describe('The unique identifier of the assigned driver.'),
  storeId: z.string().describe('The unique identifier of the store fulfilling the order.'),
  clientAddress: z.string().describe('The delivery address of the client.'),
  storeAddress: z.string().describe('The address of the store.'),
  assignedDriverLocation: z.object({ lat: z.number(), lng: z.number() }).describe('The geographical coordinates (latitude and longitude) of the assigned driver at the time of assignment.'),
  clientLocation: z.object({ lat: z.number(), lng: z.number() }).describe('The geographical coordinates (latitude and longitude) of the client for delivery.'),
  storeLocation: z.object({ lat: z.number(), lng: z.number() }).describe('The geographical coordinates (latitude and longitude) of the store.'),
  assignedDriverAvailabilityStatus: z.string().describe('The availability status of the assigned driver (e.g., "online", "reserved", "offline").'),
  assignedDriverVehicleType: z.string().describe('The type of vehicle used by the assigned driver (e.g., "car", "scooter", "bike").'),
  requiredVehicleTypeForOrder: z.string().optional().describe('If the order requires a specific vehicle type for delivery.'),
  currentTrafficConditions: z.string().describe('General description of current traffic conditions (e.g., "light", "moderate", "heavy").'),
  estimatedTimeToStore: z.string().describe('Estimated time for the assigned driver to reach the store.'),
  estimatedTimeToClient: z.string().describe('Estimated time for the assigned driver to reach the client from the store.'),
  totalEstimatedEta: z.string().describe('Total estimated time of arrival for the order.'),
  otherAvailableDriversInZone: z.array(z.object({
    id: z.string(),
    location: z.object({ lat: z.number(), lng: z.number() }),
    vehicleType: z.string(),
    availability: z.string().optional()
  })).optional().describe('A list of other available drivers in the zone and their details, if any.'),
});
export type DispatchAssignmentExplanationInput = z.infer<typeof DispatchAssignmentExplanationInputSchema>;

const DispatchAssignmentExplanationOutputSchema = z.object({
  explanation: z.string().describe('A clear, concise explanation of the dispatch decision, highlighting key influencing factors.'),
});
export type DispatchAssignmentExplanationOutput = z.infer<typeof DispatchAssignmentExplanationOutputSchema>;

export async function dispatchAssignmentExplanation(input: DispatchAssignmentExplanationInput): Promise<DispatchAssignmentExplanationOutput> {
  return dispatchAssignmentExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dispatchAssignmentExplanationPrompt',
  input: { schema: DispatchAssignmentExplanationInputSchema },
  output: { schema: DispatchAssignmentExplanationOutputSchema },
  prompt: `You are an AI dispatcher assistant providing transparent explanations for driver assignments.
Your task is to analyze the provided information about an order and the assigned driver, then generate a concise explanation of *why* this specific driver was chosen. Focus on key factors like driver proximity to the store and client, their availability, vehicle type suitability for the order, and current traffic conditions, and overall ETA.

Here is the assignment context:
Order ID: {{{orderId}}}
Assigned Driver ID: {{{assignedDriverId}}}
Store ID: {{{storeId}}}
Client Delivery Address: {{{clientAddress}}}
Store Pickup Address: {{{storeAddress}}}
Assigned Driver Current Location: Lat {{{assignedDriverLocation.lat}}}, Lng {{{assignedDriverLocation.lng}}}
Client Location: Lat {{{clientLocation.lat}}}, Lng {{{clientLocation.lng}}}
Store Location: Lat {{{storeLocation.lat}}}, Lng {{{storeLocation.lng}}}
Assigned Driver Availability Status: {{{assignedDriverAvailabilityStatus}}}
Assigned Driver Vehicle Type: {{{assignedDriverVehicleType}}}
{{#if requiredVehicleTypeForOrder}}Required Vehicle Type for Order: {{{requiredVehicleTypeForOrder}}}{{/if}}
Current Traffic Conditions: {{{currentTrafficConditions}}}
Estimated Time for Driver to Store: {{{estimatedTimeToStore}}}
Estimated Time for Driver from Store to Client: {{{estimatedTimeToClient}}}
Total Estimated ETA for Delivery: {{{totalEstimatedEta}}}
{{#if otherAvailableDriversInZone.length}}
Other Available Drivers in Zone Considered:
{{#each otherAvailableDriversInZone}}
- Driver ID: {{this.id}}, Location: (Lat {{this.location.lat}}, Lng {{this.location.lng}}), Vehicle Type: {{this.vehicleType}}, Availability: {{this.availability}}
{{/each}}
{{/if}}

Based on this information, provide a clear explanation for the assignment decision:`,
});

const dispatchAssignmentExplanationFlow = ai.defineFlow(
  {
    name: 'dispatchAssignmentExplanationFlow',
    inputSchema: DispatchAssignmentExplanationInputSchema,
    outputSchema: DispatchAssignmentExplanationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
