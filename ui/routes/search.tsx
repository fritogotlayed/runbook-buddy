import { Handlers, PageProps } from '$fresh/server.ts';
// TODO: Remove this page

const NAMES = ['Alice', 'Bob', 'Charlie', 'Dave', 'Eve', 'Frank'];

interface Data {
  results: string[];
  query: string;
}

export const handler: Handlers<Data> = {
  GET: (req, ctx) => {
    const url = new URL(req.url);
    const query = url.searchParams.get('q') || '';
    const results = NAMES.filter((name) =>
      name.toLowerCase().includes(query.toLowerCase())
    );
    return ctx.render({ results, query });
  },
  POST: async (req, ctx) => {
    const form = await req.formData();
    const query = (form.get('q') || '').toString();
    const results = NAMES.filter((name) =>
      name.toLowerCase().includes(query.toLowerCase())
    );
    return ctx.render({ results, query });
  },
};

export default function SearchPage({ data }: PageProps<Data>) {
  const { results, query } = data;
  return (
    <div>
      <form method='POST'>
        <input type='text' name='q' value={query} />
        <button type='submit'>Search</button>
      </form>
      <ul>
        {results.map((name) => <li key={name}>{name}</li>)}
      </ul>
    </div>
  );
}
