import { type PageProps } from '$fresh/server.ts';

// TODO: remove this page

export default function Greet(props: PageProps) {
  return <div>Hello {props.params.name}</div>;
}
