import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface ThemeContextType {
    isDarkTheme: boolean,
    toggleTheme: () => void
};

export const AppThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
    const [isDarkTheme, setDarkTheme] = useState<boolean>(false);

    useEffect(() => {
        let theme = false;

        // Проверяем, выбирал ли уже тему пользователь
        const storedTheme = localStorage.getItem("theme") === "true" ? true : false;

        // Смотрим, какие настройки темы стоят на устройстве пользователя
        const systemPreferedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;

        if (storedTheme != null) {
            theme = storedTheme;
        }
        else if (systemPreferedTheme) {
            theme = systemPreferedTheme;
        }

        setDarkTheme(theme);

        if (theme) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);

    const toggleTheme = () => {
        setDarkTheme(!isDarkTheme);
        // Сохраняем выбранную тему в localStorage
        localStorage.setItem("theme", String(!isDarkTheme));
        document.documentElement.classList.toggle("dark");
    };

    return (
        <AppThemeContext.Provider value={{ isDarkTheme, toggleTheme }}>
            {children}
        </AppThemeContext.Provider>
    );
};

export const useThemeContext = () => useContext(AppThemeContext);