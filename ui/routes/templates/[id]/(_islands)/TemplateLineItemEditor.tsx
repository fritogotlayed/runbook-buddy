import { TemplateLineItem } from '../../../../types/template-data.ts';
import { Input } from '../../../../components/primatives/Input.tsx';
import { Card } from '../../../../components/primatives/Card.tsx';
import { InputEventWithValue } from '../../../../types/input-event-with-value.ts';
import { Button } from '../../../../components/primatives/Button.tsx';
import { TrashCan } from '../../../../components/icons/trash-can.tsx';
import { Chevron } from '../../../../components/icons/chevron.tsx';

interface TemplateEditorProps {
  lineItem: TemplateLineItem;
  onOrderIndexChange?: (lineItemId: string, index: number) => void;
  onRemove?: (lineItemId: string) => void;
}

export default function TemplateLineItemEditor(props: TemplateEditorProps) {
  return (
    <Card class='p-2'>
      <div class={'grid grid-cols-6 gap-2'}>
        <div class='text-center content-center'>
          <Button
            onClick={() =>
              props.onOrderIndexChange?.(
                props.lineItem.templateLineItemId,
                -1,
              )}
          >
            <Chevron orientation={'up'} />
          </Button>
        </div>
        <label
          for={`${props.lineItem.templateLineItemId}-summary`}
          className='text-right content-center'
        >
          Summary
        </label>
        <div class='col-span-3'>
          <Input
            id={`${props.lineItem.templateLineItemId}-summary`}
            value={props.lineItem.templateLineItemSummary}
            onChange={(a: InputEventWithValue) =>
              props.lineItem.templateLineItemSummary = a.target.value}
          />
        </div>
        <div class='text-center content-center'>
          <Button
            onClick={() => props.onRemove?.(props.lineItem.templateLineItemId)}
          >
            <TrashCan />
          </Button>
        </div>

        <div class='text-center content-center'>
          <Button
            onClick={() =>
              props.onOrderIndexChange?.(
                props.lineItem.templateLineItemId,
                1,
              )}
          >
            <Chevron orientation={'down'} />
          </Button>
        </div>
        <label
          for={`${props.lineItem.templateLineItemId}-notes`}
          className='text-right content-center'
        >
          Notes
        </label>
        <div class='col-span-3'>
          <Input
            id={`${props.lineItem.templateLineItemId}-notes`}
            value={props.lineItem.templateLineItemNotes}
            onChange={(a: InputEventWithValue) =>
              props.lineItem.templateLineItemNotes = a.target.value}
          />
        </div>
      </div>
    </Card>
  );
}
