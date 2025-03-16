export interface UserData {
    userId: string;
    email: string;
    displayName: string;
    photoURL?: string | null;
    phoneNumber?: string | null;
    emailVerified: boolean;
    status: 'subscriber' | 'client';
    role: 'admin' | 'user' | 'guest';
    trackerStats?: TrackerStats;
}

export interface TrackerStats {
    // mileSprint: {time: number, level: number};
    // oneToThreeMiles: {time: number, level: number};
    // threeToFiveMiles: {time: number, level: number};
    // fiveToSevenMiles: {time: number, level: number};
    // swimPreRun: {time: number, level: number};
    // gymPreRun: {time: number, level: number};
    raceTypes: RaceType[];
    swimRecords: SwimRecord[];
}

export interface RaceType {
    slug: string;
    name: string
    time: number;
    level: number;
}

export interface SwimRecord {
    location: string;
    laps: number;
    time: number;
    level: number;
}

export function CreateUser(
    id: string,
    displayName: string,
    email: string,
    emailVerified: boolean,
    photoURL?: string,
): UserData {
    return {
        userId: id,
        displayName: displayName,
        email: email,
        emailVerified: emailVerified,
        photoURL: photoURL || null,
        phoneNumber: null,
        status: 'client',
        role: 'user',
        trackerStats: {
            // mileSprint: {time: 0, level: 0},
            // oneToThreeMiles: {time: 0, level: 0},
            // threeToFiveMiles: {time: 0, level: 0},
            // fiveToSevenMiles: {time: 0, level: 0},
            // swimPreRun: {time: 0, level: 0},
            // gymPreRun: {time: 0, level: 0},
            raceTypes: [
                { slug: 'mile_sprint', name: 'Mile Sprint', time: 0, level: 0 },
                { slug: 'miles_1-3', name: '1-3 Miles', time: 0, level: 0 },
                { slug: 'miles_3-5', name: '3-5 Miles', time: 0, level: 0 },
                { slug: 'miles_5-7', name: '5-7 Miles', time: 0, level: 0 },
                { slug: 'swim_prerun', name: 'Swim Pre-Run', time: 0, level: 0 },
                { slug: 'gym_prerun', name: 'Gym Pre-Run', time: 0, level: 0 }
            ],
            swimRecords: []
        }
    };
}