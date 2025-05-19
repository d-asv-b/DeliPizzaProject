import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ImSpinner4 } from "react-icons/im";
import { Link, redirect, useNavigate, useSearchParams } from "react-router";
import { authenticateUser } from "~/api/auth";
import InputField from "~/components/auth/InputField";
import { useAuthContext } from "~/contexts/AuthContext";
import useForm from "~/hooks/useForm";
import createSHA512Hash from "~/utils/hash";
import { checkAuthenticated } from "~/utils/loaderHelpers";
import { validateEmail, validatePasswordAuth } from "~/utils/validators";



export default function SignInPage() {
    const { values, errors, handleFieldChange, validateForm } = useForm(
        {
            email: {
                initialValue: "",
                validateFunc: validateEmail
            },
            password: {
                initialValue: "",
                validateFunc: validatePasswordAuth
            },
        }
    );

    let { user, isLoading, setUserData } = useAuthContext();

    let [searchParams] = useSearchParams();
    let navigate = useNavigate();

    let [ btnIsDisabled, setBtnDisabled ] = useState(false);

    async function submitForm() {
        if (!validateForm()) {
            return;
        }

        setBtnDisabled(true);
        let pwdHash = await createSHA512Hash(values.password);

        try {
            let userData = await authenticateUser(
                {
                    email: values.email,
                    pwdHash: pwdHash,
                }
            );

            setUserData(userData.userData);
            sessionStorage.setItem("ACCESS_TOKEN", userData.accessToken);

            toast.success(
                "Вы авторизованы! Перенаправляем вас...",
                {
                    removeDelay: 100
                }
            );

            setTimeout(
                () => {
                    navigate(searchParams.get("dst") || "/");
                }, 1000
            );
        }
        catch (error) {
            if (error instanceof AxiosError && error.response) {
                toast.error(
                    error.response.data.error
                );
            }

            setBtnDisabled(false);
        }
    }

    if (isLoading) {
        return null;
    }

    return (
        <div className="h-full w-full flex justify-center items-center bg-transparent">
            <div className="
                flex flex-col
                w-full h-full
                justify-center 
                lg:w-3/7 md:w-3/5 sm:w-3/4 
                py-5
                px-5 sm:px-15 
                sm:h-auto 
                sm:border-2 
                sm:rounded-xl
                bg-secondary
                overflow-y-auto
                [&::-webkit-scrollbar]:w-0.5
                sm:[&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:my-3
                [&::-webkit-scrollbar-thumb]:bg-scrollbar"
            >
                <div className="text-2xl text-center font-bounded font-bold text-text-secondary">
                    Авторизация
                </div>
                <InputField
                    title="Почта"
                    type="email"
                    maxLength={30}
                    placeholder="Введите адрес электронной почты..."
                    value={values.email}
                    error={errors.email}
                    onChange={handleFieldChange("email")}
                />
                <InputField
                    title="Пароль"
                    type="password"
                    placeholder="Введите пароль..."
                    value={values.password}
                    error={errors.password}
                    onChange={handleFieldChange("password")}
                />
                <button
                    className="
                        mt-2 p-3 
                        text-md 
                        sm:max-md:text-lg lg:text-xl 
                        font-semibold font-bounded 
                        rounded-2xl
                        place-items-center
                        hover:cursor-pointer hover:bg-btn-primary-hover
                      active:bg-btn-primary-click
                      bg-primary text-text-primary
                    "
                    onClick={ submitForm }
                    disabled={ btnIsDisabled }
                >
                    {
                        btnIsDisabled ?
                        <ImSpinner4 size={20} className="animate-spin"/>
                        :
                        "Войти"
                    }
                </button>
        
                <div 
                    className="
                        pt-2
                        text-center duration-0!
                        text-link
                        hover:text-link-hover
                        active:text-link-click"
                >
                    <Link to={ "/signUp" }>Перейти к регистрации</Link>
                </div>
            </div>
        </div>
    )
}