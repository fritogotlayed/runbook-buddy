import { Handlers, PageProps } from '$fresh/server.ts';
import { useSignal } from '@preact/signals';
import { getInstanceData } from '../../../repos/get-instance-data.ts';
import { GetInstanceByIdResponseBody } from '../../../types/api-interchange.ts';
import InstanceEditor from './(_islands)/InstanceEditor.tsx';

interface Data {
  instance: GetInstanceByIdResponseBody;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const instance = await getInstanceData(req, ctx.params.id);

    if (instance) {
      return ctx.render({
        instance: instance,
      });
    }

    // TODO: Handle error
    return ctx.render({
      instance: {
        id: '',
        name: '',
        notes: '',
        lineItems: [],
      },
    });
  },
};

export default function InstancePage({ data }: PageProps<Data>) {
  const instanceSignal = useSignal(data.instance);
  // return <TemplateEditor template={templateSignal} />;
  return (
    <div>
      <InstanceEditor instance={instanceSignal} />
    </div>
  );
}
