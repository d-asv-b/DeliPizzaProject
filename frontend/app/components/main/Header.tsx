import { RiShoppingBasketFill } from "react-icons/ri"
import { FaGear } from "react-icons/fa6"
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import ThemeSwitch from "./ThemeSwitch";
import { useAuthContext } from "~/contexts/AuthContext";
import { useCartTotal } from "~/hooks/useCartTotal";
import { logOut } from "~/api/account";
import { clearAuthData } from "~/utils/AuthService";

export default function Header() {
    const [showSettings, updShowSettings] = useState(false);
    const settingsPopupRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();

    const { user, setUserData } = useAuthContext();    

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (settingsPopupRef.current && !settingsPopupRef.current.contains(e.target as Node)) {
                updShowSettings(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return (() => {
            document.removeEventListener("mousedown", handleClickOutside);
        })
    }, []);

    const totalCartPrice = useCartTotal();

    return (
        <div className="flex flex-row w-full max-h-20 bg-header text-text-header">
            <div className="flex flex-row items-center pl-5">
                <a className="font-caveat text-2xl" href="/">DeliPizza</a>
            </div>
            
            <div className="flex flex-row align-middle w-full justify-end">
                <div 
                    className="flex flex-row items-center py-2 px-4 h-full hover:bg-white/30 duration-500 cursor-pointer"
                    onClick={ () => navigate("/cart")  }
                >
                    <div 
                        className="font-semibold"
                    >
                        { totalCartPrice ? <span className="font-bubble-sans">{ totalCartPrice }₽</span> : "Корзина" }
                    </div>
                    <RiShoppingBasketFill size={24} className="mx-1"/>
                </div>

                <div className="my-1 border-1 border-[#6F6F6F]"></div>

                <div className="relative">
                <div
                    className="flex flex-row items-center py-2 px-4 h-full hover:bg-white/30 duration-500 cursor-pointer"
                    onClick={() => updShowSettings((prev) => !prev)}
                >
                    <div className="font-semibold">Настройки</div>
                        <FaGear size={24} className="mx-1" />
                    </div>

                    { showSettings && (
                        <div
                        ref={settingsPopupRef}
                        className="
                            absolute
                            top-full
                            left-1/2
                            transform
                            -translate-x-1/2
                            mt-1
                            text-center                            
                            rounded-md z-10
                            bg-popup text-text-popup
                            "
                        >
                            <div className="
                                absolute
                                top-[-4px]
                                left-1/2
                                transform
                                -translate-x-1/2
                                w-0 h-0
                                border-l-10 border-l-transparent
                                border-b-5 border-b-popup
                                border-r-10 border-r-transparent"
                            />
                            {
                                user ?
                                (
                                    <>
                                        <div className="py-2">
                                            Привет, { user.name }!
                                        </div>
                                        <div 
                                            className="hover:bg-popup-hover px-7 py-1"
                                            onClick={ () => navigate("/account") }
                                        >
                                            Настройки
                                        </div>
                                        <div 
                                            className="text-red-500 hover:bg-popup-hover px-4 py-1"
                                            onClick={ async () => {
                                                await logOut();
                                                setUserData(null);
                                            } }
                                        >
                                            Выйти
                                        </div>
                                    </>
                                )
                                :
                                (
                                    <div
                                        className="hover:bg-popup-hover px-7 py-1 rounded-t-md"
                                        onClick={ () => navigate("/signIn") }
                                    >
                                        Войти
                                    </div>
                                )
                            }
                            <div className="flex flex-col items-center">
                                <div>Тема:</div>
                                    <ThemeSwitch/>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}