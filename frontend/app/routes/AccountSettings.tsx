import { MdAccountCircle, MdCreditCard, MdLocationPin, MdHistory } from "react-icons/md";
import { Link, Route, Routes, useLocation, useNavigate } from "react-router";
import AccountSettingsTab from "~/components/account/AccountSettingsTab";
import DeliveryAdressesTab from "~/components/account/DeliveryAdressesTab";
import PaymentMethodsTab from "~/components/account/PaymentMethodsTab";
import OrdersHistoryTab from "~/components/account/OrdersHistoryTab";
import Button from "~/components/general/Button";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "~/contexts/AuthContext";

const sidebarTabs = [
    {
        title: "Настройки аккаунта",
        url: "settings",
        icon: <MdAccountCircle size={ 30 }/>
    },
    {
        title: "Методы оплаты",
        url: "payment",
        icon: <MdCreditCard size={ 30 }/>
    },
    {
        title: "Адреса доставки",
        url: "delivery",
        icon: <MdLocationPin size={ 30 }/>
    },
    {
        title: "История заказов",
        url: "history",
        icon: <MdHistory size={ 30 }/>
    }
];

export default function AccountSettings() {
    const location = useLocation();
    const initialTabIndex = (() => {
        const pathSegment = location.pathname.split('/').pop();
        const index = sidebarTabs.findIndex(tab => tab.url === pathSegment);
        return index !== -1 ? index : 0;
    })();

    let [ activeTab, setActiveTab ] = useState(initialTabIndex);
    const navigate = useNavigate();

    const { user } = useAuthContext();
    useEffect(
        () => {
            if (user === null) {
                toast.error("Вы не авторизованы!");
                navigate("/signIn");
                return;
            }
        }, [user]
    );


    return (
        <div className="h-full w-full flex justify-center items-center bg-transparent">
            <div className="flex flex-col lg:flex-row h-full w-full rounded-none xl:h-5/6 xl:w-5/6 2xl:w-3/4 3xl:w-2/3 xl:rounded-2xl bg-secondary text-text-secondary">
                <div className="flex flex-col w-full lg:h-full lg:w-fit">
                    <div className="flex flex-row p-5">
                        <Button
                            onClick={ () => navigate("/") }
                        >
                            На главную
                        </Button>
                    </div>
                    <div className="flex flex-row overflow-x-auto lg:flex-col text-md sm:text-lg md:text-xl lg:text-2xl xl:text-3xl my-5 lg:pl-8 lg:border-r-1 border-gray-300">
                        {
                            sidebarTabs.map((tab, idx) => (
                                <Link
                                    key={ idx }
                                    to={ `/account/${ tab.url }` }
                                    className={ `flex flex-row grow lg:first:rounded-tl-2xl  not-first:border-l-1 lg:not-first:border-l-0 lg:not-first:border-t-1 items-center gap-2 py-2 px-2 lg:px-5 cursor-pointer border-gray-300 ${ idx === activeTab ? "text-sidebar-item-text-selected bg-sidebar-item-selected" : "text-sidebar-item-text" }` }
                                    onClick={ 
                                        () => setActiveTab(idx)
                                    }
                                >
                                    <div>
                                        { tab.icon }
                                    </div>

                                    <div className="text-sm sm:text-md md:text-lg lg:text-xl xl:text-2xl font-semibold">
                                        { tab.title }
                                    </div>
                                </Link>
                            ))
                        }
                    </div>
                </div>
                <div className="flex flex-col h-full grow">
                    <div className="text-xl md:text-2xl xl:text-3xl font-bold pl-5 py-5">
                        { sidebarTabs[activeTab].title }
                    </div>
                    <div className="h-[90%] grow p-5">
                        <Routes>
                            <Route index element={<AccountSettingsTab/>}/>
                            <Route path="settings" element={<AccountSettingsTab/>}/>
                            <Route path="payment" element={<PaymentMethodsTab/>}/>
                            <Route path="delivery" element={<DeliveryAdressesTab/>}/>
                            <Route path="history" element={<OrdersHistoryTab/>}/>
                        </Routes>
                    </div>
                </div>
            </div>
        </div>
    );
}