/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { V1TemplateFile } from 'types/v1DataFormat';

export async function searchTemplates(): Promise<string[]> {
  const data = await fetch('/api/templates').then((res) => res.json());
  return data.results as string[];
}

export async function getTemplateById(id: string): Promise<V1TemplateFile> {
  const data = await fetch(`/api/templates/${id}`).then((res) => res.text());
  return JSON.parse(data) as V1TemplateFile;
}

export async function removeTemplateById(id: string): Promise<void> {
  await fetch(`/api/templates/${id}`, {
    method: 'DELETE',
  });
}

export async function createTemplate(
  name: string,
  content: string,
): Promise<void> {
  await fetch('/api/templates', {
    method: 'POST',
    body: JSON.stringify({ name, content }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function updateTemplate(
  id: string,
  content: string,
): Promise<void> {
  await fetch(`/api/templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
