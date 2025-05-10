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
        let userInfoJson = localStorage.getItem("USER_DATA");

        if (userInfoJson) {
            setUser(JSON.parse(userInfoJson));
        }
        else {
            const getInfoFromServer = async () => {
                const profileInfo = await getUserProfileInfo();

                localStorage.setItem("USER_DATA", JSON.stringify(profileInfo.userData));
                setUser(profileInfo.userData);
            }

            getInfoFromServer()
                .catch(
                    (err) => {
                        console.log(err);
                    }
                )
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