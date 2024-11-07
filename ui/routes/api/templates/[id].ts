import { Handlers } from '$fresh/server.ts';
import { join } from '$std/url/join.ts';
import { authenticatedFetch } from '../../../helpers/authenticated-fetch.ts';

import { type PutTemplateRequestBody } from '../../../types/api-interchange.ts';

type TemplateLineItem = {
  templateLineItemId?: string | null;
  templateLineItemSummary: string;
  templateLineItemNotes: string;
  templateLineItemOrderIndex: number;
};

type Template = {
  templateId: string;
  templateName: string;
  templateNotes: string;
  templateLineItems: TemplateLineItem[];
};

function cloneLineItem(lineItem: TemplateLineItem): TemplateLineItem {
  return {
    ...lineItem,
    templateLineItemId: lineItem.templateLineItemId?.startsWith('new-item-')
      ? undefined
      : lineItem.templateLineItemId,
  };
}

export const handler: Handlers = {
  async PUT(req) {
    console.log('PUT /api/templates');
    // const url = new URL(req.url);
    const data = await req.json() as Template;
    const headers = new Headers();

    const { templateId } = data;

    const backendAuthUrl = join(
      Deno.env.get('BACKEND_API_BASE_URL') as string,
      '/templates',
      templateId,
    );

    const authedFetch = authenticatedFetch(req);

    const payload: PutTemplateRequestBody = {
      ...data,
      templateLineItems: data.templateLineItems.map(cloneLineItem),
    };

    const putTemplateResponse = await authedFetch(backendAuthUrl, {
      method: 'PUT',
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
