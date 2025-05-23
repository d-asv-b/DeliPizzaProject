import { useState } from "react";
import { FaClock, FaMinus, FaPlus } from "react-icons/fa";
import { IoTrash } from "react-icons/io5";
import { useNavigate } from "react-router";
import Button from "~/components/general/Button";
import DropdownMenu from "~/components/general/DropdownMenu";
import { useCartContext } from "~/contexts/CartContext";
import { useDeliveryAddresses } from "~/contexts/DeliveryAddressesContext";
import { usePaymentMethods } from "~/contexts/PaymentMethodsContexts";
import { usePizzaList } from "~/contexts/PizzaListContext";
import { useCartTotal } from "~/hooks/useCartTotal";
import type { DeliveryAddress } from "~/models/addresses";
import { addMinutes, format } from "date-fns"
import { useCloseModal, useModal } from "~/contexts/ModalHost";
import DeliveryTimeModal from "~/components/modals/DeliveryTimeModal";

function roundUpToNextHalfHour(date: Date): Date {
    const result = new Date(date);
    result.setSeconds(0);
    result.setMilliseconds(0);

    const minutes = result.getMinutes();
    if (minutes === 0 || minutes === 30) {
        result.setMinutes(minutes + 30);
    } else {
        const roundedMinutes = minutes < 30 ? 30 : 60;
        result.setMinutes(roundedMinutes);
    }

    return result;
}

export default function Cart() {
    const { cart, removeItem, updateItem, clearCart } = useCartContext();

    const { pizzaList } = usePizzaList();

    const totalCartPrice = useCartTotal();
    const { methods } = usePaymentMethods();
    const { addresses } = useDeliveryAddresses();

    const [ selectedAddressId, setSelectedAddressId ] = useState("");
    const [ selectedMethodId, setSelectedPaymentId ] = useState("");

    const [ deliveryDate, setDeliveryDate ] = useState<"today" | "tomorrow">("today");
    const initialTime = roundUpToNextHalfHour(new Date());
    const [ deliveryTime, setDeliveryTime ] = useState<string>(format(initialTime, "HH:mm"));

    const openModal = useModal();
    const closeModal = useCloseModal();

    const navigate = useNavigate();

    function addressToString(address: DeliveryAddress | undefined) {
        if (address) {
            return `ул. ${address.street}, д. ${address.buildingNumber}, кв./оф. ${address.appartmentNumber}`;
        }

        return "";
    }

    return (
        <div className="h-full w-full flex justify-center items-center bg-transparent">
            <div className="flex flex-col h-5/6 w-3/4 rounded-3xl bg-secondary text-text-secondary">
                <div className="flex flex-row p-5">
                    <Button
                        onClick={ () => navigate("/") }
                    >
                        Назад
                    </Button>
                </div>
                <div className="flex flex-row h-full">
                    <div className="flex flex-col h-full w-4/7 p-5 gap-2">
                        <div className="flex flex-col p-5 bg-main rounded-2xl">
                            <div className="font-semibold text-2xl">
                                Детали доставки:
                            </div>
                            <div className="flex flex-col gap-2 mt-2 items-center">
                                <div>
                                    <div className="text-lg">
                                        Адрес доставки:
                                    </div>
                                    <div>
                                        <DropdownMenu
                                            extraClasses="w-md max-w-md"
                                            title={ selectedAddressId ? addressToString(addresses.find((address) => address.id === selectedAddressId)) : "Выберите адрес доставки" }
                                            items={ 
                                                addresses.map(address => 
                                                    ({ 
                                                        title: addressToString(address), 
                                                        onClick: () => { setSelectedAddressId(address.id!) } 
                                                    })
                                                ) 
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col w-md max-w-md">
                                    <div className="text-lg">
                                        Время доставки:
                                    </div>
                                    <div className="flex flex-col grow">
                                        <div className="flex flex-row items-center gap-5 justify-center">
                                            <div className="text-xl font-semibold">
                                                { deliveryDate === "today" ? "Сегодня" : "Завтра" }, в { deliveryTime }
                                            </div>
                                            <Button
                                                onClick={
                                                    () => {
                                                        const modalId = openModal(
                                                            <DeliveryTimeModal
                                                                onClose={
                                                                    () => closeModal(modalId)
                                                                }
                                                                onSave={
                                                                    (selectedDate, selectedTime) => {
                                                                        setDeliveryDate(selectedDate);
                                                                        setDeliveryTime(selectedTime);
                                                                        closeModal(modalId);
                                                                    }
                                                                }
                                                            >

                                                            </DeliveryTimeModal>
                                                        )
                                                    }
                                                }
                                            >
                                                <div className="flex flex-row items-center gap-2 text-lg font-medium">
                                                    Другое время <FaClock size={ 20 }/>
                                                </div>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col p-5 bg-main rounded-2xl h-1/2">
                            <div className="font-semibold text-2xl">
                                Содержимое заказа:
                            </div>
                            <div className="flex flex-col overflow-y-auto gap-1 grow">
                                {
                                    cart.length 
                                    ?
                                    cart.map(
                                        (item, idx) => (
                                            <div className="flex flex-row gap-2 items-center">
                                                <div className="font-semibold text-lg">
                                                    { idx + 1 }.
                                                </div>
                                                <div className="flex flex-col grow">
                                                    <div className="font-semibold text-text-secondary text-md">
                                                        { pizzaList.find((pizza) => { return pizza.id === item.pizzaId })?.name || "" }
                                                    </div>
                                                    <div className={ `flex flex-col lg:flex-row text-gray-500 text-sm ${ item.ingredients.remove.length && item.ingredients.add.length ? "gap-2 lg:gap-10" : "" }` }>
                                                        <div>
                                                            { item.ingredients.remove.length ? "Убрать:" : "" }
                                                            {
                                                                item.ingredients.remove.map(
                                                                    (ingredientId) => (
                                                                        <div>
                                                                            { 
                                                                                pizzaList
                                                                                    .find(
                                                                                        (pizza) => { 
                                                                                            return pizza.id === item.pizzaId ;
                                                                                        })?.mainIngredients
                                                                                    .find((ingredient) => { 
                                                                                            return ingredient.id === ingredientId;
                                                                                        })?.name 
                                                                                    || 
                                                                                    "" 
                                                                            }
                                                                        </div>
                                                                    )
                                                                )
                                                            }
                                                        </div>

                                                        <div>
                                                            { item.ingredients.add.length ? "Добавить:" : "" }
                                                            {
                                                                item.ingredients.add.map(
                                                                    (ingredientId) => (
                                                                        <div>
                                                                            { 
                                                                                pizzaList
                                                                                    .find(
                                                                                        (pizza) => { 
                                                                                            return pizza.id === item.pizzaId ;
                                                                                        })?.additionalIngredients
                                                                                    .find((ingredient) => { 
                                                                                            return ingredient.id === ingredientId;
                                                                                        })?.name 
                                                                                    || 
                                                                                    "" 
                                                                            }
                                                                        </div>
                                                                    )
                                                                )
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex rounded-2xl bg-input">
                                                    <div className="flex flex-row gap-1 items-center text-center">
                                                        <button 
                                                            className="p-2 text-red-500 hover:text-red-800"
                                                            onClick={
                                                                () => {
                                                                    let newItem = item;
                                                                    --newItem.count;

                                                                    if (newItem.count === 0) {
                                                                        removeItem(idx);
                                                                    }
                                                                    else {
                                                                        updateItem(idx, newItem);
                                                                    }
                                                                }
                                                            }
                                                        >
                                                            <FaMinus size={ 15 }/>
                                                        </button>
                                                        { item.count }
                                                        <button 
                                                            className="p-2 text-green-500 hover:text-green-800"
                                                            onClick={
                                                                () => {
                                                                    let newItem = item;
                                                                    ++newItem.count;
                                                                    updateItem(idx, newItem);
                                                                }
                                                            }>
                                                            <FaPlus size={ 15 }/>
                                                        </button>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={
                                                        () => removeItem(idx)
                                                    }
                                                >
                                                    <IoTrash size={20}/>
                                                </Button>
                                            </div>
                                        )
                                    )
                                    :
                                    <div className="flex w-full h-full items-center justify-center">
                                        <div>
                                            Похоже, что ваша корзина пуста
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col h-full grow p-5">
                        <div className="flex flex-col p-5 bg-main rounded-2xl">
                            <div className="font-semibold text-2xl">
                                Оплата заказа
                            </div>
                            <div className="flex flex-col gap-2 w-full mt-2 items-center">
                                <div>
                                    <div className="text-lg">
                                        Способ оплаты:
                                    </div>
                                    <div>
                                        <DropdownMenu
                                            extraClasses="w-md max-w-md"
                                            title={ selectedMethodId ? `**** **** **** ${methods.find((method) => method.id === selectedMethodId)?.cardLast4Numbers}` : "Выберите способ оплаты" }
                                            items={ 
                                                methods.map(method => 
                                                    ({ 
                                                        title: `**** **** **** ${method.cardLast4Numbers}`, 
                                                        onClick: () => { setSelectedPaymentId(method.id!) } 
                                                    })
                                                ) 
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col w-full grow">
                                    <div className="text-lg">
                                       Цена
                                    </div>
                                    <div className="flex flex-col grow gap-2">
                                        <div className="flex flex-row grow">
                                            <div className="font-semibold grow">
                                                Товары в корзине
                                            </div>
                                            <div className="">
                                                { totalCartPrice }₽
                                            </div>
                                        </div>
                                        <div className="flex flex-row grow">
                                            <div className="font-semibold grow">
                                                Доставка
                                            </div>
                                            <div className="">
                                                59₽
                                            </div>
                                        </div>
                                        <div className="flex flex-row grow">
                                            <div className="font-bold text-2xl grow">
                                                К оплате
                                            </div>
                                            <div className="font-bold text-2xl">
                                                { totalCartPrice + 59 }₽
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        extraClasses="m-2 mt-4 py-4 text-xl font-semibold"
                                        onClick={
                                            () => {}
                                        }
                                    >
                                        Оплатить
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}