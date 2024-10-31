export interface Step {
    uic: number;
    chCode?: string;
    yard?: string;
    name: string;
    trigram?: string;
    latitude?: number;
    longitude?: number;
    arrivalTime: string;
    departureTime: string;
    duration?: number;
};

export type ImportedTrainSchedule = {
    trainNumber: string;
    rollingStock: string | null;
    departureTime: string;
    arrivalTime: string;
    departure: string;
    steps: Step[];
    transilienName?: string;
};

export type CichDictValue = {
    name: string | null,
    ciCode: number | string;
    chCode?: string;
};

export interface Notification {
    title?: string;
    text: string;
    date?: Date;
    type: 'success' | 'error' | 'warning';
};