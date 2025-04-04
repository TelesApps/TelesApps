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
    raceTypes: RaceType[];
    swimTypes: SwimType[];
}

export interface RaceType {
    slug: string;
    name: string
    time: number;
    level: number;
}

export interface SwimType {
    location: string;
    slug: string;
    lapLength: number; // in meters
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
            raceTypes: [
                { slug: 'mile_sprint', name: 'Mile Sprint', time: 0, level: 0 },
                { slug: 'miles_1-3', name: '1-3 Miles', time: 0, level: 0 },
                { slug: 'miles_3-5', name: '3-5 Miles', time: 0, level: 0 },
                { slug: 'miles_5-7', name: '5-7 Miles', time: 0, level: 0 },
                { slug: 'swim_prerun', name: 'Swim Pre-Run', time: 0, level: 0 },
                { slug: 'gym_prerun', name: 'Gym Pre-Run', time: 0, level: 0 }
            ],
            swimTypes: [
                { location: 'Largo Community Pool', slug: 'largo_pool', lapLength: 25, laps: 20, time: 0, level: 0 },
                { location: 'Largo Community Pool', slug: 'largo_pool_50m', lapLength: 25, laps: 30, time: 0, level: 0 },
                { location: 'Largo Community Pool', slug: 'largo_pool_100m', lapLength: 25, laps: 40, time: 0, level: 0 },
                { location: 'Largo Community Pool', slug: 'largo_pool_150m', lapLength: 25, laps: 50, time: 0, level: 0 },
                { location: 'Largo Community Pool', slug: 'largo_pool_200m', lapLength: 25, laps: 60, time: 0, level: 0 },
                { location: 'Largo Community Pool', slug: 'largo_pool_250m', lapLength: 25, laps: 70, time: 0, level: 0 },
                { location: 'Largo Community Pool', slug: 'largo_pool_300m', lapLength: 25, laps: 80, time: 0, level: 0 }

            ]
        }
    };
}