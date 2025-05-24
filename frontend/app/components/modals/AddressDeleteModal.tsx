import Button from "../general/Button";
import BasicModalWindow from "./BasicModal";

type AddressDeleteModalProps = {
    onClose: () => void;
    onSave: () => Promise<string>;
};

export default function DeleteAddressModal({ onClose, onSave }: AddressDeleteModalProps) {
    return (
        <BasicModalWindow
            title="Удалить адрес доставки"
            onClose={ onClose }
            isOpen={true}
        >
            <div className="flex flex-col justify-center gap-2">
                <div>
                    Вы уверены, что хотите удалить этот адрес доставки?
                </div>
                <div className="flex flex-row justify-center gap-3">
                    <Button 
                        onClick={ onSave }
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

