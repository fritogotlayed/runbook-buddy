import axios from "axios";

function buildUrl(part: string): string {
  const { hostname } = window.location;
  return `http://${hostname}:8080${part.startsWith('/') ? part : `/${part}`}`;
}

export async function searchTemplates(term: string) {
  const data = await axios.get(buildUrl('/template'));
  return data.data['results'];
}

export async function getTemplateById(id: string) {
  const data = await axios.get(buildUrl(`/template/${id}`));
  return data.data;
}

export async function removeTemplateById(id: string) {
  await axios.delete(buildUrl(`/template/${id}`));
}

export async function createTemplate(name: string, content: string) {
  await axios.post(
    buildUrl('/template'),
    JSON.stringify({ name, content }),
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

export async function updateTemplate(id: string, content: string) {
  await axios.put(
    buildUrl(`/template/${id}`),
    JSON.stringify({ content }),
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

export async function searchInstances(term: string) {
  const data = await axios.get(buildUrl('/instance'));
  return data.data['results'];
}

export async function getInstanceById(id: string): Promise<Array<IInstanceItem>> {
  const data = await axios.get(buildUrl(`/instance/${id}`));
  return data.data as Array<IInstanceItem>;
}

export async function removeInstanceById(id: string) {
  await axios.delete(buildUrl(`/instance/${id}`));
}

export interface IInstanceItem {
  completed: boolean,
  data: string,
}
export async function createInstance(name: string, content: Array<IInstanceItem>) {
  await axios.post(
    buildUrl('/instance'),
    JSON.stringify({ name, content }),
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

export async function updateInstance(name: string, content: Array<IInstanceItem>) {
  await axios.put(
    buildUrl(`/instance/${name}`),
    JSON.stringify({ name, content }),
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}
