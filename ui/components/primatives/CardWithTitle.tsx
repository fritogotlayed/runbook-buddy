import { JSX } from 'preact';
export type CardWithTitleProps = {
  children: JSX.Element;
  class?: string;
  title: string;
};

export function CardWithTitle({
  children,
  class: propsClass,
  title,
}: CardWithTitleProps) {
  return (
    <div
      class={`bg-white rounded-lg shadow-lg max-w-sm p-1 ${propsClass}`}
    >
      <div class='divide-y divide-gray-200'>
        <div class='font-bold text-xl mx-6 my-4'>{title}</div>
        <p class='text-gray-700 text-base px-6 py-4'>
          {children}
        </p>
      </div>
    </div>
  );
}
