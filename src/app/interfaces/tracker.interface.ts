export interface JoggingTracker {
    id: string;
    userId: string;
    date: string;
    jogType: 'mile_sprint' | 'miles_1-3' | 'miles_3-5' | 'miles_5-7' | 'swim_prerun' | 'gym_prerun';
    course: string;
    distanceMiles: number;
    distanceKilometers: number;
    time: number;
    pace: number;
    firstPlaceTime: number;
    currentLevel: number;
}

export interface SwimTracker {
    id: string;
    userId: string;
    date: string;
    swimLocation: string;
    firstPlace20LapTime: number;
    firstPlace30LapTime: number;
    firstPlace40LapTime: number;
    firstPlace50LapTime?: number;
    firstPlace60LapTime?: number;
    firstPlace70LapTime?: number;
    firstPlace80LapTime?: number;
    laps: number;
    time: number;
    timePerLap: number;
    currentLevel: number;
}
