import { Handlers, PageProps } from '$fresh/server.ts';
import { join } from '$std/url/join.ts';
import { getCookies } from '$std/http/cookie.ts';
import { Button } from '../../components/primatives/Button.tsx';
import { getTemplateData } from '../../repos/get-template-data.ts';
import { Template } from '../../types/template-data.ts';
import {
  CreateInstanceRequestBody,
  CreateInstanceResponseBody,
} from '../../types/api-interchange.ts';

interface Data {
  template: Template;
  error?: string;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const templateId = url.searchParams.get('templateId') as string ?? '';
    const template = await getTemplateData(req, templateId);

    if (template) {
      return ctx.render({
        template: template,
      });
    }

    // TODO: Handle error
    return ctx.render({
      template: {
        templateId: '',
        templateName: '',
        templateNotes: '',
        templateLineItems: [],
      },
    });
  },
  async POST(req, ctx) {
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const notes = formData.get('notes') as string;
    const templateId = formData.get('templateId') as string;

    const body: CreateInstanceRequestBody = {
      name: name || undefined,
      notes: notes || undefined,
      templateId,
    };
    const backendTemplatesUrl = join(
      new URL(
        Deno.env.get('BACKEND_API_BASE_URL') as string,
      ),
      '/instances',
    );

    const cookies = getCookies(req.headers);

    const response = await fetch(backendTemplatesUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${cookies.auth}`,
      },
      body: JSON.stringify(body),
    });

    if (response.status === 201) {
      const body: CreateInstanceResponseBody = await response.json();
      console.dir(body);

      const headers = new Headers();
      headers.set('location', `/instances/${body.id}`);
      return new Response(null, {
        status: 303,
        headers,
      });
    }

    return ctx.render({
      error: 'Something went wrong',
    });
  },
};

export default function NewInstancePage({ data }: PageProps<Data>) {
  if (data.error) {
    return (
      <div>
        <h1 class='h1 mb-4'>New Instance</h1>
        <p>{data.error}</p>
      </div>
    );
  }
  return (
    <div>
      <h1 class='h1 mb-4'>New Instance</h1>
      <form method='POST'>
        <input
          type='hidden'
          name='templateId'
          value={data.template.templateId}
        />

        <div class='mb-4'>
          <label for='templateName' class='block mb-2'>
            Name
          </label>
          <input
            type='text'
            id='name'
            name='name'
            placeholder={data.template.templateName}
            class='border border-gray-300 rounded px-3 py-2 w-full'
          />
        </div>
        <div class='mb-4'>
          <label for='templateNotes' class='block mb-2'>
            Summary
          </label>
          <textarea
            id='notes'
            name='notes'
            placeholder={data.template.templateNotes}
            class='border border-gray-300 rounded px-3 py-2 w-full'
          />
        </div>
        <Button
          type='submit'
          variant='primary'
        >
          Create
        </Button>
      </form>
    </div>
  );
}
