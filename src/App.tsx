import { useState } from 'react';

import ImportTrainScheduleConfig from 'loadData/ImportTrainScheduleConfig.tsx';
import { ModalProvider } from 'common/BootstrapSNCF/ModalSNCF/ModalProvider';
import ManchetteWithSpaceTimeWrapper from 'spaceTimeChart/spaceTimeChart';

import type { ProjectPathTrainResult, Waypoint } from '@osrd-project/ui-manchette/dist/types';
import { WorkSchedule } from 'spaceTimeChart/types';
import ImportWorkSchedules from 'loadData/ImportWorkSchedule';

const App = () => {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [projectPathTrainResult, setProjectPathTrainResult] = useState<ProjectPathTrainResult[]>([]);
  
  const [workschedules, setWorkSchedules] = useState<WorkSchedule[]>([]);

  return (
    <>
      <ModalProvider>
        <ImportTrainScheduleConfig
          setWaypoints={setWaypoints}
          setProjectPathTrainResult={setProjectPathTrainResult}
        />
        <ImportWorkSchedules setWorkSchedules={setWorkSchedules}
        />
        <ManchetteWithSpaceTimeWrapper waypoints={waypoints} projectPathTrainResult={projectPathTrainResult} selectedTrain={0}  workSchedules={workschedules}       
        />
      </ModalProvider>
    </>
  )
};

export default App;
