import { buildUrl } from "./common";

export async function searchTemplates(term: string) {
  const data = await fetch(buildUrl('/template'))
    .then(res => res.json());
  return data.results;
}

export async function getTemplateById(id: string): Promise<string> {
  const data = await fetch(buildUrl(`/template/${id}`))
    .then(res => res.text());
    // .then(res => res.json());
  return data;
}

export async function removeTemplateById(id: string) {
  await fetch(buildUrl(`/template/${id}`), {
    method: 'DELETE',
  })
}

export async function createTemplate(name: string, content: string) {
  await fetch(buildUrl('/template'), {
    method: 'POST',
    body: JSON.stringify({ name, content }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export async function updateTemplate(id: string, content: string) {
  await fetch(buildUrl(`/template/${id}`), {
    method: 'PUT',
    body: JSON.stringify({ content }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
