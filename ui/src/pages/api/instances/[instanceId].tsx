// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import config from 'config';
import type { NextApiRequest, NextApiResponse } from 'next';
import { BackingApiConfig, FetchOptions, RequestMethodError } from '../common';

function getFetchOptions(req: NextApiRequest): FetchOptions {
  const backingApi = config.get<BackingApiConfig>('backingApi');
  switch (req.method) {
    case 'GET':
      return {
        info: `${backingApi.urlRoot}/instance/${
          req.query.instanceId as string
        }`,
        init: undefined,
      };
    case 'DELETE':
      return {
        info: `${backingApi.urlRoot}/instance/${
          req.query.instanceId as string
        }`,
        init: {
          method: 'DELETE',
        },
      };
    case 'PUT':
      return {
        info: `${backingApi.urlRoot}/instance/${
          req.query.instanceId as string
        }`,
        init: {
          method: 'PUT',
          body: JSON.stringify(req.body),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      };
    default:
      throw new RequestMethodError(
        `Method ${req.method || 'N/A'} Not Allowed`,
        undefined,
        ['GET', 'DELETE', 'PUT'],
      );
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const options = getFetchOptions(req);
    const resp = await fetch(options.info, options.init);
    res.status(resp.status).send(resp.body);
  } catch (err: unknown) {
    if (err instanceof RequestMethodError) {
      res.setHeader('Allow', err.methods);
      res.status(405).end(err.message);
    } else {
      throw err;
    }
  }
}
