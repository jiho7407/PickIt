import { z } from "zod";

export type FollowupOutcome = "bought" | "skipped";

export const followupOutcomeSchema = z.enum(["bought", "skipped"]);

export const createFollowupSchema = z.object({
  outcome: followupOutcomeSchema,
  satisfactionScore: z.number().int().min(1).max(5).nullable().optional(),
  note: z.string().max(500).nullable().optional(),
});

export type CreateFollowupInput = z.infer<typeof createFollowupSchema>;
