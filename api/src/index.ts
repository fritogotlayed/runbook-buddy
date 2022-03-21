import fastify from "fastify";
import { Static, Type } from "@sinclair/typebox";

import registerAuthRoutes from "./handlers/auth";

const server = fastify();

const User = Type.Object({
  name: Type.String(),
  mail: Type.Optional(Type.String({ format: "email" })),
});

type UserType = Static<typeof User>;

server.get('/health', async (req, resp) => {
  return 'active\n';
});

server.post<{
  Body: UserType,
  Reply: UserType,
}>(
  "/",
  {
    schema: {
      body: User,
      response: {
        200: User,
      }
    }
  },
  (req, rep) => {
    const { body: user } = req;
    rep.status(200).send(user);
  }
)

server.listen(8080, (err, addr) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`Server listening at ${addr}`);
});

server.register(registerAuthRoutes, { prefix: '/auth' });