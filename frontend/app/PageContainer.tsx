import { useEffect, useState, type ReactNode } from "react";
import { useThemeContext } from "./contexts/AppThemeContext";


export default function PageContainer({ children }: { children: ReactNode }) {
    let [ isMounted, setIsMounted ] = useState(false);
    let { isDarkTheme } = useThemeContext();
    
    useEffect(() => setIsMounted(true), []);

    return (
        <>
            {
                isMounted ?
                <div className={ `${ isDarkTheme ? "dark" : "" } overflow-hidden h-full w-full
                bg-main bg-[url('/img/pizza-pattern.svg')]` }>
                    { children }
                </div>
                :
                <></>
            }
        </>
    )
}