export const DELIMITER = '- ';

export type DepthAndData = {
  depth: number;
  data: string;
};

export function getDepthAndData(line: string): DepthAndData {
  let workingData = line;
  let depth = 0;
  while (workingData.startsWith(DELIMITER)) {
    workingData = workingData.slice(DELIMITER.length);
    depth += 1;
  }

  return { depth, data: workingData };
}
