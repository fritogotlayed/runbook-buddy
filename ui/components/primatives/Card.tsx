import { JSX } from 'preact';
import { reduceClasses } from '../utilities.ts';

export function Card({
  children,
  class: propsClass,
}: {
  children: JSX.Element;
  class?: string;
}) {
  const reducedClass = reduceClasses(
    `bg-white rounded-lg shadow-lg max-w-fit ${propsClass}`,
  );
  return (
    <div
      class={reducedClass}
    >
      {children}
    </div>
  );
}
