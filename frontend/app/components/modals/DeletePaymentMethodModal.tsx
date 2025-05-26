import toast from "react-hot-toast";
import Button from "../general/Button";
import BasicModalWindow from "./BasicModal";

type PaymentMethodModalProps = {
    onClose: () => void;
    onSave: () => Promise<string>;
};

export default function DeletePaymentMethodModal({ onClose, onSave }: PaymentMethodModalProps) {
    return (
        <BasicModalWindow
            title="Удалить карту"
            onClose={ onClose }
            isOpen={true}
        >
            <div className="flex flex-col justify-center gap-2">
                <div>
                    Вы уверены, что хотите удалить эту?
                </div>
                <div className="flex flex-row justify-center gap-3">
                    <Button 
                        onClick={ async () => {
                            const result = await onSave();
                            if (result) {
                                toast.error(result);
                                return;
                            }

                            onClose();
                        }}
                    >
                        Удалить
                    </Button>

                    <Button
                        onClick={ onClose }
                    >
                        Отмена
                    </Button>
                </div>
            </div>
        </BasicModalWindow>
    )
}

