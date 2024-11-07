import type { Signal } from '@preact/signals';
import { Button } from '../components/primatives/Button.tsx';
import { IS_BROWSER } from '$fresh/runtime.ts';

// TODO: remove this page

interface CounterProps {
  count: Signal<number>;
}

export default function Counter(props: CounterProps) {
  return (
    <div class='flex gap-8 py-6'>
      <Button
        disabled={!IS_BROWSER}
        onClick={() => {
          props.count.value -= 1;
        }}
      >
        -1
      </Button>

      <p class='text-3xl tabular-nums'>{props.count}</p>

      <Button
        disabled={!IS_BROWSER}
        onClick={() => props.count.value += 1}
      >
        +1
      </Button>
    </div>
  );
}
