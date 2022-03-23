import { FastifyInstance, FastifyLoggerInstance, FastifyPluginOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { readdir } from "fs";
import { promisify } from "util";
import { readFileContents, removeFile, writeFileContents } from "../utils";

interface IGetTemplateByIdRequestUrl {
  id: string;
}

interface ICreateTemplateRequestBody {
  name: string;
  content: string;
}

interface IPutTemplateRequestUrl {
  id: string;
}

interface IPutTemplateRequestBody {
  content: string;
}

interface IDeleteTemplateRequestUrl {
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
        const extension = '.template';
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
    Params: IGetTemplateByIdRequestUrl
  }>(
    '/:id',
    {},
    async (req) => {
      const { id } = req.params;

      try {
        const filePath = __dirname + '/../../data/' + id + '.template';
        const data = await readFileContents(filePath);
        return data;
      } catch (err) {
        console.dir(err);
        return { status: 404, message: 'Not Found' };
      }
    }
  )

  server.post<{
    Body: ICreateTemplateRequestBody
  }>(
    '/',
    {},
    async (req, resp) => {
      const { name, content } = req.body;
      try {
        const filePath = __dirname + '/../../data/' + name + '.template';
        await writeFileContents(filePath, content, false);
        return { name, content };
      } catch (err) {
        console.dir(err);
        return { status: 500, message: 'Something went wrong!' };
      }
    }
  )

  server.put<{
    Body: IPutTemplateRequestBody
    Params: IPutTemplateRequestUrl
  }>(
    '/:id',
    {},
    async (req, resp) => {
      const { id } = req.params;
      const { content } = req.body;
      try {
        const filePath = __dirname + '/../../data/' + id + '.template';
        await writeFileContents(filePath, content, true);
        return { name: id, content };
      } catch (err) {
        console.dir(err);
        return { status: 500, message: 'Something went wrong!' };
      }
    }
  )

  server.delete<{
    Params: IDeleteTemplateRequestUrl
  }>(
    '/:id',
    {},
    async (req, resp) => {
      const { id } = req.params;
      try {
        const filePath = __dirname + '/../../data/' + id + '.template';
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