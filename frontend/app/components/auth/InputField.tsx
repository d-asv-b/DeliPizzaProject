import React, { useState } from "react";
import {
    FaRegEye,
    FaRegEyeSlash
} from "react-icons/fa"

interface InputFieldProps {
    title: string;
    placeholder?: string;
    type: "phone" | "email" | "name" | "password" | "date";
    maxLength?: number;
    error?: string;
    value: string;
    onChange: (value: string) => void;
}

const InputField: React.FC<InputFieldProps> = ({
    title,
    placeholder,
    type,
    maxLength,
    error = "",
    value,
    onChange,
}) => {
    const [showPassword, setShowPassword] = useState(false);

    let inputType: string = "text";
    switch (type) {
        case "email":
            inputType = "email";
            break;
        case "phone":
            inputType = "tel";
            break;
        case "password":
            inputType = showPassword ? "text" : "password";
            break;
        case "date":
            inputType = "date";
            break;
        case "name":
        default:
            inputType = "text";
            break;
    }

    const handleTogglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };


    const inputPaddingClasses =
        type === "password" ? "px-3 pr-10 py-2" : "px-3 py-2";

    return (
        <div className="mb-4">
            <label className="block font-bold mb-2 text-text-secondary">{title}</label>
            <div className="relative">
                <input
                    type={inputType}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    maxLength={
                        ["name", "email", "phone"].includes(type) && maxLength
                            ? maxLength
                            : undefined
                    }
                    className={`w-full ${ inputPaddingClasses } px-3 py-2 border ${ error ? "border-red-500" : "border-gray-300" } rounded-md bg-input text-text-input`}
                />
                {
                    type === "password" && (
                    <button
                        type="button"
                        onClick={handleTogglePassword}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
                    >
                        {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                    </button>
                )}
                {maxLength && ["name", "email", "phone"].includes(type) && (
                <div className="absolute inset-y-0 right-0 pr-3 place-content-center align-middle inline-block text-right text-sm text-gray-500">
                    {value.length}/{maxLength}
                </div>
                )}
            </div>
            
            {error && (
                <p className="text-red-500 text-sm mt-1">
                    {error}
                </p>
            )}
        </div>
    );
};

export default InputField;