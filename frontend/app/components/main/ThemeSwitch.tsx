import { MdOutlineWbSunny } from "react-icons/md";
import { BsFillMoonStarsFill } from "react-icons/bs";
import { useThemeContext } from "~/contexts/AppThemeContext";

export default function ThemeSwitch() {
    const { isDarkTheme, toggleTheme } = useThemeContext();

    return (
        <div
            className="flex w-16 h-6 items-center bg-switch-background rounded-full cursor-pointer my-1"
            onClick={toggleTheme}
        >
            <div
                className={`w-6 h-6 rounded-full bg-switch-circle flex items-center justify-center transform !transition-all ease-in-out ${isDarkTheme ? 'translate-x-10' : 'translate-x-0'
                    }`}
            >
                {isDarkTheme ? (
                    <BsFillMoonStarsFill className="text-switch-icon" />
                ) : (
                    <MdOutlineWbSunny className="text-switch-icon" />
                )}
            </div>
        </div>

    )
}