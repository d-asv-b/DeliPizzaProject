import { usePaymentMethods } from "~/contexts/PaymentMethodsContexts"
import Button from "../general/Button";
import { BiTrash } from "react-icons/bi";
import { useCloseModal, useModal } from "~/contexts/ModalHost";
import PaymentMethodModal from "../modals/NewPaymentModal";
import { AxiosError } from "axios";
import { addPaymentMethod, removePaymentMethod } from "~/api/payments";
import DeletePaymentMethodModal from "../modals/DeletePaymentMethodModal";

export default function AccountSettingsTab() {
    const { methods, setMethods } = usePaymentMethods();

    const openModal = useModal();
    const closeModal = useCloseModal();

    return (
        <div className="flex flex-col items-center text-text-secondary gap-5">
            {
                methods.length 
                ?
                methods.map(
                    (method, idx) => (
                        <div className="flex flex-row grow gap-5 items-center">
                            <div>{ idx + 1 }.</div>
                            <div>{ method.cardHolder }</div>
                            <div>**** **** **** { method.cardLast4Numbers }</div>
                            <div>{ method.expiryMonth }/{ method.expiryYear }</div>
                            <Button
                                onClick={
                                    () => {
                                        const modalId = openModal(
                                            <DeletePaymentMethodModal
                                                onClose={ () => closeModal(modalId) }
                                                onSave={ async () => {
                                                    try {
                                                        if (method.id) {
                                                            const methodsList = await removePaymentMethod({ methodId: method.id });
                                                            setMethods(methodsList);
                                                        }
                                                        else {
                                                            return "Что-то пошло не так. Перезагрузите страницу и попробуйте снова.";
                                                        }
                                                    }
                                                    catch(error) {
                                                        if (error instanceof AxiosError && error.response && error.response.data.error) {
                                                            return error.response.data.error;
                                                        }
                                                        else {
                                                            return "Произошла ошибка...";
                                                        }
                                                    }
                                                }}
                                            />
                                        )
                                    }
                                }
                            >
                                <BiTrash size={20}/>
                            </Button>
                        </div>
                    )
                )
                :
                <div>
                    У вас еще нет добавленных методов оплаты
                </div>
            }

            <Button
                onClick={
                    () => {
                        const modalId = openModal(
                            <PaymentMethodModal
                                onClose={ () => closeModal(modalId) }
                                onSave={ 
                                    async (newCard) => {
                                        try {
                                            const methodsList = await addPaymentMethod(newCard);
                                            setMethods(methodsList);
                                        }
                                        catch(error) {
                                            if (error instanceof AxiosError && error.response && error.response.data.error) {
                                                return error.response.data.error;
                                            }
                                            else {
                                                return "Произошла ошибка...";
                                            }
                                        }
                                    }
                                }
                            />
                        )
                    }
                }
            >
                Добавить метод оплаты
            </Button>
        </div>
    )
}