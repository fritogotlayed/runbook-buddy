import { Handlers, PageProps } from '$fresh/server.ts';
import { join } from '$std/url/join.ts';
import { authenticatedFetch } from '../../helpers/authenticated-fetch.ts';
import { CardWithTitle } from '../../components/primatives/CardWithTitle.tsx';
import { type ListInstanceRequestBody } from '../../types/api-interchange.ts';

interface Data {
  instances: ListInstanceRequestBody;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const authedFetch = authenticatedFetch(req);

    const backendInstancesUrl = join(
      Deno.env.get('BACKEND_API_BASE_URL') as string,
      '/instances',
    );
    const instancesResponse = await authedFetch(backendInstancesUrl, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
      },
    });

    if (instancesResponse.status === 200) {
      const instances: ListInstanceRequestBody = await instancesResponse.json();
      return ctx.render({
        instances,
      });
    }

    // TODO: Handle error
    return ctx.render({
      instances: [],
    });
  },
};

export default function InstancePage({ data }: PageProps<Data>) {
  type instanceFragment = { name: string };
  const instanceSorter = (a: instanceFragment, b: instanceFragment) => {
    // Sort by the instance name descending, case-insensitive
    if (
      a.name.toLocaleUpperCase() < b.name.toLocaleUpperCase()
    ) return -1;
    if (
      a.name.toLocaleUpperCase() > b.name.toLocaleUpperCase()
    ) return 1;
    return 0;
  };

  return (
    <div>
      <div>
        <h1 class='text-xl font-semibold mb-4'>Instances</h1>
        <p>
          You can create new instances by viewing a template and clicking the
          "Create Instance" button.
        </p>
      </div>
      <div class='m-2'>
        <ul class='flex flex-wrap gap-4 flex-row'>
          {data.instances.sort(instanceSorter).map((instance) => (
            <li key={instance.id}>
              <a
                data-tooltip-target={`tooltip-${instance.id}`}
                href={`/instances/${instance.id}`}
              >
                <CardWithTitle title={instance.name} class='m-4'>
                  <>
                    {instance.notes}
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
