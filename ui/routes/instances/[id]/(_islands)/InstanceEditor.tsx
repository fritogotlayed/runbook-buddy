import type { Signal } from '@preact/signals';
import { Input } from '../../../../components/primatives/Input.tsx';
import InstanceLineItemEditor from './InstanceLineItemEditor.tsx';
import { Button } from '../../../../components/primatives/Button.tsx';
import { InputEventWithValue } from '../../../../types/input-event-with-value.ts';
import { useState } from 'preact/hooks';
import type { Instance, InstanceLineItem } from './types.ts';

interface InstanceEditorProps {
  instance: Signal<Instance>;
}

export default function InstanceEditor(props: InstanceEditorProps) {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const triggerRerender = () => {
    console.log('triggerRerender');
    // NOTE: We must replace the entire signal value with a new object to trigger a re-render
    props.instance.value = {
      ...props.instance.value,
    };
  };

  const lineItemSorter = (a: InstanceLineItem, b: InstanceLineItem) => {
    // Sort items by order index
    if (a.orderIndex > b.orderIndex) {
      return 1;
    } else if (a.orderIndex < b.orderIndex) {
      return -1;
    }
    return 0;
  };

  // const createLineItem = (
  //   { summary, notes }: { summary: string; notes: string },
  // ) => {
  //   const templateLineItem: TemplateLineItem = {
  //     templateLineItemId: `new-item-${Date.now()}`,
  //     templateLineItemSummary: summary,
  //     templateLineItemNotes: notes,
  //     templateLineItemOrderIndex: props.template.value.templateLineItems.length,
  //   };
  //   props.template.value.templateLineItems.push(templateLineItem);
  //   triggerRerender();
  // };

  // const reOrderLineItem = (lineItemId: string, direction: number) => {
  //   // Find the line item with the provided id and use the direction to either add one or subtract one from
  //   // the current order index. For the previous and next line items, we need to update their order index
  //   // to match the new order.
  //   const oppositeDirection = direction * -1;
  //
  //   const lineItemIndex = props.template.value.templateLineItems.findIndex(
  //     (lineItem) => lineItem.templateLineItemId === lineItemId,
  //   );
  //
  //   // If we're the first item, we can't move up, so we return
  //   if (lineItemIndex === 0 && direction === -1) return;
  //
  //   // If we're the last item, we can't move down, so we return
  //   if (
  //     lineItemIndex === props.template.value.templateLineItems.length - 1 &&
  //     direction === 1
  //   ) return;
  //
  //   props.template.value.templateLineItems[lineItemIndex]
  //     .templateLineItemOrderIndex += direction;
  //   props.template.value.templateLineItems[lineItemIndex + direction]
  //     .templateLineItemOrderIndex += oppositeDirection;
  //
  //   triggerRerender();
  // };

  const handleSaveInstance = async () => {
    const response = await fetch(
      `/api/instances/${props.instance.value.id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(props.instance.value),
      },
    );

    // TODO: Some sort of toast to indicate success or failure
    console.log(response.status);
    const responseJson = await response.json();
    console.log(responseJson);
  };

  // const handleRemoveTemplateLineItem = async (lineItemId: string) => {
  //   // Remove the line item.
  //   const lineItems = props.template.value.templateLineItems.filter(
  //     (lineItem) => lineItem.templateLineItemId !== lineItemId,
  //   );
  //
  //   // Set the order index of the remaining line items
  //   lineItems.forEach((lineItem, index) => {
  //     lineItem.templateLineItemOrderIndex = index;
  //   });
  //
  //   props.template.value.templateLineItems = lineItems;
  //
  //   triggerRerender();
  // };

  return (
    <div>
      <div>
        <label for={'instanceName'} class='font-semibold'>Instance</label>
        <Input
          id={'instanceName'}
          value={props.instance.value.name}
          onChange={(e: InputEventWithValue) =>
            props.instance.value.name = e.target.value}
        />
      </div>
      <div>
        <label for={'instanceNotes'} class='font-semibold'>Notes</label>{' '}
        <Input
          id={'instanceNotes'}
          value={props.instance.value.notes}
          onChange={(e: InputEventWithValue) =>
            props.instance.value.notes = e.target.value}
        />
      </div>
      <ul class='flex flex-col mt-4 mx-6 gap-4'>
        {props.instance.value.lineItems.sort(lineItemSorter)
          .map((lineItem) => (
            <li key={lineItem.id}>
              <InstanceLineItemEditor
                lineItem={lineItem}
                key={lineItem.id}
                onChange={() => triggerRerender()}
                // onOrderIndexChange={reOrderLineItem}
                // onRemove={handleRemoveTemplateLineItem}
              />
            </li>
          ))}
      </ul>
      <div class='mt-4'>
        <Button
          onClick={async (e) => {
            setSubmitting(true);
            e.preventDefault();
            await handleSaveInstance();
            setSubmitting(false);
          }}
          enableSpinner={submitting}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
