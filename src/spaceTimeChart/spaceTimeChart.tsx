/* eslint-disable import/no-unresolved */
import React, { useRef } from 'react';

import { Manchette } from '@osrd-project/ui-manchette';
import type { ProjectPathTrainResult, Waypoint } from '@osrd-project/ui-manchette/dist/types';
import { PathLayer, SpaceTimeChart, WorkScheduleLayer } from '@osrd-project/ui-spacetimechart';

import '@osrd-project/ui-core/dist/theme.css';
import '@osrd-project/ui-manchette/dist/theme.css';
import '@osrd-project/ui-manchette-with-spacetimechart/dist/theme.css';

import useManchettesWithSpaceTimeChart from './useManchettesWithSpaceTimeChart';
import upward from './assets/ScheduledMaintenanceUp.svg';
import { type WorkSchedule } from './types';

type ManchetteWithSpaceTimeWrapperProps = {
  waypoints: Waypoint[];
  projectPathTrainResult: ProjectPathTrainResult[];
  selectedTrain: number;
  workSchedules: WorkSchedule[];
};
const DEFAULT_HEIGHT = 561;

const ManchetteWithSpaceTimeWrapper = ({
  waypoints,
  projectPathTrainResult,
  selectedTrain,
  workSchedules,
}: ManchetteWithSpaceTimeWrapperProps) => {
  const manchetteWithSpaceTimeChartRef = useRef<HTMLDivElement>(null);
  const { manchetteProps, spaceTimeChartProps, handleScroll } = useManchettesWithSpaceTimeChart(
    waypoints,
    projectPathTrainResult,
    manchetteWithSpaceTimeChartRef,
    selectedTrain
  );

  return (
    <>
      <div className="manchette-space-time-chart-wrapper">
        <div
          className="header bg-ambientB-5 w-full border-b border-grey-30"
          style={{ height: '40px' }}
        ></div>
        <div
          ref={manchetteWithSpaceTimeChartRef}
          className="manchette flex"
          style={{ height: `${DEFAULT_HEIGHT}px` }}
          onScroll={handleScroll}
        >
          <Manchette {...manchetteProps} />
          <div
            className="space-time-chart-container w-full sticky"
            style={{ bottom: 0, left: 0, top: 2, height: `${DEFAULT_HEIGHT - 6}px` }}
          >
            <SpaceTimeChart
              className="inset-0 absolute h-full"
              spaceOrigin={0}
              timeOrigin={Math.min(...projectPathTrainResult.map((p) => +p.departureTime))}
              {...spaceTimeChartProps}
            >
              {spaceTimeChartProps.paths.map((path) => (
                <PathLayer key={path.id} path={path} color={path.color} />
              ))}

              <WorkScheduleLayer workSchedules={workSchedules} imageUrl={upward} />
            </SpaceTimeChart>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManchetteWithSpaceTimeWrapper;