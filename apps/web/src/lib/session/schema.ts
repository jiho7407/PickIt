import { z } from "zod";

export const anonymousSessionCookieSchema = z.string().uuid();

export const anonymousSessionRowSchema = z.object({
  id: z.string().uuid(),
});
