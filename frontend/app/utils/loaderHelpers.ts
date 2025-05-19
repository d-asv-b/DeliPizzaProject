import { ensureAuthInitialized, getUserData } from "./AuthService"

export const checkAuthenticated = async (): Promise<boolean> => {
    await ensureAuthInitialized();
    const user = getUserData();
    return !!user;
}