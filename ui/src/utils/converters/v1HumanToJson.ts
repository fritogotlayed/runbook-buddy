import { V1TemplateFile, V1TemplateItem } from "types/v1DataFormat";
import { DELIMITER } from './common';

type V1TemplateTreeItem = V1TemplateItem & {
  parent?: V1TemplateTreeItem
};

function getDepthAndData(line: string): [number, string] {
  let workingData = line;
  let depth = 0;
  while (workingData.startsWith(DELIMITER)) {
    workingData = workingData.slice(DELIMITER.length);
    depth += 1;
  }

  return [depth, workingData];
};

function getProperParent(previous: V1TemplateTreeItem, depthAdjustment: number): V1TemplateTreeItem {
  if (depthAdjustment === -1) {
    return previous;
  }

  return getProperParent(previous.parent as V1TemplateTreeItem, depthAdjustment - 1);
}

function buildTemplateTreeItems(lineData: string, nextLines: string[], previous: V1TemplateTreeItem, parentDepth: number): void {
  const [depth, workingData] = getDepthAndData(lineData); // ?

  const parent = getProperParent(previous, parentDepth - depth);

  const currentItem:  V1TemplateTreeItem = {
    data: workingData,
    children: [],
    parent,
  };

  parent.children.push(currentItem)

  if (nextLines.length > 0) {
    const nextData = nextLines[0];
    buildTemplateTreeItems(nextData, nextLines.slice(1), currentItem, depth);
  }
}

function convertToV1TemplateItemList(data: V1TemplateTreeItem[]): V1TemplateItem[] {
  return data.map((e) => {
    const childMap = convertToV1TemplateItemList(e.children);
    return {
      data: e.data,
      children: childMap,
    };
  })
}

export function convertTemplateToJSON(input: string): string {
  const workingData = [] as V1TemplateTreeItem[];
  const lines = input.split('\n');

  if (lines && lines.length > 0) {
    const firstData = lines[0];
    buildTemplateTreeItems(firstData, lines.slice(1), { data: 'N/A', children: workingData }, -1);

    const data = convertToV1TemplateItemList(workingData);

    return JSON.stringify({
      version: 1,
      contents: data,
    } as V1TemplateFile);
  }
  return JSON.stringify({
    version: 1,
    contents: [],
  } as V1TemplateFile);
}