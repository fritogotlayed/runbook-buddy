import axios from "axios";
import { buildUrl } from "./common";

export async function searchTemplates(term: string) {
  const data = await axios.get(buildUrl('/template'));
  return data.data['results'];
}

export async function getTemplateById(id: string): Promise<string> {
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
