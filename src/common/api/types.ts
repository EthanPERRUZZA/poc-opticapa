export type Comfort = 'STANDARD' | 'AIR_CONDITIONING' | 'HEATING';
export type Distribution = 'STANDARD' | 'MARECO';
export type TrackOffset = {
    /** Offset in mm */
    offset: number;
    track: string;
};
export type PathItemLocation =
  | TrackOffset
  | {
      operational_point: string;
    }
  | {
      /** An optional secondary code to identify a more specific location */
      secondary_code?: string | null;
      trigram: string;
    }
  | {
      /** An optional secondary code to identify a more specific location */
      secondary_code?: string | null;
      /** The [UIC](https://en.wikipedia.org/wiki/List_of_UIC_country_codes) code of an operational point */
      uic: number;
};
export type ReceptionSignal = 'OPEN' | 'STOP' | 'SHORT_SLIP_STOP';
export type TrainScheduleBase = {
    comfort?: Comfort;
    constraint_distribution: Distribution;
    initial_speed?: number;
    labels?: string[];
    margins?: {
      boundaries: string[];
      /** The values of the margins. Must contains one more element than the boundaries
          Can be a percentage `X%` or a time in minutes per 100 kilometer `Xmin/100km` */
      values: string[];
    };
    options?: {
      use_electrical_profiles?: boolean;
    };
    path: (PathItemLocation & {
      /** Metadata given to mark a point as wishing to be deleted by the user.
          It's useful for soft deleting the point (waiting to fix / remove all references)
          If true, the train schedule is consider as invalid and must be edited */
      deleted?: boolean;
      id: string;
    })[];
    power_restrictions?: {
      from: string;
      to: string;
      value: string;
    }[];
    rolling_stock_name: string;
    schedule?: {
      /** The expected arrival time at the stop.
          This will be used to compute the final simulation time. */
      arrival?: string | null;
      at: string;
      /** Whether the schedule item is locked (only for display purposes) */
      locked?: boolean;
      reception_signal?: ReceptionSignal;
      /** Duration of the stop.
          Can be `None` if the train does not stop.
          If `None`, `reception_signal` must be `Open`.
          `Some("PT0S")` means the train stops for 0 seconds. */
      stop_for?: string | null;
    }[];
    speed_limit_tag?: string | null;
    start_time: string;
    train_name: string;
};
export type ProjectPathTrainResult = {
  /** List of signal updates along the path */
  signal_updates: {
    /** The labels of the new aspect */
    aspect_label: string;
    /** Whether the signal is blinking */
    blinking: boolean;
    /** The color of the aspect
        (Bits 24-31 are alpha, 16-23 are red, 8-15 are green, 0-7 are blue) */
    color: number;
    /** The route ends at this position in mm on the train path */
    position_end: number;
    /** The route starts at this position in mm on the train path */
    position_start: number;
    /** The id of the updated signal */
    signal_id: string;
    /** The name of the signaling system of the signal */
    signaling_system: string;
    /** The aspects stop being displayed at this time (number of seconds since `departure_time`) */
    time_end: number;
    /** The aspects start being displayed at this time (number of mseconds since `departure_time`) */
    time_start: number;
  }[];
  /** List of space-time curves sections along the path */
  space_time_curves: {
    positions: number[];
    times: number[];
  }[];
} & {
  /** Departure time of the train */
  departure_time: string;
  /** Rolling stock length in mm */
  rolling_stock_length: number;
};
export type PathProperties = {
  curves?: {
    /** List of `n` boundaries of the ranges.
        A boundary is a distance from the beginning of the path in mm. */
    boundaries: number[];
    /** List of `n+1` values associated to the ranges */
    values: number[];
  } | null;
  electrifications?: {
    /** List of `n` boundaries of the ranges.
        A boundary is a distance from the beginning of the path in mm. */
    boundaries: number[];
    /** List of `n+1` values associated to the ranges */
    values: (
      | {
          type: 'electrification';
          voltage: string;
        }
      | {
          lower_pantograph: boolean;
          type: 'neutral_section';
        }
      | {
          type: 'non_electrified';
        }
    )[];
  } | null;
  geometry?: GeoJsonLineString | null;
  /** Operational points along the path */
  operational_points?:
    | {
        extensions?: OperationalPointExtensions;
        id: string;
        part: OperationalPointPart;
        /** Distance from the beginning of the path in mm */
        position: number;
      }[]
    | null;
  slopes?: {
    /** List of `n` boundaries of the ranges.
        A boundary is a distance from the beginning of the path in mm. */
    boundaries: number[];
    /** List of `n+1` values associated to the ranges */
    values: number[];
  } | null;
  zones?: {
    /** List of `n` boundaries of the ranges.
        A boundary is a distance from the beginning of the path in mm. */
    boundaries: number[];
    /** List of `n+1` values associated to the ranges */
    values: string[];
  } | null;
};
export type GeoJsonPointValue = number[];
export type GeoJsonLineStringValue = GeoJsonPointValue[];
export type GeoJsonLineString = {
  coordinates: GeoJsonLineStringValue;
  type: 'LineString';
};
export type OperationalPointExtensions = {
  identifier?: {
    name: string;
    uic: number;
  } | null;
  sncf?: {
    ch: string;
    ch_long_label: string;
    ch_short_label: string;
    ci: number;
    trigram: string;
  } | null;
};
export type OperationalPointPart = {
  extensions?: {
    sncf?: {
      kp: string;
    } | null;
  };
  position: number;
  track: string;
};
export type TrainScheduleResult = TrainScheduleBase & {
  id: number;
  timetable_id: number;
};