import { useState } from 'preact/hooks';
import { Input } from '../../../../components/primatives/Input.tsx';
import { Card } from '../../../../components/primatives/Card.tsx';
import { Button } from '../../../../components/primatives/Button.tsx';
import { InputEventWithValue } from '../../../../types/input-event-with-value.ts';

interface TemplateEditorProps {
  onCreate: ({ summary, notes }: { summary: string; notes: string }) => void;
}

export default function TemplateLineItemAdd(props: TemplateEditorProps) {
  const [summary, setSummary] = useState('');
  const [notes, setNotes] = useState('');
  return (
    <Card class='p-2'>
      <div class={'grid grid-cols-4 gap-2'}>
        <label for={'new-item-summary'} class={'text-right content-center'}>
          Summary
        </label>
        <div class={'col-span-3'}>
          <Input
            id={`new-item-summary`}
            value={summary}
            onChange={(a: InputEventWithValue) => setSummary(a.target.value)}
          />
        </div>

        <label for={'new-item-notes'} class={'text-right content-center'}>
          Notes
        </label>
        <div class={'col-span-3'}>
          <Input
            id={`new-item-notes`}
            value={notes}
            onChange={(a: InputEventWithValue) => setNotes(a.target.value)}
          />
        </div>

        <div class={'col-span-4 text-end'}>
          <Button
            onClick={() => {
              props.onCreate({ summary, notes });
              setSummary('');
              setNotes('');
            }}
          >
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
}
