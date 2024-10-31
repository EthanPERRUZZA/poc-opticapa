import type { ImportedTrainSchedule } from './types';

export const handleFileReadingError = (error: Error) => {
  console.error('File reading error:', error);
};

export const handleXmlParsingError = (error: Error) => {
  console.error('Error parsing XML/RailML:', error);
};

export const processXmlFile = async (
  fileContent: string,
  parseRailML: (xmlDoc: Document) => Promise<ImportedTrainSchedule[]>,
  updateTrainSchedules: (schedules: ImportedTrainSchedule[]) => void
) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(fileContent, 'application/xml');
    const parserError = xmlDoc.getElementsByTagName('parsererror');

    if (parserError.length > 0) {
      throw new Error('Invalid XML');
    }

    const importedTrainSchedules = await parseRailML(xmlDoc);
    console.log(importedTrainSchedules)
    if (importedTrainSchedules && importedTrainSchedules.length > 0) {
      updateTrainSchedules(importedTrainSchedules);
    }
  } catch (error) {
    handleXmlParsingError(error as Error);
  }
};

export const handleUnsupportedFileType = () => {
  console.error('Unsupported file type');
};
