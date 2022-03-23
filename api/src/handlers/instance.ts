import { FastifyInstance, FastifyLoggerInstance, FastifyPluginOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { readdir } from "fs";
import { promisify } from "util";
import { readFileContents, removeFile, writeFileContents } from "../utils";

interface IInstanceLineItem {
  completed: boolean;
  data: string;
}

interface IGetInstanceByIdRequestUrl {
  id: string;
}

interface ICreateInstanceRequestBody {
  name: string;
  content: Array<IInstanceLineItem>;
}

interface IPutInstanceRequestUrl {
  id: string;
}

interface IPutInstanceRequestBody {
  content: Array<IInstanceLineItem>;
}

interface IDeleteInstanceRequestUrl {
  id: string;
}

export default function registerRoutes(server: FastifyInstance<Server, IncomingMessage, ServerResponse, FastifyLoggerInstance>, opts: FastifyPluginOptions, done: Function) {

  // list all templates
  // get specific template body
  // create template
  // replace/update template
  // remove template
  server.get<{}>(
    '/',
    {},
    async () => {
      // TODO: make configuration based
      // TODO: Implement pagination and search api

      try {
        const data = await promisify(readdir)(__dirname + '/../../data');
        const extension = '.instance';
        return {
          results: data.filter((val) => val.endsWith(extension)).map((val) => val.substring(0, val.length - extension.length))
        };
      } catch (err) {
        console.dir(err);
        throw err;
      }
    }
  );

  server.get<{
    Params: IGetInstanceByIdRequestUrl
  }>(
    '/:id',
    {},
    async (req, res) => {
      const { id } = req.params;

      try {
        const filePath = __dirname + '/../../data/' + id + '.instance';
        const data = await readFileContents(filePath);
        res.type('application/json');
        return data;
      } catch (err) {
        console.dir(err);
        return { status: 404, message: 'Not Found' };
      }
    }
  )

  server.post<{
    Body: ICreateInstanceRequestBody
  }>(
    '/',
    {},
    async (req, resp) => {
      const { name, content } = req.body;
      try {
        const filePath = __dirname + '/../../data/' + name + '.instance';
        await writeFileContents(filePath, JSON.stringify(content), false);
        return { name, content };
      } catch (err) {
        console.dir(err);
        return { status: 500, message: 'Something went wrong!' };
      }
    }
  )

  server.put<{
    Body: IPutInstanceRequestBody
    Params: IPutInstanceRequestUrl
  }>(
    '/:id',
    {},
    async (req, resp) => {
      const { id } = req.params;
      const { content } = req.body;
      try {
        const filePath = __dirname + '/../../data/' + id + '.instance';
        await writeFileContents(filePath, JSON.stringify(content), true);
        return { name: id, content };
      } catch (err) {
        console.dir(err);
        return { status: 500, message: 'Something went wrong!' };
      }
    }
  )

  server.delete<{
    Params: IDeleteInstanceRequestUrl
  }>(
    '/:id',
    {},
    async (req, resp) => {
      const { id } = req.params;
      try {
        const filePath = __dirname + '/../../data/' + id + '.instance';
        await removeFile(filePath);
        resp.code(204);
        return;
      } catch (err) {
        console.dir(err);
        return { status: 500, message: 'Something went wrong!' };
      }
    }
  )

  done();
};