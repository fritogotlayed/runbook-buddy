import { z } from 'npm:@hono/zod-openapi';

export const ErrorResponseSchema = z.object({
  error: z.string(),
});
