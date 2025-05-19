import { useAuthContext } from "~/contexts/AuthContext"
import { IoArrowBack } from "react-icons/io5";
import { useEffect, useState } from "react";

import { MdAccountCircle, MdCreditCard, MdLocationPin, MdHistory } from "react-icons/md";
import { Link, Route, Routes, useLocation } from "react-router";
import AccountSettingsTab from "~/components/account/AccountSettingsTab";
import DeliveryAdressesTab from "~/components/account/DeliveryAdressesTab";
import PaymentMethodsTab from "~/components/account/PaymentMethodsTab";
import OrdersHistoryTab from "~/components/account/OrdersHistoryTab";

const sidebarTabs = [
    {
        title: "Настройки аккаунта",
        url: "settings",
        icon: <MdAccountCircle/>
    },
    {
        title: "Методы оплаты",
        url: "payment",
        icon: <MdCreditCard/>
    },
    {
        title: "Адреса доставки",
        url: "delivery",
        icon: <MdLocationPin/>
    },
    {
        title: "История заказов",
        url: "history",
        icon: <MdHistory/>
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

    return (
        <div className="h-full w-full flex justify-center items-center bg-transparent">
            <div className="flex flex-row h-5/6 w-5/6 rounded-3xl bg-secondary text-text-secondary">
                <div className="flex flex-col h-full w-fit">
                    <div className="flex lex-row pt-5 pl-5">
                        <Link to={"/"}>
                            <IoArrowBack size={ 50 } color="gray"/>
                        </Link>
                    </div>
                    <div className="flex-row grow text-md sm:text-lg md:text-xl lg:text-2xl xl:text-3xl my-5 pl-8 border-r-1 border-gray-300">
                        {
                            sidebarTabs.map((tab, idx) => (
                                <Link
                                    key={ idx }
                                    to={ `/account/${ tab.url }` }
                                    className={ `flex flex-row grow first:rounded-tl-2xl not-first:border-t-1 items-center gap-2 py-2 pl-2 pr-5 cursor-pointer border-gray-300 ${ idx === activeTab ? "text-sidebar-item-text-selected bg-sidebar-item-selected" : "text-sidebar-item-text" }` }
                                    onClick={ 
                                        () => setActiveTab(idx)
                                    }
                                >
                                    <div>
                                        { tab.icon }
                                    </div>

                                    <div>
                                        { tab.title }
                                    </div>
                                </Link>
                            ))
                        }
                    </div>
                </div>
                <div className="flex flex-col h-full grow">
                    <div className="text-lg md:text-xl xl:text-3xl pl-5 py-5">
                        { sidebarTabs[activeTab].title }
                    </div>
                    <div className="grow p-5">
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