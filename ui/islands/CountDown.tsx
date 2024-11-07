import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';

// TODO: remove this page

const timeFmt = new Intl.RelativeTimeFormat('en-US');

// The target date is passed as a string instead of as a Date, because the
// props to island components need to be JSON serializable/deserializable.
export default function CountDown(props: { target: string }) {
  const target = new Date(props.target);
  const now = useSignal(new Date());

  // Set up an interval to update the "now" date every second with the current
  // date as long as the component is mounted.
  useEffect(() => {
    const timer = setInterval(() => {
      if (now.value > target) {
        clearInterval(timer);
      }

      now.value = new Date();
    }, 1000);

    return () => clearInterval(timer);
  }, [props.target]);

  const secondsLeft = Math.floor(
    (target.getTime() - now.value.getTime()) / 1000,
  );

  if (secondsLeft <= 0) {
    return <span>🎉</span>;
  }

  return (
    <span>
      {timeFmt.format(secondsLeft, 'seconds')}
    </span>
  );
}
