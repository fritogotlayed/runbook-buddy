import axios from "axios";
import { buildUrl } from "./common";

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