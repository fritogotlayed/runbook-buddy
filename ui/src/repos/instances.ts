// TODO: https://nextjs.org/docs/basic-features/data-fetching/client-side
export async function searchInstances(term: string) {
  const data = await fetch('/api/instances')
    .then(res => res.json());
  return data.results;
}

export async function getInstanceById(id: string): Promise<Array<IInstanceItem>> {
  const data = await fetch(`/api/instances/${id}`)
    .then(res => res.json());
  return data as Array<IInstanceItem>;
}

export async function removeInstanceById(id: string) {
  await fetch(`/api/instances/${id}`, {
    method: 'DELETE',
  })
}

export interface IInstanceItem {
  completed: boolean,
  data: string,
}
export async function createInstance(name: string, content: Array<IInstanceItem>) {
  await fetch('/api/instances', {
    method: 'POST',
    body: JSON.stringify({ name, content }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export async function updateInstance(name: string, content: Array<IInstanceItem>) {
  await fetch(`/api/instances/${name}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}