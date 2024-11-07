import { z } from 'npm:zod';

export function validateResponseAgainstSchema<T>(
  schema: z.ZodSchema,
  result: T,
) {
  // if (result instanceof Error) {
  //   return c.json({ error: result.message }, { status });
  // }
  const nodeEnv = Deno.env.get('NODE_ENV')?.toLowerCase().trim();
  const [isDevelopment, isTest] = [
    nodeEnv === 'development',
    nodeEnv === 'test',
  ];

  if (isDevelopment || isTest) {
    const parsed = schema.safeParse(result);
    if (!parsed.success) {
      if (isDevelopment) {
        console.log('----- WARNING -----');
        console.log('Response validation failed');
        console.dir({ issues: parsed.error.issues, data: result }, {
          depth: null,
        });
        console.log('----- WARNING -----');
      } else {
        // const parsed = schema.safeParse(result);
        throw new Error(`Response validation failed`, { cause: parsed.error });
      }
    }
  }

  return result;
}
