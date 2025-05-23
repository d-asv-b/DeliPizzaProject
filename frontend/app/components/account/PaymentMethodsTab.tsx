import { usePaymentMethods } from "~/contexts/PaymentMethodsContexts"
import Button from "../general/Button";
import { BiTrash } from "react-icons/bi";

export default function AccountSettingsTab() {
    const { methods } = usePaymentMethods();

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

                    }
                }
            >
                Добавить метод оплаты
            </Button>
        </div>
    )
}