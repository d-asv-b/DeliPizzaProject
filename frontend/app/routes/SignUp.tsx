import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import InputField from "~/components/auth/InputField";
import PasswordRequirement from "~/components/auth/PasswordRequirement";
import { Link, useNavigate, useSearchParams } from "react-router";
import useForm from "~/hooks/useForm";
import { checkLength, hasLowerCase, hasNumbers, hasUpperCase, pwdAreEqual, validateEmail, validateName, validatePasswordReg, validatePasswordConfirm, validatePhone } from "~/utils/validators";
import { registerUser } from "~/api/auth";
import toast from "react-hot-toast";
import createSHA512Hash from "~/utils/hash";

import { PiXCircleFill, PiCheckCircleFill } from "react-icons/pi";
import { AxiosError } from "axios";
import { ImSpinner4 } from "react-icons/im";
import { useAuthContext } from "~/contexts/AuthContext";

export default function SignUpPage() {
    const { values, errors, handleFieldChange, validateForm } = useForm(
        {
            name: {
                initialValue: "",
                validateFunc: validateName
            },
            email: {
                initialValue: "",
                validateFunc: validateEmail
            },
            phone: {
                initialValue: "",
                validateFunc: validatePhone
            },
            password: {
                initialValue: "",
                validateFunc: validatePasswordReg
            },
            passwordConfirm: {
                initialValue: "",
                validateFunc: (value, values) => {
                    return validatePasswordConfirm(value, values!.password); 
                }
            },
        }
    );

    const { user, setUserData} = useAuthContext();

    let [searchParams] = useSearchParams();
    let navigate = useNavigate();

    let [ btnIsDisabled, setBtnDisabled ] = useState(false);

    useEffect(() => {
        // Если пользователь уже авторизован, перенаправляем его обратно
        if (user) {
            navigate(searchParams.get("dst") || "/");
        }
    }, []);

    async function submitForm() {
        if (!validateForm()) {
            return;
        }

        setBtnDisabled(true);

        let pwdHash = await createSHA512Hash(values.password);

        try {
            let userData = await registerUser(
                {
                    name: values.name,
                    email: values.email,
                    phoneNumber: values.phone,
                    pwdHash: pwdHash,
                }
            );

            setUserData(userData.userData);
            sessionStorage.setItem("ACCESS_TOKEN", userData.accessToken);

            toast(
                "Вы зарегистрированы! Перенаправляем вас...",
                {
                    icon: <PiCheckCircleFill size={20} className="text-green-600"/>
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
                toast(
                    error.response.data.error,
                    {
                        icon: <PiXCircleFill size={20} className="text-red-600"/>
                    }
                );
            }
            setBtnDisabled(false);
        }
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
                    Регистрация
                </div>

                <InputField
                    title="Имя"
                    type="name"
                    maxLength={20}
                    placeholder="Введите ваше имя..."
                    value={values.name}
                    error={errors.name}
                    onChange={handleFieldChange("name")}
                />

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
                    title="Номер телефона"
                    type="phone"
                    maxLength={16}
                    placeholder="Введите ваш номер телефона..."
                    value={values.phone}
                    error={errors.phone}
                    onChange={handleFieldChange("phone")}
                />

                <InputField
                    title="Пароль"
                    type="password"
                    placeholder="Введите пароль..."
                    value={values.password}
                    error={errors.password}
                    onChange={handleFieldChange("password")}
                />

                <AnimatePresence>
                    {values.password.length > 0 && <motion.div
                        className="flex flex-col gap-0.5 mb-2"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                            height: { duration: 0.4, ease: "easeInOut" }
                        }}
                    >
                        <PasswordRequirement
                            requirementText="Пароль должен быть не короче 8 символов"
                            value={checkLength(values.password)}
                            index={0}
                        />

                        <PasswordRequirement
                            requirementText="В пароле должны быть заглавные буквы"
                            value={hasUpperCase(values.password)}
                            index={1}
                        />

                        <PasswordRequirement
                            requirementText="В пароле должны быть прописные буквы"
                            value={hasLowerCase(values.password)}
                            index={2}
                        />

                        <PasswordRequirement
                            requirementText="В пароле должны быть цифры"
                            value={hasNumbers(values.password)}
                            index={3}
                        />
                    </motion.div>}
                </AnimatePresence>

                <InputField
                    title="Повторите пароль"
                    type="password"
                    placeholder="Введите пароль снова..."
                    value={values.passwordConfirm}
                    error={errors.passwordConfirm}
                    onChange={handleFieldChange("passwordConfirm")}
                />

                <AnimatePresence>
                    {
                        values.passwordConfirm.length > 0 &&
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto"   , opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                                height: { duration: 0.2, ease: "easeInOut" }
                            }}
                            className="mb-5"
                        >
                            <PasswordRequirement
                                requirementText="Пароли должны совпадать"
                                value={pwdAreEqual(values.password, values.passwordConfirm)}
                            />
                        </motion.div>
                    }
                </AnimatePresence>

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
                      bg-primary text-text-primary"
                    onClick={submitForm}
                    disabled={btnIsDisabled}
                >
                    {
                        btnIsDisabled ?
                        <ImSpinner4 size={20} className="animate-spin"/>
                        :
                        "Зарегистрироваться"
                    }
                </button>

                <div className="
                    pt-2
                    text-center duration-0!
                    text-link
                    hover:text-link-hover
                    active:text-link-click"
                >
                    <Link to={ "/signIn" }>Перейти к авторизации</Link>
                </div>
            </div>
        </div>
    )
}