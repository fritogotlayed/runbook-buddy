// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  let resp;
  switch (req.method) {
    case 'GET':
      const data = await fetch(`http://localhost:8080/instance/${req.query.instanceId}`)
        .then(res => res.text());
      res.status(200).send(data);
      break;
    case 'DELETE':
      resp = await fetch(`http://localhost:8080/instance/${req.query.instanceId}`, {
        method: 'DELETE',
      });
      res.status(resp.status).send(resp.body);
      break;
    case 'PUT':
      resp = await fetch(`http://localhost:8080/instance/${req.query.instanceId}`, {
        method: 'PUT',
        body: JSON.stringify(req.body),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      res.status(resp.status).send(resp.body);
      break;
    default:
      res.setHeader('Allow', ['GET', 'DELETE', 'PUT'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
      break;
  }
}