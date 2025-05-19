import { getUserProfileInfo } from "~/api/account";
import type { UserPublicInfo } from "../models/auth";

let currentUser: UserPublicInfo | null = null;
let authInitialRequestPromise: Promise<UserPublicInfo | null> | null = null;

let resolveInitialAuthAttempt: () => void;
const initialAuthAttemptCompletedPromise = new Promise<void>((resolve) => {
    resolveInitialAuthAttempt = resolve;
});

export function getUserData(): UserPublicInfo | null {
    return currentUser;
}

export function getUserDataRequestPromise(): Promise<UserPublicInfo | null> | null {
    return authInitialRequestPromise;
}

async function fetchUserData(): Promise<UserPublicInfo | null> {
    try {
        let userProfileData = await getUserProfileInfo();
        return userProfileData.userData;
    }
    catch {
        return null;
    }
}

export function initializeAuth(): Promise<UserPublicInfo | null> {
    if (!authInitialRequestPromise) {
        authInitialRequestPromise = fetchUserData().then(user => {
            currentUser = user;
            return user;
        }).catch(err => {
            currentUser = null;
            return null;
        })
    }

    return authInitialRequestPromise;
}

export async function ensureAuthInitialized(): Promise<void> {
    if (!authInitialRequestPromise) {
        initializeAuth();
    }

    return initialAuthAttemptCompletedPromise;
}

export function clearAuthData(): void {
    currentUser = null;
    authInitialRequestPromise = null;

    authInitialRequestPromise = Promise.resolve(null);
    if(resolveInitialAuthAttempt) {
        resolveInitialAuthAttempt();
    }
}

export function setAuthData(newAuthData: UserPublicInfo): void {
    currentUser = newAuthData;
    authInitialRequestPromise = Promise.resolve(newAuthData);
    if (resolveInitialAuthAttempt) {
        resolveInitialAuthAttempt();
    }
}