import { useContext } from 'react';

import { Download } from '@osrd-project/ui-icons';
import nextId from 'react-id-generator';

import type {
  ImportedTrainSchedule,
  Step,
  CichDictValue,
} from './types';
import { ModalContext } from 'common/BootstrapSNCF/ModalSNCF/ModalProvider';
import UploadFileModal from 'common/uploadFileModal';

import {
  handleFileReadingError,
  handleUnsupportedFileType,
  processXmlFile,
} from './handleParseFiles';

import { ProjectPathTrainResult, Waypoint } from '@osrd-project/ui-manchette/dist/types';

type ImportTrainScheduleConfigProps = {
  setWaypoints: (waypoint: Waypoint[]) => void;
  setProjectPathTrainResult: (projectPathTrainResult: ProjectPathTrainResult[]) => void;
};

const ImportTrainScheduleConfig = ({
  setWaypoints,
  setProjectPathTrainResult
}: ImportTrainScheduleConfigProps) => {
  const { openModal, closeModal } = useContext(ModalContext);

  const convertImportedTrainScheduleToProjectPathTrainResult = (
    importedSchedule: ImportedTrainSchedule,
    id: number,
    waypoints: Waypoint[]
): { result: ProjectPathTrainResult, usedWaypointsSet: Set<number> } => {
    let allPositions: number[] = [];
    let allTimes: number[] = [];
    let usedWaypointsSet = new Set<number>();

    let current_position = 0;
    let totalDuration = 0;
    let lastDepartureTime = 0;

    importedSchedule.steps.forEach((step) => {
        const matchingWaypoint = waypoints.find(waypoint => waypoint.id === step.uic.toString());

        if (matchingWaypoint) {
            //console.log(matchingWaypoint.position);
            current_position = matchingWaypoint.position;
            usedWaypointsSet.add(matchingWaypoint.id); // Track waypoint as used
        }
        
        allPositions.push(current_position);
        console.log(step.departureTime.length);
        console.log(step.arrivalTime.length);
        if (step.departureTime.length > 11 && step.arrivalTime.length > 11)  {
          totalDuration += new Date(step.arrivalTime).getTime() - new Date(step.departureTime).getTime();
          lastDepartureTime = new Date(step.arrivalTime).getTime();
        }
        else if (lastDepartureTime !== 0 && step.arrivalTime.length > 11) {
          totalDuration += new Date(step.arrivalTime).getTime() - lastDepartureTime;
          lastDepartureTime = new Date(step.arrivalTime).getTime();
        }
        else if (step.departureTime.length > 11) {
          lastDepartureTime = new Date(step.departureTime).getTime();
        }

        allTimes.push(totalDuration);
    });

    return {
        result: {
            id,
            name: `Train ${id}`,
            departureTime: new Date(importedSchedule.departureTime),
            spaceTimeCurves: [
                {
                    positions: allPositions,
                    times: allTimes,
                },
            ],
        },
        usedWaypointsSet,
    };
};


function updateTrainSchedules(
  importedTrainSchedules: ImportedTrainSchedule[],
  waypoints: Waypoint[]
) {
  const trainsSchedules = importedTrainSchedules.map((trainSchedule) => {
      const stepsWithDuration = trainSchedule.steps.map((step) => {
          const duration = Math.round(
              (new Date(step.departureTime).getTime() - new Date(step.arrivalTime).getTime()) / 1000
          );
          return { ...step, duration };
      });

      return { ...trainSchedule, steps: stepsWithDuration };
  });

  let idCounter = 1;
  let allUsedWaypoints = new Set<number>();

  const projectPathTrainResult = trainsSchedules.map((trainSchedule) => {
      const { result, usedWaypointsSet } = convertImportedTrainScheduleToProjectPathTrainResult(
          trainSchedule,
          idCounter++,
          waypoints
      );

      usedWaypointsSet.forEach(id => allUsedWaypoints.add(id)); // Accumulate all used waypoints
      return result;
  });

  // Filter waypoints to keep only those in allUsedWaypoints
  const filteredWaypoints = waypoints.filter(waypoint => allUsedWaypoints.has(waypoint.id));

  // Store the result and log
  setProjectPathTrainResult(projectPathTrainResult);
  setWaypoints(filteredWaypoints);
  console.log(projectPathTrainResult);
  console.log("Filtered Waypoints:", filteredWaypoints);
}


  function convertToWaypoints(record: Record<string, CichDictValue>): Waypoint[] {
    return Object.entries(record).map(([id, value], index) => ({
        id: "87" + value.ciCode,
        position: index * 410000, // Use the index as the position
        name: value.name || undefined, // Only include name if it's not null
        secondaryCode: value.chCode, // Secondary code is optional and may be undefined
    }));
}

  // EXTRACT-CI-CH-CODE
  const extractCiChCode = (code: string) => {
    const [ciCode, chCode] = code.split('/');
    return { ciCode: ciCode || '', chCode: chCode || '' };
  };

  const cleanTimeFormat = (time: string): string => time.replace(/\.0$/, ''); // Remove the '.0' if it's at the end of the time string
  const buildSteps = (
    ocpTTs: Element[],
    cichDict: Record<string, CichDictValue>,
    startDate: string
  ): Step[] =>
    ocpTTs
      .map((ocpTT, index): Step | null => {
        const ocpRef = ocpTT.getAttribute('ocpRef');
        const times = ocpTT.getElementsByTagName('times')[0];
        let departureTime = times?.getAttribute('departure') || '';
        let arrivalTime = times?.getAttribute('arrival') || '';

        const isLastOcpTT = index === ocpTTs.length - 1;

        if (isLastOcpTT) {
          arrivalTime = cleanTimeFormat(departureTime) || cleanTimeFormat(arrivalTime); // For the last sequence, arrival equals departure
          departureTime = cleanTimeFormat(arrivalTime) || cleanTimeFormat(departureTime);
        } else if (index !== 0) {
          arrivalTime = times?.getAttribute('arrival') || times?.getAttribute('departure') || '';
          arrivalTime = cleanTimeFormat(arrivalTime);
          departureTime = times?.getAttribute('departure') || times?.getAttribute('arrival') || '';
          departureTime = cleanTimeFormat(departureTime);
        }

        if (!ocpRef) {
          console.error('ocpRef is null or undefined');
          return null;
        }
        const operationalPoint = cichDict[ocpRef];

        if (!operationalPoint) {
          return null; // Skip step if not found in the cichDict
        }
        //! We add 87 to the CI code to create the UIC. It is France specific and will break if used in other countries.
        const uic = Number(`87${operationalPoint.ciCode}`); // Add 87 to the CI code to create the UIC
        const { chCode, name } = operationalPoint;
        const formattedArrivalTime = `${startDate} ${arrivalTime}`;
        const formattedDepartureTime = `${startDate} ${departureTime}`;

        return {
          id: nextId(),
          uic,
          chCode,
          name: ocpRef,
          additionalName: name,
          arrivalTime: cleanTimeFormat(formattedArrivalTime),
          departureTime: cleanTimeFormat(formattedDepartureTime),
        } as Step;
      })
      .filter((step): step is Step => step !== null);
      
  const mapTrainNames = (trainSchedules: ImportedTrainSchedule[], trains: Element[]) => {
    const trainPartToTrainMap: Record<string, string> = {};

    trains.forEach((train) => {
      const trainPartRef = train.getElementsByTagName('trainPartRef')[0]?.getAttribute('ref');
      const trainName = train.getAttribute('name') || '';
      if (trainPartRef) {
        trainPartToTrainMap[trainPartRef] = trainName;
      }
    });

    const updatedTrainSchedules = trainSchedules.map((schedule) => {
      const mappedTrainNumber = trainPartToTrainMap[schedule.trainNumber] || schedule.trainNumber;

      return {
        ...schedule,
        trainNumber: mappedTrainNumber,
      };
    });

    return updatedTrainSchedules;
  };

  const parseRailML = async (xmlDoc: Document): Promise<[ImportedTrainSchedule[], Waypoint[]]> => {
    const trainSchedules: ImportedTrainSchedule[] = [];

    // Initialize localCichDict
    const localCichDict: Record<string, CichDictValue> = {};

    const infrastructures = Array.from(xmlDoc.getElementsByTagName('infrastructure'));

    infrastructures.forEach((infrastructure) => {
      const ocps = Array.from(infrastructure.getElementsByTagName('ocp'));

      ocps.forEach((ocp) => {
        const additionalName = ocp.getElementsByTagName("additionalName");
        const name = additionalName.length != 0 ? additionalName[0].getAttribute("name") : "";
        const id = ocp.getAttribute('id');
        const code = ocp.getAttribute('code');

        if (id && code) {
          const { ciCode, chCode } = extractCiChCode(code);
          localCichDict[id] = { name, ciCode, chCode };
        }
      });
    });

    const waypoints = convertToWaypoints(localCichDict);
    console.log(waypoints);
    setWaypoints(waypoints);

    const trainParts = Array.from(xmlDoc.getElementsByTagName('trainPart'));
    const period = xmlDoc.getElementsByTagName('timetablePeriod')[0];
    const startDate = period ? period.getAttribute('startDate') : null;

    trainParts.forEach((train) => {
      const trainNumber = train.getAttribute('id') || '';
      const ocpSteps = Array.from(train.getElementsByTagName('ocpTT'));
      const formationTT = train.getElementsByTagName('formationTT')[0];
      const rollingStockViriato = formationTT?.getAttribute('formationRef');
      const firstOcpTT = ocpSteps[0];
      const firstDepartureTime = firstOcpTT
        .getElementsByTagName('times')[0]
        ?.getAttribute('departure');

      const firstDepartureTimeformatted = firstDepartureTime && cleanTimeFormat(firstDepartureTime);

      const lastOcpTT = ocpSteps[ocpSteps.length - 1];
      const lastDepartureTime =
        lastOcpTT.getElementsByTagName('times')[0]?.getAttribute('departure') ||
        lastOcpTT.getElementsByTagName('times')[0]?.getAttribute('arrival');
      const lastDepartureTimeformatted = lastDepartureTime && cleanTimeFormat(lastDepartureTime);

      // Build steps using the fully populated localCichDict
      const adaptedSteps = buildSteps(ocpSteps, localCichDict, startDate);

      const trainSchedule: ImportedTrainSchedule = {
        trainNumber,
        rollingStock: rollingStockViriato, // RollingStocks in viriato files rarely have the correct format
        departureTime: `${startDate} ${firstDepartureTimeformatted}`,
        arrivalTime: `${startDate} ${lastDepartureTimeformatted}`,
        departure: '', // Default for testing
        steps: adaptedSteps,
      };

      trainSchedules.push(trainSchedule);
    });
    const trains = Array.from(xmlDoc.getElementsByTagName('train'));
    const updatedTrainSchedules = mapTrainNames(trainSchedules, trains);
    // setTrainsXmlData(updatedTrainSchedules);
    return await Promise.all([updatedTrainSchedules, waypoints]);
  };

  const importFile = async (file: File) => {
    closeModal();
    // setTrainsList([]);

    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop();

    try {
      const fileContent = await file.text();

      if (fileExtension === 'xml' || fileExtension === 'railml') {
        processXmlFile(fileContent, parseRailML, updateTrainSchedules);
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

export default ImportTrainScheduleConfig;
