import { FastifyInstance, FastifyLoggerInstance, FastifyPluginOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";

import { IQuerystring, IHeaders } from "../common/headers";

export default function registerRoutes(server: FastifyInstance<Server, IncomingMessage, ServerResponse, FastifyLoggerInstance>, opts: FastifyPluginOptions, done: Function) {

  server.get<{
    Querystring: IQuerystring,
    Headers: IHeaders,
  }>(
    '/',
    {

      preValidation: (req, resp, done) => {
        const { username, password } = req.query;
        done(username !== 'admin' ? new Error('Must be admin') : undefined) // only validate admin account
      },
    },
    async (req, resp) => {
      const { username, password } = req.query;
      const customerHeader = req.headers["h-custom"];

      req.log.debug({
        username,
        password,
        customerHeader
      }, 'Auth handler executed');

      return 'logged in!\n';
    }
  );

  done();
};