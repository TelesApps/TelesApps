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
    mileSprint: {time: number, level: number};
    oneToThreeMiles: {time: number, level: number};
    threeToFiveMiles: {time: number, level: number};
    fiveToSevenMiles: {time: number, level: number};
    swimPreRun: {time: number, level: number};
    gymPreRun: {time: number, level: number};
    swimRecords: SwimRecord[];
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
            mileSprint: {time: 0, level: 0},
            oneToThreeMiles: {time: 0, level: 0},
            threeToFiveMiles: {time: 0, level: 0},
            fiveToSevenMiles: {time: 0, level: 0},
            swimPreRun: {time: 0, level: 0},
            gymPreRun: {time: 0, level: 0},
            swimRecords: []
        }
    };
}