import { useOrdersContext } from "~/contexts/OrdersContext"
import { format } from "date-fns";
import Button from "../general/Button";
import { useNavigate } from "react-router";

export default function AccountSettingsTab() {
    const { orders } = useOrdersContext();
    const navigate = useNavigate();

    const shortStatus = (status: string) => {
        if (status === "created") {
            return "Создан";
        }
        else if (status === "paid") {
            return "Оплачен";
        }
        else if (status === "cooking") {
            return "В готовке";
        }
        else if (status === "cooked") {
            return "Приготовлен";
        }
        else if (status === "delivering") {
            return "В доставке";
        }
        else if (status === "completed") {
            return "Завершен";
        }
        else if (status === "cancelled") {
            return "Отменён";
        }
        else {
            return "";
        }
    }

    return (
        <div className="flex flex-col h-full p-5 gap-2 overflow-y-auto">
            { 
                orders.length 
                ?
                orders.map(
                    (order) => (
                        <div className="flex flex-row border-2 border-gray-500 rounded-xl py-5 p-2">
                            <div className="flex flex-col grow">
                                <div className="text-xl font-bold">
                                    Заказ от { format(new Date(order.creationDate), "HH:mm dd.MM.yy") }
                                </div>

                                <div>
                                    {
                                        order.orderPositions.map(
                                            position => (
                                                <div>
                                                    <div>
                                                        { position.name }
                                                    </div>
                                                    <div className="pl-2 flex flex-col gap-2 text-gray-500">
                                                        {
                                                            position.remove.length ?
                                                            <div>
                                                                Добавить:
                                                                <div className="pl-2">
                                                                    {
                                                                        position.add.map(ingredient => (
                                                                            <div>
                                                                                { ingredient.name }
                                                                            </div>
                                                                        ))
                                                                    }
                                                                </div>
                                                            </div>
                                                            :
                                                            ""
                                                        }
                                                        {
                                                            position.add.length ?
                                                            <div>
                                                                Убрать:
                                                                <div className="pl-2">
                                                                    {
                                                                        position.remove.map(ingredient => (
                                                                            <div>
                                                                                { ingredient.name }
                                                                            </div>
                                                                        ))
                                                                    }
                                                                </div>
                                                            </div>
                                                            :
                                                            ""
                                                        }
                                                    </div>
                                                </div>
                                            )
                                        )
                                    }
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <div className="flex flex-col grow place-self-end items-center">
                                    <div className={ `${order.status === "cancelled" ? "text-red-500" : order.status === "completed" ? "text-green-500" : "" }` }>
                                        { shortStatus(order.status) }
                                    </div>
                                    <div className="font-bubble-sans text-lg">
                                        { order.amount }₽
                                    </div>
                                </div>
                                
                                <div className="justify-self-end">
                                    <Button
                                        onClick={ () => navigate(`/order?orderId=${order.id}`) }
                                    >
                                        Перейти к заказу
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )
                )
                :
                <div className="text-xl grow text-center place-content-center">Вы еще ничего не заказывали</div>
            }
        </div>
    )
}