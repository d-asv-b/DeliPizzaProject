import type { AxiosError } from "axios";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getUserProfileInfo } from "~/api/account";
import type { UserPublicInfo } from "~/models/auth";

interface AuthContextType {
    user: UserPublicInfo | null;
    setUserData: (user: UserPublicInfo) => void
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
    const [ user, setUser ] = useState<UserPublicInfo | null>(null);
    
    useEffect(() => {
        const getInfoFromServer = async () => {
            const profileInfo = await getUserProfileInfo();

            localStorage.setItem("USER_DATA", JSON.stringify(profileInfo.userData));
            setUser(profileInfo.userData);
        }

        getInfoFromServer()
            .catch(
                (err: AxiosError) => {
                    if (err.response && err.response.status === 401) {
                        localStorage.removeItem("USER_DATA");
                        setUser(null);
                    }
                    else {
                        console.log(err.cause);
                    }
                }
            );

    }, []);


    const setUserData = (userData: UserPublicInfo | null) => {
        setUser(userData);
        
        if (userData) {
            localStorage.setItem("USER_DATA", JSON.stringify(userData));
        }
        else {
            localStorage.removeItem("USER_DATA");
        }
    }

    return (
        <AuthContext.Provider value={{ user, setUserData }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuthContext = () => useContext(AuthContext);