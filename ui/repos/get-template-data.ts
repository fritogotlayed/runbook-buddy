import { join } from '$std/path/join.ts';
import { authenticatedFetch } from '../helpers/authenticated-fetch.ts';
import { type Template } from '../types/template-data.ts';

export async function getTemplateData(
  req: Request,
  templateId: string,
) {
  const authedFetch = authenticatedFetch(req);

  const backendTemplateUrl = join(
    Deno.env.get('BACKEND_API_BASE_URL') as string,
    `/templates/${templateId}/`,
  );
  const templateResponse = await authedFetch(backendTemplateUrl, {
    method: 'GET',
  });

  if (templateResponse.status === 404) return null;

  if (templateResponse.status === 200) {
    return (await templateResponse.json()) as Template;
  }

  // TODO: Handle error
  throw new Error('Failed to get template data');
}
