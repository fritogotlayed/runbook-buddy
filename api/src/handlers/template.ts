import {
  FastifyInstance,
  FastifyLoggerInstance,
  FastifyPluginOptions,
} from 'fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { readdir } from 'fs';
import { promisify } from 'util';
import { readFileContents, removeFile, writeFileContents } from '../utils';
import {
  CreateTemplateRequestBody,
  CreateTemplateRequestBodySchema,
  IDeleteTemplateRequestUrl,
  IGetTemplateByIdRequestUrl,
  IPutTemplateRequestUrl,
  PutTemplateRequestBody,
  PutTemplateRequestBodySchema,
} from '../schemas';

type DoneCallback = () => void;

export default function registerRoutes(
  server: FastifyInstance<
    Server,
    IncomingMessage,
    ServerResponse,
    FastifyLoggerInstance
  >,
  opts: FastifyPluginOptions,
  done: DoneCallback,
) {
  server.get('/', {}, async () => {
    // TODO: make configuration based
    // TODO: Implement pagination and search api

    try {
      const data = await promisify(readdir)(__dirname + '/../../data');
      const extension = '.template.json';
      return {
        results: data
          .filter((val) => val.endsWith(extension))
          .map((val) => val.substring(0, val.length - extension.length)),
      };
    } catch (err) {
      console.dir(err);
      throw err;
    }
  });

  server.get<{
    Params: IGetTemplateByIdRequestUrl;
  }>('/:id', {}, async (req) => {
    const { id } = req.params;

    try {
      const filePath = __dirname + '/../../data/' + id + '.template.json';
      const data = await readFileContents(filePath);
      return data;
    } catch (err) {
      console.dir(err);
      throw { status: 404, message: 'Not Found' };
    }
  });

  server.post<{
    Body: CreateTemplateRequestBody;
  }>(
    '/',
    {
      schema: {
        body: CreateTemplateRequestBodySchema,
        response: {
          200: CreateTemplateRequestBodySchema,
        },
      },
    },
    async (req, resp) => {
      const { name, content } = req.body;
      try {
        const filePath = __dirname + '/../../data/' + name + '.template.json';
        await writeFileContents(filePath, content, false);
        await resp.send({ name, content });
      } catch (err) {
        console.dir(err);
        throw { status: 500, message: 'Something went wrong!' };
      }
    },
  );

  server.put<{
    Body: PutTemplateRequestBody;
    Params: IPutTemplateRequestUrl;
  }>(
    '/:id',
    {
      schema: {
        body: PutTemplateRequestBodySchema,
        response: {
          200: CreateTemplateRequestBodySchema,
        },
      },
    },
    async (req, resp) => {
      const { id } = req.params;
      const { content } = req.body;
      try {
        const filePath = __dirname + '/../../data/' + id + '.template.json';
        await writeFileContents(filePath, content, true);
        await resp.send({ name: id, content });
      } catch (err) {
        console.dir(err);
        throw { status: 500, message: 'Something went wrong!' };
      }
    },
  );

  server.delete<{
    Params: IDeleteTemplateRequestUrl;
  }>('/:id', {}, async (req, resp) => {
    const { id } = req.params;
    try {
      const filePath = __dirname + '/../../data/' + id + '.template.json';
      await removeFile(filePath);
      await resp.code(204).send();
    } catch (err) {
      console.dir(err);
      throw { status: 500, message: 'Something went wrong!' };
    }
  });

  done();
}
