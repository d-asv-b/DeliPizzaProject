import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import InputField from "~/components/auth/InputField";
import PasswordRequirement from "~/components/auth/PasswordRequirement";
import { useNavigate, useSearchParams } from "react-router";
import useForm from "~/hooks/useForm";
import { checkLength, hasLowerCase, hasNumbers, hasUpperCase, pwdAreEqual, validateEmail, validateName, validatePassword, validatePasswordConfirm, validatePhone } from "~/utils/validators";

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
                validateFunc: validatePassword
            },
            passwordConfirm: {
                initialValue: "",
                validateFunc: (value, values) => { return validatePasswordConfirm(value, values!.password); }
            },
        }
    );

    let [searchParams] = useSearchParams();
    let navigate = useNavigate();

    return (
        <div className="h-full w-full flex justify-center items-center bg-main">
            <div className="flex flex-col w-full lg:w-3/7 md:w-3/5 sm:w-1/1 lg:h-auto md:h-auto sm:h-1/1 px-15 p-5 border-2 rounded-xl bg-secondary">
                <div className="text-xl text-center font-bounded font-bold text-text-secondary">
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
                    title="Почта:"
                    type="email"
                    maxLength={30}
                    placeholder="Введите адрес электронной почты..."
                    value={values.email}
                    error={errors.email}
                    onChange={handleFieldChange("email")}
                />

                <InputField
                    title="Номер телефона:"
                    type="phone"
                    maxLength={16}
                    placeholder="Введите ваш номер телефона..."
                    value={values.phone}
                    error={errors.phone}
                    onChange={handleFieldChange("phone")}
                />

                <InputField
                    title="Пароль:"
                    type="password"
                    placeholder="Введите пароль..."
                    value={values.password}
                    error={errors.password}
                    onChange={handleFieldChange("password")}
                />

                <AnimatePresence>
                    {values.password.length > 0 && <motion.div
                        className="flex flex-col gap-0.5 mb-2"
                        style={{ overflow: "hidden" }}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                            height: { duration: 0.4, ease: "easeInOut" }
                        }}
                    >
                        <PasswordRequirement
                            requirementText="Пароль должен быть длиннее 8 символов"
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
                    title="Повторите пароль:"
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
                            style={{ overflow: "hidden" }}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
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

                <button className="p-3 text-lg font-semibold font-bounded rounded-2xl bg-primary text-text-primary">
                    Зарегистрироваться
                </button>

                <div className="text-center text-text-secondary">
                    <a href="/signIn">Перейти к авторизации</a>
                </div>
            </div>
        </div>
    )
}