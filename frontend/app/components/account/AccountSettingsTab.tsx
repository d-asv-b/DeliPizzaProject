import { useState } from "react"
import BasicModalWindow from "./BasicModal";

const accountSettings = [
    {
        title: "Имя:",
        valueInJSON: "name"
    },
    {
        title: "Номер телефона:",
        valueInJSON: "phoneNumber" 
    },
    {
        title: "Адрес эл. почты:",
        valueInJSON: "email"
    },
    {
        title: "День рождения:",
        valueInJSON: "birthdayDate"
    }
]

export default function AccountSettingsTab() {
    let [ openModal, setOpenModal ] = useState(false);
    let [ valueToEdit, setValueToEdit ] = useState<'name' | 'email' | 'phone' | 'password' | null>(null);

    return (
        <div 
            className="flex flex-col"
        >
            
        </div>
    );
}