export interface JoggingTracker {
    id: string;
    userId: string;
    date: string;
    jogType: 'mile sprint' | '3-5 miles' | 'swim pre-run' | 'gym prerun';
    course: string;
    distance: number;
    measurement: 'miles' | 'kilometers';
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
