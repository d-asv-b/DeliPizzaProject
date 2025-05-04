import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { UserPublicInfo } from "~/models/auth";

interface AuthContextType {
    user: UserPublicInfo | null;
    setUserData: (user: UserPublicInfo) => void
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
    const [ user, setUser ] = useState<UserPublicInfo | null>(null);
    
    useEffect(() => {
        let userInfoJson = localStorage.getItem("USER_DATA");

        if (userInfoJson) {
            setUser(JSON.parse(userInfoJson));
        }
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