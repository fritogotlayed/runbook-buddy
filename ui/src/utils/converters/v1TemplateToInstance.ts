import {
  V1TemplateFile,
  V1TemplateItem,
  V1InstanceFile,
  V1InstanceItem,
} from 'types/v1DataFormat';

function mapTemplateItemToInstanceItem(item: V1TemplateItem): V1InstanceItem {
  const children =
    item.children && item.children.length > 0
      ? item.children.map((e) => mapTemplateItemToInstanceItem(e))
      : [];

  return {
    data: item.data,
    completed: false,
    children,
  };
}

export function convertTemplateToInstance(
  input: V1TemplateFile,
): V1InstanceFile {
  return {
    version: input.version,
    contents: input.contents.map((e) => mapTemplateItemToInstanceItem(e)),
  };
}
