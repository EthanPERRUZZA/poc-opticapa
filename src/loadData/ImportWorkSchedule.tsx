import { useContext } from 'react';

import { Download } from '@osrd-project/ui-icons';

import { ModalContext } from 'common/BootstrapSNCF/ModalSNCF/ModalProvider';
import UploadFileModal from 'common/uploadFileModal';

import { WorkSchedule } from 'spaceTimeChart/types';

import {
    handleFileReadingError,
    handleUnsupportedFileType,
  } from './handleParseFiles';

type ImportWorkSchedulesProps = {
    setWorkSchedules: (workschedules: WorkSchedule[]) => void;
};

const ImportWorkSchedules = ({
    setWorkSchedules,
    }: ImportWorkSchedulesProps) => {
    const { openModal, closeModal } = useContext(ModalContext);

    function parseWorkSchedule(jsonString: string): void {
        // Parse the JSON string to an array of raw objects
        const rawData = JSON.parse(jsonString);
      
        // Map the raw data to WorkSchedule array, converting date strings to Date objects
        const workSchedules = rawData.map((item: any) => ({
          type: item.type,
          timeStart: new Date(item.timeStart),
          timeEnd: new Date(item.timeEnd),
          spaceRanges: item.spaceRanges
        }));

        console.log(workSchedules);
        setWorkSchedules(workSchedules);
      }
    
    const importFile = async (file: File) => {
        closeModal();
        // setTrainsList([]);
    
        const fileName = file.name.toLowerCase();
        const fileExtension = fileName.split('.').pop();
    
        try {
          const fileContent = await file.text();
    
          if (fileExtension === 'json') {
            parseWorkSchedule(fileContent);
          } else {
            handleUnsupportedFileType();
          }
        } catch (error) {
          handleFileReadingError(error as Error);
        }
      };
    return (
    <>
        <button
            type="button"
            className="btn btn-sm btn-primary btn-block h-100"
            aria-label='importTimetable'
            title='importTimetable'
            onClick={() => {
                openModal(<UploadFileModal handleSubmit={importFile} />);}}
        >
            <Download />
        </button>
    </>
    );
};

export default ImportWorkSchedules;
