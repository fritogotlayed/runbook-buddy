import { Handlers, PageProps } from '$fresh/server.ts';
import { join } from '$std/url/join.ts';
import { authenticatedFetch } from '../../helpers/authenticated-fetch.ts';
import { CardWithTitle } from '../../components/primatives/CardWithTitle.tsx';
import { LinkButton } from '../../components/primatives/LinkButton.tsx';
import { type ListTemplateRequestBody } from '../../types/api-interchange.ts';

interface Data {
  templates: ListTemplateRequestBody;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const authedFetch = authenticatedFetch(req);

    const backendTemplatesUrl = join(
      Deno.env.get('BACKEND_API_BASE_URL') as string,
      '/templates',
    );
    const templatesResponse = await authedFetch(backendTemplatesUrl, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
      },
    });

    if (templatesResponse.status === 200) {
      const templates: ListTemplateRequestBody = await templatesResponse.json();
      return ctx.render({
        templates,
      });
    }

    // TODO: Handle error
    return ctx.render({
      templates: [],
    });
  },
  /*
  async POST(req, ctx) {
    const url = new URL(req.url);
    const data = await req.formData();
    const headers = new Headers();

    const [username, password] = [data.get('username'), data.get('password')];

    const backendAuthUrl = join(
      Deno.env.get('BACKEND_API_BASE_URL') as string,
      '/register',
    );

    console.log('sending request to backend');
    const authResponse = await fetch(backendAuthUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    console.log('got response from backend');
    console.log(authResponse);

    if (authResponse.status === 201) {
      const authBody = await authResponse.json();
      setCookie(
        headers,
        {
          name: 'auth',
          value: authBody.userId,
          maxAge: 60 * 60, // seconds
          sameSite: 'Strict',
          domain: url.hostname,
          path: '/',
          secure: true,
        },
      );

      headers.set('location', req.headers.get('referer') ?? '/');
      return new Response(null, {
        status: 302,
        headers,
      });
    }

    const errorMessage = await authResponse.json();
    console.log('error message', errorMessage);
    return ctx.render({
      errorMessage: errorMessage.error,
    });
  },
    */
};

export default function TemplatesPage({ data }: PageProps<Data>) {
  type templateFragment = { templateName: string };
  const templateSorter = (a: templateFragment, b: templateFragment) => {
    // Sort by the templateName descending, case-insensitive
    if (
      a.templateName.toLocaleUpperCase() < b.templateName.toLocaleUpperCase()
    ) return -1;
    if (
      a.templateName.toLocaleUpperCase() > b.templateName.toLocaleUpperCase()
    ) return 1;
    return 0;
  };

  return (
    <div>
      <div>
        <h1 class='text-xl font-semibold mb-4'>Templates</h1>
        <LinkButton href='/templates/new'>Create New Template</LinkButton>
      </div>
      <div class='m-2'>
        <ul class='flex flex-wrap gap-4 flex-row'>
          {data.templates.sort(templateSorter).map((template) => (
            <li key={template.templateId}>
              <a
                data-tooltip-target={`tooltip-${template.templateId}`}
                href={`/templates/${template.templateId}`}
              >
                <CardWithTitle title={template.templateName} class='m-4'>
                  <>
                    {template.templateNotes}
                  </>
                </CardWithTitle>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
