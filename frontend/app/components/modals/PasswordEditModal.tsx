import { useState } from "react";
import { checkLength, hasUpperCase, hasLowerCase, hasNumbers, pwdAreEqual } from "../../utils/validators";
import BasicModalWindow from "./BasicModal";
import InputField from "../auth/InputField";
import PasswordRequirement from "../auth/PasswordRequirement";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";

export function PasswordEditModal(
    { isOpen, onClose, onSave }: 
    { isOpen: boolean; onClose: () => void; onSave: (oldPwd: string, newPwd: string) => Promise<string | null>; }
) {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [errors, setErrors] = useState<string[]>([]);

    const handleSave = async () => {
        const errs: string[] = [];
        if (!checkLength(newPassword)) errs.push("Минимум 8 символов");
        if (!hasUpperCase(newPassword)) errs.push("Заглавные буквы");
        if (!hasLowerCase(newPassword)) errs.push("Строчные буквы");
        if (!hasNumbers(newPassword)) errs.push("Цифры");
        if (newPassword !== passwordConfirm) errs.push("Пароли не совпадают");

        setErrors(errs);

        if (errs.length === 0) {
            let error = await onSave(oldPassword, newPassword);
            if (!error) {
                toast.success("Пароль обновлен!");
                onClose();
            } 
            else {
                toast.error(error);
            }
        }
    };

    return (
        <BasicModalWindow isOpen={ isOpen } title="Смена пароля" onClose={ onClose }>
            <div className="flex flex-col">
                <InputField
                    title="Старый пароль"
                    type="password"
                    value={ oldPassword }
                    error=""
                    onChange={ (value) => setOldPassword(value) }
                />

                <InputField
                    title="Новый пароль"
                    type="password"
                    value={ newPassword }
                    error=""
                    onChange={ (value) => setNewPassword(value) }
                />
                <AnimatePresence>
                    {newPassword && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
                            <PasswordRequirement requirementText="Минимум 8 символов" value={ checkLength(newPassword) } />
                            <PasswordRequirement requirementText="Заглавные буквы" value={ hasUpperCase(newPassword) } />
                            <PasswordRequirement requirementText="Строчные буквы" value={ hasLowerCase(newPassword) } />
                            <PasswordRequirement requirementText="Цифры" value={ hasNumbers(newPassword) } />
                        </motion.div>
                    )}
                </AnimatePresence>

                <InputField
                    title="Повторите пароль"
                    type="password"
                    value={ passwordConfirm }
                    error=""
                    onChange={ (value) => setPasswordConfirm(value) }
                />

                <AnimatePresence>
                    {
                        passwordConfirm.length > 0 &&
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto"   , opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                                height: { duration: 0.2, ease: "easeInOut" }
                            }}
                            className="mt-2 mb-5"
                        >
                            <PasswordRequirement
                                requirementText="Пароли должны совпадать"
                                value={pwdAreEqual(newPassword, passwordConfirm)}
                            />
                        </motion.div>
                    }
                </AnimatePresence>

                <button onClick={handleSave} className="py-3 text-sm sm:text-md md:text-lg lg:text-xl font-semibold rounded-xl bg-primary hover:bg-btn-primary-hover active:bg-btn-primary-click text-text-primary">
                    Сохранить пароль
                </button>
            </div>
        </BasicModalWindow>
    );
}