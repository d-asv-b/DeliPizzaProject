import { useCloseModal, useModal } from "~/contexts/ModalHost";
import type { Pizza } from "~/models/pizza";
import PizzaInfoModal from "../modals/PizzaInfoModal";
import { useCartContext } from "~/contexts/CartContext";
import toast from "react-hot-toast";

export default function PizzaCard({ pizza }: {pizza: Pizza}) {
    const openModal = useModal();
    const closeModal = useCloseModal();

    const { addItem } = useCartContext();

    return (
        <div className="flex flex-col sm:flex-row rounded-xl h-100 sm:h-70 bg-secondary text-text-secondary">
            <div className="grow sm:grow-0 sm:w-[260px] aspect-square overflow-hidden">
                <img
                    className="h-full w-full rounded-t-xl sm:rounded-l-xl object-cover object-left" 
                    src={pizza.iconUrl.length != 0 ? pizza.iconUrl : undefined}
                ></img>
            </div>
            <div className="flex flex-col w-full sm:w-10/11 p-5">
                <div className="text-xl font-bold">
                    {pizza.name}
                </div>

                <div className="line-clamp-3 grow text-ellipsis py-0.5 min-h-15">
                    {pizza.shortDescription}
                </div>

                <div className="flex flex-row flex-wrap gap-1 p-1">
                    { 
                        pizza.tags.map(
                            tag => (
                                <div className="border-2 border-gray-600 rounded-2xl px-2 py-1 text-sm cursor-pointer">
                                    { tag.value }
                                </div>
                            )
                        )
                    }
                </div>

                <div className="flex flex-row w-full items-center align-middle justify-between">
                    <div className="text-xl font-bold font-bubble-sans">
                        {pizza.basePrice}₽
                    </div>
                    <div>
                        <button
                            className="rounded-xl p-3 font-bounded cursor-pointer bg-primary text-text-primary hover:bg-primary/85"
                            onClick={ 
                                () => {
                                    const modalId = openModal(
                                        <PizzaInfoModal
                                            onClose={
                                                () => {
                                                    closeModal(modalId);
                                                }
                                            }
                                            onSave={
                                                (item: CartItem) => {
                                                    try {
                                                        addItem(item);
                                                        toast.success("Пицци добавлена в корзину!");
                                                        closeModal(modalId);
                                                    }
                                                    catch {
                                                        toast.error("Произошла ошибка. Пожалуйста, перезагрузите страницу и попробуйте снова!");
                                                    }
                                                }
                                            }
                                            pizzaData={ pizza }
                                        />
                                    )
                                }
                            }
                        >
                            В корзину
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}