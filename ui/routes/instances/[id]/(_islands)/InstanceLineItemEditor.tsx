import { Input } from '../../../../components/primatives/Input.tsx';
import { Card } from '../../../../components/primatives/Card.tsx';
import { InputEventWithValue } from '../../../../types/input-event-with-value.ts';
import { Button } from '../../../../components/primatives/Button.tsx';
import { Check } from '../../../../components/icons/check.tsx';
import { Uncheck } from '../../../../components/icons/uncheck.tsx';
import type { InstanceLineItem } from './types.ts';

interface InstanceEditorProps {
  lineItem: InstanceLineItem;
  onChange?: (lineItemId: string) => void;
}

function CompletedLineItemOld(props: InstanceEditorProps) {
  return (
    <Card class='p-2 bg-gray-300'>
      <div class={'grid grid-cols-5 gap-2'}>
        <div class='text-center content-center'>
          <Button
            onClick={() => {
              props.lineItem.completed = !props.lineItem.completed;
              props.onChange?.(props.lineItem.id);
            }}
          >
            {props.lineItem.completed ? <Check /> : <Uncheck />}
          </Button>
        </div>
        <label
          for={`${props.lineItem.id}-summary`}
          className='text-right content-center'
        >
          Summary
        </label>
        <div class='col-span-3'>
          <Input
            id={`${props.lineItem.id}-summary`}
            value={props.lineItem.summary}
            readonly
            onChange={(a: InputEventWithValue) =>
              props.lineItem.summary = a.target.value}
          />
        </div>

        <div class='text-center content-center'>
          {/* placeholder to align content properly */}
        </div>
        <label
          for={`${props.lineItem.id}-notes`}
          className='text-right content-center'
        >
          Notes
        </label>
        <div class='col-span-3'>
          <Input
            id={`${props.lineItem.id}-notes`}
            value={props.lineItem.notes}
            onChange={(a: InputEventWithValue) =>
              props.lineItem.notes = a.target.value}
          />
        </div>
      </div>
    </Card>
  );
}

function CompletedLineItem(props: InstanceEditorProps) {
  return (
    <Card class='p-2 bg-gray-300 max-w-full'>
        <div class={'flex flex-wrap gap-4 flex-row'}>
          <div class='text-center content-center'>
            <Button
              onClick={() => {
                props.lineItem.completed = !props.lineItem.completed;
                props.onChange?.(props.lineItem.id);
              }}
            >
              {props.lineItem.completed ? <Check/> : <Uncheck/>}
            </Button>
          </div>
          <div>
            <label
              htmlFor={`${props.lineItem.id}-summary`}
              className='text-right content-center'
            >
              Summary
            </label>
            <div className={'mt-1.5'} id={`${props.lineItem.id}-summary`}>{props.lineItem.summary}</div>
          </div>
          <div class={'flex flex-col w-1/2'}>
            <label
              htmlFor={`${props.lineItem.id}-notes`}
              className='text-left content-center'
            >
              Notes
            </label>
            <Input
              id={`${props.lineItem.id}-notes`}
              class={'w-full'}
              value={props.lineItem.notes}
              onChange={(a: InputEventWithValue) =>
                props.lineItem.notes = a.target.value}
            />
          </div>
        </div>
    </Card>
);
}

function ActiveLineItem(props: InstanceEditorProps) {
  return (
    <Card class={`p-2 ${props.lineItem.completed ? 'bg-gray-300' : ''}`}>
      <div class={'grid grid-cols-5 gap-2'}>
        <div class='text-center content-center'>
          <Button
            onClick={() => {
              props.lineItem.completed = !props.lineItem.completed;
              props.onChange?.(props.lineItem.id);
            }}
          >
            {props.lineItem.completed ? <Check /> : <Uncheck />}
          </Button>
        </div>
        <label
          for={`${props.lineItem.id}-summary`}
          className='text-right content-center'
        >
          Summary
        </label>
        <div class='col-span-3'>
          <Input
            id={`${props.lineItem.id}-summary`}
            value={props.lineItem.summary}
            readonly
            onChange={(a: InputEventWithValue) =>
              props.lineItem.summary = a.target.value}
          />
        </div>

        <div class='text-center content-center'>
          {/* placeholder to align content properly */}
        </div>
        <label
          for={`${props.lineItem.id}-notes`}
          className='text-right content-center'
        >
          Notes
        </label>
        <div class='col-span-3'>
          <Input
            id={`${props.lineItem.id}-notes`}
            value={props.lineItem.notes}
            onChange={(a: InputEventWithValue) =>
              props.lineItem.notes = a.target.value}
          />
        </div>
      </div>
    </Card>
  );
}

export default function InstanceLineItemEditor(props: InstanceEditorProps) {
  return props.lineItem.completed
    ? <CompletedLineItem lineItem={props.lineItem} onChange={props.onChange} />
    : <ActiveLineItem lineItem={props.lineItem} onChange={props.onChange} />;
}
