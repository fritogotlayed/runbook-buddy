import type { Signal } from '@preact/signals';
import { Template, TemplateLineItem } from '../../../../types/template-data.ts';
import { Input } from '../../../../components/primatives/Input.tsx';
import TemplateLineItemEditor from './TemplateLineItemEditor.tsx';
import { Button } from '../../../../components/primatives/Button.tsx';
import { InputEventWithValue } from '../../../../types/input-event-with-value.ts';
import { useState } from 'preact/hooks';

interface TemplateEditorProps {
  template: Signal<Template>;
}

export default function TemplateEditor(props: TemplateEditorProps) {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const triggerRerender = () => {
    // NOTE: We must replace the entire signal value with a new object to trigger a re-render
    props.template.value = {
      ...props.template.value,
    };
  };

  const templateLineItemSorter = (a: TemplateLineItem, b: TemplateLineItem) => {
    // Sort items by order index
    if (a.templateLineItemOrderIndex > b.templateLineItemOrderIndex) {
      return 1;
    } else if (a.templateLineItemOrderIndex < b.templateLineItemOrderIndex) {
      return -1;
    }
    return 0;
  };

  const createLineItem = (
    { summary, notes }: { summary: string; notes: string },
  ) => {
    const templateLineItem: TemplateLineItem = {
      templateLineItemId: `new-item-${Date.now()}`,
      templateLineItemSummary: summary,
      templateLineItemNotes: notes,
      templateLineItemOrderIndex: props.template.value.templateLineItems.length,
    };
    props.template.value.templateLineItems.push(templateLineItem);
    triggerRerender();
  };

  const reOrderLineItem = (lineItemId: string, direction: number) => {
    // Find the line item with the provided id and use the direction to either add one or subtract one from
    // the current order index. For the previous and next line items, we need to update their order index
    // to match the new order.
    const oppositeDirection = direction * -1;

    const lineItemIndex = props.template.value.templateLineItems.findIndex(
      (lineItem) => lineItem.templateLineItemId === lineItemId,
    );

    // If we're the first item, we can't move up, so we return
    if (lineItemIndex === 0 && direction === -1) return;

    // If we're the last item, we can't move down, so we return
    if (
      lineItemIndex === props.template.value.templateLineItems.length - 1 &&
      direction === 1
    ) return;

    props.template.value.templateLineItems[lineItemIndex]
      .templateLineItemOrderIndex += direction;
    props.template.value.templateLineItems[lineItemIndex + direction]
      .templateLineItemOrderIndex += oppositeDirection;

    triggerRerender();
  };

  const handleSaveTemplate = async () => {
    const response = await fetch(
      `/api/templates/${props.template.value.templateId}`,
      {
        method: 'PUT',
        body: JSON.stringify(props.template.value),
      },
    );

    // TODO: Some sort of toast to indicate success or failure
    console.log(response.status);
    const responseJson = await response.json();
    console.log(responseJson);
  };

  const handleRemoveTemplateLineItem = (lineItemId: string) => {
    // Remove the line item.
    const lineItems = props.template.value.templateLineItems.filter(
      (lineItem) => lineItem.templateLineItemId !== lineItemId,
    );

    // Set the order index of the remaining line items
    lineItems.forEach((lineItem, index) => {
      lineItem.templateLineItemOrderIndex = index;
    });

    props.template.value.templateLineItems = lineItems;

    triggerRerender();
  };

  return (
    <div>
      <div>
        <label for={'templateName'} class='font-semibold'>Template</label>
        <Input
          id={'templateName'}
          value={props.template.value.templateName}
          onChange={(e: InputEventWithValue) =>
            props.template.value.templateName = e.target.value}
        />
      </div>
      <div>
        <label for={'templateNotes'} class='font-semibold'>Notes</label>{' '}
        <Input
          id={'templateNotes'}
          value={props.template.value.templateNotes}
          onChange={(e: InputEventWithValue) =>
            props.template.value.templateNotes = e.target.value}
        />
      </div>
      <ul class='flex flex-col mt-4 ml-6 gap-4'>
        {props.template.value.templateLineItems.sort(templateLineItemSorter)
          .map((templateLineItem) => (
            <li key={templateLineItem.templateLineItemId}>
              <TemplateLineItemEditor
                lineItem={templateLineItem}
                key={templateLineItem.templateLineItemId}
                onOrderIndexChange={reOrderLineItem}
                onRemove={handleRemoveTemplateLineItem}
              />
            </li>
          ))}
      </ul>
      <div class='mt-4'>
        {/*<TemplateLineItemAdd*/}
        {/*  onCreate={(onCreateArgs) => createLineItem(onCreateArgs)}*/}
        {/*/>*/}
        <Button
          onClick={() => createLineItem({ summary: '', notes: '' })}
        >
          Add Line Item
        </Button>
      </div>
      <div class='mt-4'>
        <Button
          onClick={async (e) => {
            setSubmitting(true);
            e.preventDefault();
            await handleSaveTemplate();
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
