import { V1TemplateFile, V1TemplateItem } from 'types/v1DataFormat';
import { DELIMITER } from './common';

function itemToString(element: V1TemplateItem, depth = 0): string {
  const subData =
    element && element.children
      ? element.children.map((e: V1TemplateItem) => itemToString(e, depth + 1))
      : undefined;
  const prefix = DELIMITER.repeat(depth);

  if (subData && subData.length > 0) {
    return `${prefix}${element.data}\n${subData.join('\n')}`;
  }

  return `${prefix}${element.data}`;
}

export function convertTemplateToHuman(input: V1TemplateFile): string {
  return input.contents.map((e) => itemToString(e)).join('\n');
}
