import { join } from '$std/path/join.ts';
import { authenticatedFetch } from '../helpers/authenticated-fetch.ts';
import { GetInstanceByIdResponseBody } from '../types/api-interchange.ts';

export async function getInstanceData(
  req: Request,
  id: string,
) {
  const authedFetch = authenticatedFetch(req);

  const backendInstanceUrl = join(
    Deno.env.get('BACKEND_API_BASE_URL') as string,
    `/instances/${id}/`,
  );
  const instancesResponse = await authedFetch(backendInstanceUrl, {
    method: 'GET',
  });

  if (instancesResponse.status === 404) return null;

  if (instancesResponse.status === 200) {
    return (await instancesResponse.json()) as GetInstanceByIdResponseBody;
  }

  // TODO: Handle error
  throw new Error('Failed to get template data');
}
