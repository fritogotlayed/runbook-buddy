import { JSX } from 'preact';

type LinkButtonProps = JSX.HTMLAttributes<HTMLAnchorElement> & {
  variant?: 'primary' | 'secondary';
};

export function LinkButton(props: LinkButtonProps) {
  const { children, class: propsClass, ...rest } = props;
  const borderClasses = props.variant === 'primary'
    ? 'border-gray-500 border-2'
    : 'border-gray-300 border-2';
  // Blue button starter -- class='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'

  return (
    <a
      class={`inline-block px-3 py-1 min-h-6 ${borderClasses} rounded bg-white hover:bg-gray-100 transition-colors${
        propsClass ? ` ${propsClass}` : ''
      }`}
      {...rest}
    >
      {children}
    </a>
  );
}
