export type ConverterResult = {
  fromVersion: string;
  toVersion: string;
  updatedSourceFileName: string;
  updatedDestinationFileName: string;
  destinationFileBody: string;
};

export interface Converter {
  /**
   * @param pathToFile Path to the file inside of the root data directory
   */
  updateTemplate(pathToFile: string): Promise<ConverterResult>;

  /**
   * @param pathToFile Path to the file inside of the root data directory
   */
  updateInstance(pathToFile: string): Promise<ConverterResult>;
}
