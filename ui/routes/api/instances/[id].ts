import { Handlers } from '$fresh/server.ts';
import { join } from '$std/url/join.ts';
import { authenticatedFetch } from '../../../helpers/authenticated-fetch.ts';
import {
  type GetInstanceByIdResponseBody,
  type PatchInstanceRequestBody,
} from '../../../types/api-interchange.ts';

type Instance = GetInstanceByIdResponseBody;

export const handler: Handlers = {
  async PATCH(req) {
    console.log('PATCH /api/instances');
    // const url = new URL(req.url);
    const data = await req.json() as Instance;
    const headers = new Headers();

    const { id } = data;

    const backendUrl = join(
      Deno.env.get('BACKEND_API_BASE_URL') as string,
      '/instances',
      id,
    );

    const authedFetch = authenticatedFetch(req);

    const payload: PatchInstanceRequestBody = {
      name: data.name,
      notes: data.notes,
      lineItems: data.lineItems.map((li) => ({
        id: li.id,
        notes: li.notes,
        completed: li.completed,
      })),
    };

    const putTemplateResponse = await authedFetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseBody = await putTemplateResponse.text();

    if (putTemplateResponse.status > 399) {
      console.log(responseBody);
    }

    return new Response(responseBody, {
      status: putTemplateResponse.status,
      headers,
    });
  },
};
