export interface JoggingTracker {
    id: string;
    userId: string;
    date: string;
    raceType: 'mile_sprint' | 'miles_1-3' | 'miles_3-5' | 'miles_5-7' | 'swim_prerun' | 'gym_prerun';
    course: string;
    routes: Route[];
    distanceMiles: number;
    distanceKilometers: number;
    time: number;
    pace: number;
    firstPlaceTime: number;
    placement: number; // every 10 seconds is a placement point
    currentLevel: number; // ranges from 1 to 5
    newLevel?: number; // The new level is the result of this specific jogging record
    newFirstPlaceTime?: number; // The new first place time is the result of this specific jogging record
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

export interface Route {
    slug: string;
    name: string
    miles: number;
    kilometers: number;
}

export interface Course {
    slug: string;
    name: string;
    routes: Route[];
}
