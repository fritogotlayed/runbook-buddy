import { Handlers } from '$fresh/server.ts';
import { join } from '$std/url/join.ts';
import { getCookies } from '$std/http/cookie.ts';
import { Button } from '../../components/primatives/Button.tsx';
import {
  CreateTemplateRequestBody,
  type CreateTemplateResponseBody,
} from '../../types/api-interchange.ts';

export const handler: Handlers = {
  async POST(req, ctx) {
    const formData = await req.formData();
    const templateName = formData.get('templateName') as string;
    const templateNotes = formData.get('templateNotes') as string;
    const body: CreateTemplateRequestBody = {
      templateName,
      templateNotes,
    };
    const backendTemplatesUrl = join(
      new URL(
        Deno.env.get('BACKEND_API_BASE_URL') as string,
      ),
      '/templates',
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

    if (response.status === 200) {
      const body: CreateTemplateResponseBody = await response.json();

      const headers = new Headers();
      headers.set('location', `/templates/${body.templateId}`);
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

export default function NewTemplatePage() {
  return (
    <div>
      <h1 class='h1 mb-4'>New Template</h1>
      <form method='POST'>
        <div class='mb-4'>
          <label for='templateName' class='block mb-2'>
            Template Name
          </label>
          <input
            type='text'
            id='templateName'
            name='templateName'
            class='border border-gray-300 rounded px-3 py-2 w-full'
            required
          />
        </div>
        <div class='mb-4'>
          <label for='templateNotes' class='block mb-2'>
            Template Notes
          </label>
          <textarea
            id='templateNotes'
            name='templateNotes'
            class='border border-gray-300 rounded px-3 py-2 w-full'
            required
          />
        </div>
        <Button
          type='submit'
          variant='primary'
        >
          Add
        </Button>
      </form>
    </div>
  );
}
