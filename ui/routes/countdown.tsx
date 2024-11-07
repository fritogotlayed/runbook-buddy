import CountDown from '../islands/CountDown.tsx';
// TODO: remove this page

export default function CountdownPage() {
  const date = new Date();
  date.setHours(date.getHours() + 1);
  return (
    <div>
      <CountDown target={date.toISOString()} />
    </div>
  );
}
