import { JSX } from 'preact';
import { reduceClasses } from '../utilities.ts';

interface InputProps extends JSX.HTMLAttributes<HTMLInputElement> {
  isErrored?: boolean;
}

const BASE_CLASS =
  'px-2 py-1 border-gray-500 border-2 rounded bg-white hover:bg-gray-200 transition-colors';

function computeStyle(props: InputProps) {
  let realizedClass = BASE_CLASS;

  if (props.disabled) {
    realizedClass = `${realizedClass} border-gray-500`;
  }

  if (props.isErrored) {
    realizedClass = `${realizedClass} border-red-500`;
  }

  if (props.readonly) {
    realizedClass =
      `${realizedClass} border-gray-400 bg-gray-300 hover:bg-gray-300`;
  }

  return reduceClasses([realizedClass, props.class, props.className].join(' '));
}

export function Input(props: InputProps) {
  const {
    class: _classAttribute,
    className: _classNameAttribute,
    ...rest
  } = props;
  return (
    <input
      class={computeStyle(props)}
      {...rest}
    />
  );
}
