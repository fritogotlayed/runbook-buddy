import { V1InstanceFile, V1InstanceItem, V1UIInstanceFile, V1UIInstanceItem } from "types/v1DataFormat";

function mapV1InstanceItemToUI(item: V1InstanceItem): V1UIInstanceItem{
  return ({
    visible: true,
    originalState: item.completed,
    completed: item.completed,
    data: item.data,
    children: mapV1InstanceItemsToUI(item.children),
  });
}

function mapV1InstanceItemsToUI(items: V1InstanceItem[]): V1UIInstanceItem[] {
  if (!items || items.length === 0) return [];

  return items.map(e => mapV1InstanceItemToUI(e));
}

// TODO: https://nextjs.org/docs/basic-features/data-fetching/client-side
export async function searchInstances(term: string) {
  const data = await fetch('/api/instances')
    .then(res => res.json());
  return data.results;
}

export async function getInstanceById(id: string): Promise<V1UIInstanceFile> {
  const data = await fetch(`/api/instances/${id}`)
    .then(res => res.json()) as V1InstanceFile;

  const resultData = {
    version: data.version,
    contents: mapV1InstanceItemsToUI(data.contents)
  };

  console.log(data);
  console.log(resultData)

  return resultData;
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
export async function createInstance(name: string, content: V1InstanceFile) {
  await fetch('/api/instances', {
    method: 'POST',
    body: JSON.stringify({ name, content }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export async function updateInstance(name: string, content: V1InstanceFile) {
  await fetch(`/api/instances/${name}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}