import { Handlers, PageProps } from '$fresh/server.ts';
import { Template } from '../../../types/template-data.ts';
import { getTemplateData } from '../../../repos/get-template-data.ts';
import { LinkButton } from '../../../components/primatives/LinkButton.tsx';
import { Button } from '../../../components/primatives/Button.tsx';
import DisplayTemplate from './(_components)/DisplayTemplate.tsx';
import { authenticatedFetch } from '../../../helpers/authenticated-fetch.ts';

interface Data {
  template: Template;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const template = await getTemplateData(req, ctx.params.id);

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
    // TODO: delete
    const authedFetch = authenticatedFetch(req);
    await authedFetch(
      `${Deno.env.get('BACKEND_API_BASE_URL')}/templates/${ctx.params.id}`,
      {
        method: 'DELETE',
      },
    );

    // redirect to /templates
    return new Response('TODO: delete', {
      status: 302,
      headers: {
        Location: '/templates',
      },
    });
  },
};

export default function Delete({ data }: PageProps<Data>) {
  // const templateLineItemSorter = (a: TemplateLineItem, b: TemplateLineItem) => {
  //   // Sort by order index ascending
  //   if (a.templateLineItemOrderIndex < b.templateLineItemOrderIndex) {
  //     return -1;
  //   }
  //   if (a.templateLineItemOrderIndex > b.templateLineItemOrderIndex) {
  //     return 1;
  //   }
  //   return 0;
  // };

  return (
    <div>
      <div>
        <form method='post' style={{ display: 'flex', gap: 4 }}>
          <LinkButton
            variant={'secondary'}
            href={`/templates/${data.template.templateId}`}
          >
            Cancel
          </LinkButton>
          <Button variant={'primary'} type='submit'>Delete</Button>
        </form>
      </div>
      <DisplayTemplate template={data.template} />
    </div>
  );
}
