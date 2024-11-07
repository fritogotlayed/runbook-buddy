import { JSX } from 'preact';

interface ShowProps extends JSX.IntrinsicAttributes {
  when: boolean;
  children: JSX.Element;
}

export function Show(props: ShowProps) {
  const { children, when } = props;
  if (!when) return null;
  return children;
}
