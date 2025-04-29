import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import InputField from "~/components/auth/InputField";
import useForm from "~/hooks/useForm";
import { validateEmail, validatePassword } from "~/utils/validators";

export default function SignInPage() {
    const { values, errors, handleFieldChange, validateForm } = useForm(
        {
            email: {
                initialValue: "",
                validateFunc: validateEmail
            },
            password: {
                initialValue: "",
                validateFunc: validatePassword
            },
        }
    );

    let [searchParams] = useSearchParams();
    let navigate = useNavigate();
    
    return (
        <div className="h-full w-full flex justify-center items-center bg-main">
            <div className="flex flex-col w-1/3 px-15 py-5 border-2 rounded-xl bg-secondary">
                <div className="text-xl text-center font-bounded font-bold text-text-secondary">
                    Авторизация
                </div>
                <InputField
                    title="Почта:"
                    type="email"
                    maxLength={30}
                    placeholder="Введите адрес электронной почты..."
                    value={values.email}
                    error={errors.email}
                    onChange={handleFieldChange("email")}
                />
                <InputField
                    title="Пароль:"
                    type="password"
                    placeholder="Введите пароль..."
                    value={values.password}
                    error={errors.password}
                    onChange={handleFieldChange("password")}
                />
                <button className="p-3 text-lg font-semibold font-bounded rounded-2xl bg-primary text-text-primary">
                    Войти
                </button>
        
                <div className="text-center text-text-secondary">
                    <a href="/signUp">Перейти к регистрации</a>
                </div>
            </div>
        </div>
    )
}