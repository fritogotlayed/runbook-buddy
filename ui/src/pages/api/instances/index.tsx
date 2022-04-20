// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  switch (req.method) {
    case 'GET':
      const data = await fetch('http://localhost:8080/instance')
        .then(res => res.json());
      res.status(200).json(data)
      break;
    case 'POST':
      console.log(req.body)
      const resp = await fetch('http://localhost:8080/instance', {
        method: 'POST',
        body: JSON.stringify(req.body),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      res.status(resp.status).send(resp.body);
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
      break;
  }
}
