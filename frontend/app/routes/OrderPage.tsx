import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { AxiosError } from "axios";
import {
    YMaps,
    Map,
    Placemark
} from "@iminside/react-yandex-maps";
import { cancelOrder, getOrderStatus } from "~/api/orders";
import Button from "~/components/general/Button";
import { BiLoaderCircle } from "react-icons/bi";
import { format } from "date-fns"
import toast from "react-hot-toast";
import { useAuthContext } from "~/contexts/AuthContext";

export default function OrderStatusPage() {
    const [ searchParams ] = useSearchParams();

    const navigate = useNavigate();

    const { user } = useAuthContext();
    useEffect(
        () => {
            if (user === null) {
                toast.error("Вы не авторизованы!");
                navigate("/signIn");
                return;
            }
        }, [user]
    );

    const orderId = searchParams.get("orderId");
    if (!orderId) {
        navigate("/");
        return;
    }
  
    const [order, setOrder] = useState<OrderStatus | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchOrder = useCallback(async () => {
        try {
            const response = await getOrderStatus({ orderId: orderId });
            setOrder(response);
            setLoading(false);
        } catch (error) {
            navigate("/");
        }
    }, [orderId, navigate]);

    useEffect(() => {
        fetchOrder();
        const interval = setInterval(fetchOrder, 5000);
        return () => clearInterval(interval);
    }, [fetchOrder]);

    const handleCancel = async () => {
        try {
            await cancelOrder({ orderId: orderId });
            fetchOrder();
        } catch (error) {
            if (error instanceof AxiosError && error.response && error.response.data.error) {
                toast.error(error.response.data.error);
            }
            else {
                console.error(error);
                toast.error("Произошла ошибка...");
            }
        }
    };

    if (loading || !order) {
        return (
            <div className="flex h-full w-full justify-center items-center bg-transparent">
                <div className="p-20 rounded-xl bg-secondary">
                    <BiLoaderCircle className="text-text-secondary animate-spin" size={50}/>
                </div>
            </div>
        );
    }

    const showCancel = order.status === "created" || order.status === "paid";
    const statusText = () => {
        if (order.status === "created") {
            return "Заказ создан. Ожидаем оплаты...";
        }
        else if (order.status === "paid") {
            return "Заказ создан и оплачен. Передаем информацию в пиццерию.";
        }
        else if (order.status === "cooking") {
            return `Заказ готовится. Будет в ${ format(new Date(order.deliveryExpected), "HH:mm") }`;
        }
        else if (order.status === "cooked") {
            return "Заказ готов. Пиццерия передает его в службу доставки.";
        }
        else if (order.status === "delivering") {
            return `Курьер спешит к вам с заказом. Будет в ~${ format(new Date(order.deliveryExpected), "HH:mm") }`;
        }
        else if (order.status === "completed") {
            return "Заказ доставлен. Приятного аппетита.";
        }
        else if (order.status === "cancelled") {
            return "Заказ отменен. Деньги скоро вернутся вам на карту.";
        }
        else {
            return "";
        }
    };

    const deliveryAddressCoordsNormal = order.deliveryCoordinates.split(" ").map(Number)
    const restaurantAddressCoordsNormal = order.restaurantCoordinates.split(" ").map(Number)

    return (
        <div className="h-full w-full flex justify-center items-center bg-transparent">
            <div className="flex flex-col h-full w-full rounded-none xl:h-5/6 xl:w-5/6 2xl:w-3/4 3xl:w-2/3 xl:rounded-2xl bg-secondary text-text-secondary">
                <div className="flex flex-row p-5">
                    <Button
                        onClick={ () => navigate("/") }
                    >
                        На главную
                    </Button>
                </div>
                <div className="flex flex-col h-full py-2 px-10">
                    <div className="text-5xl font-bold border-b-2 mb-5 px-2">
                        Заказ от { format(new Date(order.creationDate), "HH:mm dd.MM.yy") }
                    </div>

                    <div className="flex flex-row">
                        <div className="flex grow text-xl font-semibold">
                            { statusText() }
                        </div>

                        {showCancel && (
                            <Button
                                onClick={ handleCancel }
                                extraClasses="bg-red-500 hover:bg-red-600 active:bg-red-800 text-white font-semibold py-2 px-4 rounded-xl transition"
                            >
                                Отменить заказ
                            </Button>
                        )}
                    </div>

                    <div className="flex w-full h-full mt-2 rounded overflow-hidden border">
                        <YMaps>
                            <Map
                                defaultState={ { center: deliveryAddressCoordsNormal, zoom: 15, controls: [] } }
                                width="100%"
                                height="100%"
                            >
                                <Placemark geometry={ deliveryAddressCoordsNormal } options={{ preset: 'islands#blueDotIcon' }} />
                                <Placemark geometry={ restaurantAddressCoordsNormal } options={{ preset: 'islands#redDotIcon' }} />
                            </Map>
                        </YMaps>
                    </div>
                </div>
            </div>
        </div>
    );
};
