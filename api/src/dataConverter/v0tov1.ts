import { readFileContents } from '../utils';
import { Converter, ConverterResult } from './converterInterface';

const fromVersion = '0';
const toVersion = '1';

export default class V0toV1Converter implements Converter {

  async updateTemplate(pathToFile: string): Promise<ConverterResult> {
    const fileData = await readFileContents(pathToFile);
    const newBody = {
      version: 1,
      contents: fileData.split('\n').map((l) => ({
        data: l,
        children: [],
      })),
    };

    return {
      updatedSourceFileName: `${pathToFile}.bak`,
      updatedDestinationFileName: `${pathToFile}.json`, 
      destinationFileBody: JSON.stringify(newBody),
      fromVersion,
      toVersion,
    }
  }

  async updateInstance(pathToFile: string): Promise<ConverterResult> {
    const fileData = await readFileContents(pathToFile);
    const newBody = {
      version: 1,
      contents: JSON.parse(fileData).map((e: object) => ({
        ...e,
        children: [],
      })),
    };

    return {
      updatedSourceFileName: `${pathToFile}.bak`,
      updatedDestinationFileName: `${pathToFile}.json`, 
      destinationFileBody: JSON.stringify(newBody),
      fromVersion,
      toVersion,
    }
  }
}