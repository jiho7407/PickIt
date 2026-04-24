import { z } from "zod";

export const createDilemmaSchema = z.object({
  voteType: z.enum(["buy_skip", "ab"]).default("buy_skip"),
  title: z.string().min(2).max(80),
  productName: z.string().min(1).max(80),
  price: z.number().int().positive(),
  category: z.string().min(1).max(40),
  situation: z.string().min(10).max(1000),
  imagePath: z.string().nullable().optional(),
});

export type CreateDilemmaInput = z.infer<typeof createDilemmaSchema>;
