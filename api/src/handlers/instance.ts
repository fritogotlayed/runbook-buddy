import {
  FastifyInstance,
  FastifyLoggerInstance,
  FastifyPluginOptions,
} from 'fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { readdir } from 'fs';
import { promisify } from 'util';
import { Static, Type } from '@sinclair/typebox';
import { readFileContents, removeFile, writeFileContents } from '../utils';
import { InstanceItem } from '../schemas/InstanceItem';

interface IGetInstanceByIdRequestUrl {
  id: string;
}

// TODO: Fastify tosses errors presumably because this is recursive
const InstanceTopLevel = Type.Object({
  version: Type.Number(),
  // contents: Type.Array(InstanceItemSchema),
  contents: Type.Array(
    Type.Object({
      completed: Type.Boolean(),
      data: Type.String(),
      children: Type.Array(Type.Any()),
    }),
  ),
});

const CreateInstanceRequestBodySchema = Type.Object({
  name: Type.String(),
  content: InstanceTopLevel,
});
type CreateInstanceRequestBody = Static<typeof CreateInstanceRequestBodySchema>;

interface IPutInstanceRequestUrl {
  id: string;
}

const PutInstanceRequestBodySchema = Type.Object({
  // content: Type.Array(Type.Object({
  //   completed: Type.Boolean(),
  //   data: Type.String(),
  // })),
  version: Type.Number(),
  // contents: Type.Array(InstanceItemSchema),
  contents: Type.Array(
    Type.Object({
      completed: Type.Boolean(),
      data: Type.String(),
      children: Type.Array(Type.Any()),
    }),
  ),
});
type PutInstanceRequestBody = Static<typeof PutInstanceRequestBodySchema>;

interface IDeleteInstanceRequestUrl {
  id: string;
}

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
      const extension = '.instance.json';
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
    Params: IGetInstanceByIdRequestUrl;
  }>('/:id', {}, async (req, res) => {
    const { id } = req.params;

    try {
      const filePath = __dirname + '/../../data/' + id + '.instance.json';
      const data = await readFileContents(filePath);
      await res.type('application/json').send(data);
    } catch (err) {
      console.dir(err);
      return { status: 404, message: 'Not Found' };
    }
  });

  server.post<{
    Body: CreateInstanceRequestBody;
  }>(
    '/',
    {
      schema: {
        body: CreateInstanceRequestBodySchema,
        response: {
          200: CreateInstanceRequestBodySchema,
        },
      },
    },
    async (req, resp) => {
      const { name, content } = req.body;
      try {
        const filePath = __dirname + '/../../data/' + name + '.instance.json';
        await writeFileContents(filePath, JSON.stringify(content), false);
        await resp.send({ name, content });
      } catch (err) {
        console.dir(err);
        return { status: 500, message: 'Something went wrong!' };
      }
    },
  );

  server.put<{
    Body: PutInstanceRequestBody;
    Params: IPutInstanceRequestUrl;
  }>(
    '/:id',
    {
      schema: {
        body: PutInstanceRequestBodySchema,
        response: {
          200: CreateInstanceRequestBodySchema,
        },
      },
    },
    async (req, resp) => {
      const { id } = req.params;
      const { version, contents } = req.body;
      try {
        console.dir(req.headers);
        console.dir({ version, contents });

        const sanitizeMapItem = (item: InstanceItem): InstanceItem => {
          const children = item.children.map((e: InstanceItem) =>
            sanitizeMapItem(e),
          );
          return {
            completed: item.completed,
            data: item.data,
            children,
          };
        };

        const filePath = __dirname + '/../../data/' + id + '.instance.json';
        const sanitizedContent = contents.map((e) => sanitizeMapItem(e));
        await writeFileContents(
          filePath,
          JSON.stringify({ version, contents: sanitizedContent }),
          true,
        );
        await resp.send({ name: id, content: { version, contents } });
      } catch (err) {
        console.dir(err);
        await resp.status(500).send('Something went wrong!');
      }
    },
  );

  server.delete<{
    Params: IDeleteInstanceRequestUrl;
  }>('/:id', {}, async (req, resp) => {
    const { id } = req.params;
    try {
      const filePath = __dirname + '/../../data/' + id + '.instance.json';
      await removeFile(filePath);
      await resp.code(204).send();
    } catch (err) {
      console.dir(err);
      await resp.status(500).send('Something went wrong!');
    }
  });

  done();
}
