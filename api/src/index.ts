import fastify from "fastify";
import fastifyCors from "fastify-cors";

import registerAuthRoutes from "./handlers/auth";
import registerTemplateRoutes from "./handlers/template";
import registerInstanceRoutes from "./handlers/instance";

const server = fastify({ logger: { level: 'trace' } });

server.get('/health', async (req, resp) => {
  return 'active\n';
});

// TODO: Only allow CORS for development
server.register(fastifyCors)

server.register(registerAuthRoutes, { prefix: '/auth' });
server.register(registerTemplateRoutes, { prefix: '/template' });
server.register(registerInstanceRoutes, { prefix: '/instance' });

server.listen(8080, (err, addr) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`Server listening at ${addr}`);
});
