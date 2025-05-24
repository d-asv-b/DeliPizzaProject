import { AxiosError } from "axios";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getUserOrders } from "~/api/orders";

type OrdersContextType = {
    orders: OrderHistoryItem[];
    setOrders: (val: OrderHistoryItem[]) => void;
};

export const OrdersContext = createContext<OrdersContextType>({} as OrdersContextType);

export const OrdersContextProvider = ({ children }: { children: ReactNode }) => {
    const [ orders, setOrders ] = useState<OrderHistoryItem[]>([]);

    useEffect(
        () => {
            const getUserOrdersList = async () => {
                try {
                    const result = await getUserOrders();
                    return result;
                }
                catch (error) {
                    if (error instanceof AxiosError && error.response) {
                        if (error.response.data.error) {
                            console.error(error.response.data.error);
                        }
                        else {
                            console.error(error.message);
                        }
                    }
                    else {
                        console.error("Что-то пошло не так :(");
                    }

                    return [];
                }
            }

            getUserOrdersList()
            .then(
                val => setOrders(val)
            );
        }, []
    );

    return (
        <OrdersContext.Provider value={ { orders: orders, setOrders: setOrders } }>
            { children }
        </OrdersContext.Provider>
    );
};

export const useOrdersContext = () => useContext(OrdersContext);