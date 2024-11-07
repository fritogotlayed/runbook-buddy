import { initializeApp } from './initialize-app.ts';
import { createApp } from './create-app.ts';

if (import.meta.main) {
  const start = Date.now();
  const app = createApp();
  await initializeApp(app);
  Deno.serve({
    port: Number(Deno.env.get('API_HTTP_PORT')) || 8000,
  }, app.fetch);
  console.log(`Server started in ${Date.now() - start}ms`);
}
