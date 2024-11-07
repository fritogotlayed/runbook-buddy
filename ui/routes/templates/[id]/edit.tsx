import { useSignal } from '@preact/signals';
import TemplateEditor from './(_islands)/TemplateEditor.tsx';
import { Handlers, PageProps } from '$fresh/server.ts';
import { Template } from '../../../types/template-data.ts';
import { getTemplateData } from '../../../repos/get-template-data.ts';

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

export default function Edit({ data }: PageProps<Data>) {
  const templateSignal = useSignal(data.template);
  return <TemplateEditor template={templateSignal} />;
}
