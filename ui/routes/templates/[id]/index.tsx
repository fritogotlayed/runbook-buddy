import { Handlers, PageProps } from '$fresh/server.ts';
import { Template } from '../../../types/template-data.ts';
import { getTemplateData } from '../../../repos/get-template-data.ts';
import { LinkButton } from '../../../components/primatives/LinkButton.tsx';
import DisplayTemplate from './(_components)/DisplayTemplate.tsx';

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
};

export default function TemplatesPage({ data }: PageProps<Data>) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 4 }}>
        <LinkButton href={`/templates/${data.template.templateId}/edit`}>
          Edit
        </LinkButton>

        <LinkButton
          href={`/instances/create?templateId=${data.template.templateId}`}
        >
          Create Instance
        </LinkButton>

        <LinkButton href={`/templates/${data.template.templateId}/delete`}>
          Delete
        </LinkButton>
      </div>
      <DisplayTemplate template={data.template} />
    </div>
  );
}
