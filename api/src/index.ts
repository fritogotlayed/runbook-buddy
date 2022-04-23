import fastify from "fastify";
import fastifyCors from "fastify-cors";

import registerTemplateRoutes from "./handlers/template";
import registerInstanceRoutes from "./handlers/instance";
import { ensureDataDirectory } from "./utils";
import { updateDataFiles } from "./dataConverter";

const server = fastify({ logger: { level: 'trace' } });

server.get('/health', async (req, resp) => {
  return 'active\n';
});

// TODO: Only allow CORS for development
server.register(fastifyCors)

server.register(registerTemplateRoutes, { prefix: '/template' });
server.register(registerInstanceRoutes, { prefix: '/instance' });

server.listen(8080, '0.0.0.0', async (err, addr) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  await ensureDataDirectory();
  await updateDataFiles(server.log);

  console.log(`Server listening at ${addr}`);
});
