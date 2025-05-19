import { useState } from "react";
import BasicModalWindow from "./BasicModal";
import InputField from "../auth/InputField";
import type { UserPublicInfo } from "~/models/auth";
import toast from "react-hot-toast";

export type FieldSetting = {
    title: string;
    key: keyof UserPublicInfo;
    label: string;
    validate: (val: string) => string;
};

export function EditModal({
    isOpen,
    onClose,
    setting,
    initialValue,
    onSave,
}: {
    isOpen: boolean;
    onClose: () => void;
    setting: FieldSetting;
    initialValue: string;
    onSave: (value: string) => Promise<string | null>;
}) {
    const [value, setValue] = useState(initialValue);
    const [error, setError] = useState("");

    const handleSave = async () => {
        const err = setting.validate(value);
        if (err) {
            setError(err);
        } else {
            let error = await onSave(value);
            
            if (!error) {
                toast.success(`${setting.title} обновлён!`);
                onClose();
            } 
            else {
                toast.error(error);
            }
        }
        
    };

    return (
        <BasicModalWindow isOpen={ isOpen } title={ setting.title } onClose={onClose}>
            <div className="flex flex-col">
                <InputField
                    title={ setting.label }
                    type={
                        setting.key === "birthdayDate"
                            ? "date"
                            : setting.key === "email"
                                ? "email"
                                : setting.key === "phoneNumber"
                                    ? "phone"
                                    : "name"
                    }
                    value={ value }
                    error={ error }
                    onChange={ (value) => {
                        setValue(value);
                        setError("");
                    } }
                />
                <button onClick={ handleSave } className="mt-4 py-2 text-sm sm:text-md md:text-lg lg:text-xl font-semibold rounded-xl bg-primary hover:bg-btn-primary-hover active:bg-btn-primary-click text-text-primary">
                    Сохранить
                </button>
            </div>
        </BasicModalWindow>
    );
}