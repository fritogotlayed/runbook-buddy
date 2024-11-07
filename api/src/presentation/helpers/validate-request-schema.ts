import { z } from 'npm:zod';
import { Context } from 'hono';

export function validateRequestSchema(schema: z.ZodSchema) {
  return (val: unknown, c: Context) => {
    const parsed = schema.safeParse(val);
    if (!parsed.success) {
      return c.json({ error: { ...parsed.error, name: undefined } }, 400);
    }
    return parsed.data;
  };
}
