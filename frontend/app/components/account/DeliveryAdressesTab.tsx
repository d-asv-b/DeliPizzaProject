import { MdEdit  } from "react-icons/md";
import { useDeliveryAddresses } from "~/contexts/DeliveryAddressesContext"
import Button from "../general/Button";
import { BiTrash } from "react-icons/bi";
import { useCloseModal, useModal } from "~/contexts/ModalHost";
import DeliveryAddressModal from "../modals/AddressModal";
import { addDeliveryAddress, editDeliveryAddress } from "~/api/addresses";import { AxiosError } from "axios";
import toast from "react-hot-toast";
import DeleteAddressModal from "../modals/AddressDeleteModal";

export default function AccountSettingsTab() {
    const { addresses, setAddresses } = useDeliveryAddresses();
    const openModal = useModal();
    const closeModal = useCloseModal();

    return (
        <div
            className="flex flex-col items-center"
        >
            <div className="flex flex-col text-text-secondary gap-5">
                {
                    addresses.length ?
                    addresses.map((address) => (
                        <div className="flex flex-row gap-1 items-center">
                            <div className="flex-grow">
                                { `г. ${address.city}, ул. ${address.street}, д. ${address.buildingNumber}, кв./офис ${address.appartmentNumber}` }
                            </div>
                            <Button
                                onClick={
                                    () => {
                                        const id = openModal(
                                            <DeliveryAddressModal
                                                address={address}
                                                onClose={
                                                    () => {
                                                        closeModal(id);
                                                    }
                                                }
                                                onSave={
                                                    async (newAddress) => {
                                                        try {
                                                            if (address.id) {
                                                                const addressesList = await editDeliveryAddress({ addressId: address.id, newAddressValue: newAddress });
                                                                setAddresses(addressesList);
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
                                                    }
                                                }
                                            />
                                        )
                                    }
                                }
                            >
                                <MdEdit size={20}/>
                            </Button>
                            <Button
                                onClick={
                                    () => {
                                        const id = openModal(
                                            <DeleteAddressModal
                                                onClose={ () => {
                                                    closeModal(id);
                                                }}
                                                onSave={ async () => {
                                                    closeModal(id);
                                                    return "";
                                                }}
                                            />
                                        )
                                    }
                                }
                            >
                                <BiTrash size={20}/>
                            </Button>
                        </div>
                    ))
                    :
                    <div>
                        У вас пока не добавлено ни одного адреса доставки
                    </div>
                }
                <Button
                    onClick={
                        () => {
                            const id = openModal(
                                <DeliveryAddressModal
                                    onClose={
                                        () => {
                                            closeModal(id);
                                        }
                                    }
                                    onSave={
                                        async (address) => {
                                            try {
                                                const addresses = await addDeliveryAddress(address);
                                                setAddresses(addresses);
                                            }
                                            catch(error) {
                                                if (error instanceof AxiosError && error.response && error.response.data.error) {
                                                    return error.response.data.error;
                                                }
                                                else {
                                                    return "Произошла ошибка..."
                                                }
                                            }
                                        }
                                    }
                                />
                            );
                        }
                    }
                >
                    Добавить адрес доставки
                </Button>
            </div>
        </div>

    )
}