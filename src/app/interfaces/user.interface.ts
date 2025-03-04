export interface User {
    userId: string;
    email: string;
    displayName: string;
    photoURL?: string | null;
    phoneNumber?: string | null;
    emailVerified: boolean;
    status: 'subscriber' | 'client';
    role: 'admin' | 'user' | 'guest';
}

export function CreateUser(
    id: string,
    displayName: string,
    email: string,
    emailVerified: boolean,
    photoURL?: string,
): User {
    return {
        userId: id,
        displayName: displayName,
        email: email,
        emailVerified: emailVerified,
        photoURL: photoURL || null,
        phoneNumber: null,
        status: 'client',
        role: 'user'
    };
}