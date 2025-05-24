import { MdEdit } from "react-icons/md";
import { validateName, validateEmail, validatePhone } from "../../utils/validators";
import { useAuthContext } from "~/contexts/AuthContext";
import { EditModal, type FieldSetting } from "../modals/EditModal";
import { useCloseModal, useModal } from "~/contexts/ModalHost";
import { PasswordEditModal } from "../modals/PasswordEditModal";
import { updateUserData, updateUserPassword } from "~/api/account";
import { AxiosError } from "axios";
import type { UpdateUserDataRequest } from "~/models/account";
import createSHA512Hash from "~/utils/hash";
import Button from "../general/Button";

const fieldSettings: FieldSetting[] = [
    { title: "Имя", key: "name", label: "Введите новое имя", validate: validateName },
    { title: "Номер телефона", key: "phoneNumber", label: "Введите новый номер телефона", validate: validatePhone },
    { title: "Адрес эл. почты", key: "email", label: "Введите новую электронную почту", validate: validateEmail },
    { title: "День рождения", key: "birthdayDate", label: "Введите новый день рождения", validate: () => "" },
];

export default function AccountSettingsTab() {
    let { user, setUserData } = useAuthContext();

    const modal = useModal();
    const close = useCloseModal();

    if (!user) {
        return null;
    }

    const openFieldModal = (field: FieldSetting) => {
        const id = modal(
            <EditModal
                isOpen={ true }
                onClose={ () => close(id) }
                setting={ field }
                initialValue={ user[field.key]?.toString() || "" }
                onSave={ async (val) => {
                    try {
                        let result = await updateUserData(
                            {
                                [field.key]: val,
                                fieldName: field.key,
                            } as UpdateUserDataRequest
                        );

                        setUserData(result);
                        close(id);
                        
                        return null;
                    }
                    catch (error) {
                        if (error instanceof AxiosError && error.response) {
                            return error.response.data.error;
                        }
                        else {
                            return "Ошибка...";
                        }
                    }
                }}
            />
        );
    };

    const openPasswordModal = () => {
        const id = modal(
            <PasswordEditModal
                isOpen={ true }
                onClose={ () => close(id) }
                onSave={ async (oldPwd, newPwd) => {
                    let oldPwdHash = await createSHA512Hash(oldPwd);
                    let newPwdHash = await createSHA512Hash(newPwd);

                    try {
                        let result = await updateUserPassword(
                            {
                                oldPassword: oldPwdHash,
                                newPassword: newPwdHash
                            }
                        );

                        setUserData(result);
                        close(id);

                        return null
                    }
                    catch (error) {
                        if (error instanceof AxiosError && error.response) {
                            return error.response.data.error;
                        }
                        else {
                            return "Ошибка...";
                        }
                    }
                }}
            />
        );
    };

    return (
        <div
            className="flex flex-col items-center"
        >
            <div className="flex flex-col">
                {
                    fieldSettings.map(
                        (setting, idx) => (
                            <div className="flex flex-row text-sm sm:text-md md:text-lg lg:text-xl items-center not-first:border-t-2 not-first:mt-2 pt-2 border-gray-300 text-text-secondary">
                                <div className="grow pr-5">
                                    {setting.title}:
                                </div>
                                <div className="pr-2">
                                    {
                                        user[setting.key]?.toString() || "-"
                                    }
                                </div>
                                
                                <Button
                                    onClick={
                                        () => {
                                            openFieldModal(setting);
                                        }
                                    }
                                >
                                    <MdEdit size={20}/>
                                </Button>
                            </div>
                        )
                    )
                }

                <button
                    className="p-3 mx-5 mt-3 text-sm sm:text-md md:text-lg lg:text-xl font-semibold rounded-xl bg-primary hover:bg-btn-primary-hover active:bg-btn-primary-click text-text-primary"
                    onClick={ () => {
                        openPasswordModal();
                    }}
                >
                    Сменить пароль
                </button>
            </div>
        </div>
    );
}