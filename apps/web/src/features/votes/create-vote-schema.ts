import { z } from "zod";
import { LIFE_STAGE_OPTIONS } from "@/features/onboarding/onboarding-trigger";

export const CREATE_VOTE_CATEGORIES = LIFE_STAGE_OPTIONS.map((option) => ({
  label: option.label,
  value: option.value,
}));

const categoryValues = CREATE_VOTE_CATEGORIES.map((option) => option.value) as [
  string,
  ...string[],
];

const priceSchema = z.coerce.number().int().positive();
const optionalImagePathSchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional();
const optionalTitleSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim().length === 0 ? undefined : value),
  z.string().trim().min(2).max(80).optional(),
);

export const voteTypeSchema = z.enum(["buy_skip", "ab"]);

export const buySkipCreateVoteSchema = z.object({
  voteType: z.literal("buy_skip"),
  title: optionalTitleSchema,
  productName: z.string().trim().min(1).max(80),
  price: priceSchema,
  category: z.enum(categoryValues),
  situation: z.string().trim().min(10).max(1000),
  imagePath: optionalImagePathSchema,
});

export const abCreateVoteSchema = z.object({
  voteType: z.literal("ab"),
  title: optionalTitleSchema,
  optionAName: z.string().trim().min(1).max(80),
  optionBName: z.string().trim().min(1).max(80),
  optionAPrice: priceSchema,
  optionBPrice: priceSchema,
  optionAImagePath: optionalImagePathSchema,
  optionBImagePath: optionalImagePathSchema,
  situation: z.string().trim().min(10).max(1000),
});

export const createVoteSchema = z.discriminatedUnion("voteType", [
  buySkipCreateVoteSchema,
  abCreateVoteSchema,
]);

export type CreateVoteInput = z.infer<typeof createVoteSchema>;
export type CreateVoteType = z.infer<typeof voteTypeSchema>;

export function buildDilemmaTitle(input: Pick<CreateVoteInput, "title" | "situation">) {
  const explicitTitle = input.title?.trim();
  if (explicitTitle) {
    return explicitTitle.slice(0, 80);
  }
  return input.situation.trim().slice(0, 80);
}
