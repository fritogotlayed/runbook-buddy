import { V1InstanceFile, V1InstanceItem, V1UIInstanceFile, V1UIInstanceItem } from "types/v1DataFormat";

function mapV1InstanceItemToUI(item: V1InstanceItem, parent: V1UIInstanceItem | undefined): V1UIInstanceItem{
  const keySlug = item.data.replace(/ /g, '_');
  const me: V1UIInstanceItem = {
    key: parent ? `${parent.key}_${keySlug}` : keySlug,
    children: [],
    childrenComplete: 0,
    completed: item.completed,
    data: item.data,
    originalState: item.completed,
    parent,
    visible: true,
  };

  me.children = mapV1InstanceItemsToUI(item.children, me);
  me.childrenComplete = me.children.reduce((prev, curr: V1UIInstanceItem) => prev + curr.childrenComplete + (curr.completed ? 1 : 0), 0)

  return me;
}

function mapV1InstanceItemsToUI(items: V1InstanceItem[], parent: V1UIInstanceItem | undefined): V1UIInstanceItem[] {
  if (!items || items.length === 0) return [];

  return items.map(e => mapV1InstanceItemToUI(e, parent));
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
    contents: mapV1InstanceItemsToUI(data.contents, undefined)
  };

  return resultData;
}

export async function removeInstanceById(id: string) {
  await fetch(`/api/instances/${id}`, {
    method: 'DELETE',
  })
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

export async function updateInstance(name: string, data: V1InstanceFile) {
  await fetch(`/api/instances/${name}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}