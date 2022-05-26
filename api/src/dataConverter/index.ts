import { FastifyLoggerInstance } from 'fastify';
import { readdir } from 'fs';
import { promisify } from 'util';
import { renameFile, writeFileContents } from '../utils';
import { Converter } from './converterInterface';
import V0toV1Converter from './v0tov1';

function getFilesWithExtensions(
  data: string[],
  extensions: string[],
): string[] {
  return data.filter((val) =>
    extensions
      .map((ext) => val.endsWith(ext))
      .reduce((prev, curr) => prev || curr),
  );
}

function getConverterForFile(fileName: string): Converter | undefined {
  if (fileName.endsWith('.template') || fileName.endsWith('.instance')) {
    return new V0toV1Converter();
  }
}

async function upgradeDataFilesOnce(
  log: FastifyLoggerInstance,
): Promise<boolean> {
  // Get files in store
  let performedUpgrade = false;
  const dataDirectory = __dirname + '/../../data';
  const data = await promisify(readdir)(dataDirectory);

  const templateExtensions = ['.template', '.template.json'];
  const templateFiles = getFilesWithExtensions(data, templateExtensions);

  const instanceExtensions = ['.instance', '.instance.json'];
  const instanceFiles = getFilesWithExtensions(data, instanceExtensions);

  for (let i = 0; i < templateFiles.length; i++) {
    const fileName = templateFiles[i];
    const converter = getConverterForFile(fileName);

    if (converter) {
      const sourcePath = `${dataDirectory}/${fileName}`;
      const result = await converter.updateTemplate(sourcePath);
      await renameFile(sourcePath, result.updatedSourceFileName);
      await writeFileContents(
        result.updatedDestinationFileName,
        result.destinationFileBody,
        false,
      );
      performedUpgrade = true;
      log.info(
        {
          fileName,
          fromVersion: result.fromVersion,
          toVersion: result.toVersion,
        },
        'Data file updated.',
      );
    }
  }

  for (let i = 0; i < instanceFiles.length; i++) {
    const fileName = instanceFiles[i];
    const converter = getConverterForFile(fileName);

    if (converter) {
      const sourcePath = `${dataDirectory}/${fileName}`;
      const result = await converter.updateInstance(sourcePath);
      await renameFile(sourcePath, result.updatedSourceFileName);
      await writeFileContents(
        result.updatedDestinationFileName,
        result.destinationFileBody,
        false,
      );
      performedUpgrade = true;
      log.info(
        {
          fileName,
          fromVersion: result.fromVersion,
          toVersion: result.toVersion,
        },
        'Data file updated.',
      );
    }
  }

  return performedUpgrade;
}

export async function updateDataFiles(
  log: FastifyLoggerInstance,
): Promise<void> {
  const upgradeRun = await upgradeDataFilesOnce(log);
  if (upgradeRun) {
    return updateDataFiles(log);
  }
}
