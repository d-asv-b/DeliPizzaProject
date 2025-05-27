import type { AxiosError } from "axios";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getUserProfileInfo } from "~/api/account";
import type { UserPublicInfo } from "~/models/auth";
import { clearAuthData, getUserDataRequestPromise, initializeAuth, setAuthData } from "~/utils/AuthService";

interface AuthContextType {
    user: UserPublicInfo | null;
    isLoading: boolean;
    setUserData: (user: UserPublicInfo | null) => void
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
    const [ user, setUser ] = useState<UserPublicInfo | null>(null);
    const [ isLoading, setIsLoading ] = useState<boolean>(false);
    
    useEffect(() => {
        const performAuthInit = async () => {
            let initPromise = getUserDataRequestPromise();
            if (!initPromise) {
                initPromise = initializeAuth();
            }

            initPromise.then((userInfo) => {
                setUser(userInfo);
                setIsLoading(false);
            }).catch(() => {
                setUser(null);
                setIsLoading(false);
            });
        }

       performAuthInit();
    }, []);


    const setUserData = (userData: UserPublicInfo | null) => {
        setUser(userData);
        
        if (userData) {
            setAuthData(userData)
            localStorage.setItem("USER_DATA", JSON.stringify(userData));
        }
        else {
            clearAuthData();
            sessionStorage.removeItem("ACCESS_TOKEN");
            localStorage.removeItem("USER_DATA");
        }
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, setUserData }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuthContext = () => useContext(AuthContext);