import axios from "axios";

export async function searchTemplates(term: string) {
  const data = await axios.get('http://localhost:8080/template');
  return data.data['results'];
}

export async function getTemplateById(id: string) {
  const data = await axios.get(`http://localhost:8080/template/${id}`);
  return data.data;
}

export async function removeTemplateById(id: string) {
  await axios.delete(`http://localhost:8080/template/${id}`);
}

export async function createTemplate(name: string, content: string) {
  await axios.post(
    'http://localhost:8080/template',
    JSON.stringify({ name, content }),
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

export async function searchInstances(term: string) {
  const data = await axios.get('http://localhost:8080/instance');
  return data.data['results'];
}

export async function getInstanceById(id: string) {
  const data = await axios.get(`http://localhost:8080/instance/${id}`);
  return data.data;
}

export async function removeInstanceById(id: string) {
  await axios.delete(`http://localhost:8080/instance/${id}`);
}

export interface IInstanceItem {
  completed: boolean,
  data: string,
}
export async function createInstance(name: string, content: Array<IInstanceItem>) {
  await axios.post(
    'http://localhost:8080/instance',
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
    `http://localhost:8080/instance/${name}`,
    JSON.stringify({ name, content }),
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}
