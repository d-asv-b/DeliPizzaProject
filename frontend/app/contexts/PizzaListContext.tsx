import { AxiosError } from "axios";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getPizzaList } from "~/api/pizza";
import type { Pizza } from "~/models/pizza";
import { useAuthContext } from "./AuthContext";

export type pizzaListState = {
    isLoading: boolean,
    pizzaList: Pizza[]
}

export const pizzaListContext = createContext<pizzaListState>({} as pizzaListState);

export const PizzaListProvider = ({ children }: { children: ReactNode }) => {
    const [ pizzaList, setPizzaList ] = useState([] as Pizza[]);
    const [ isLoading, setLoadingState ] = useState(true);
    const { user } = useAuthContext();

    useEffect(() => {
        const fetchPizzaList = async () => {            
            try {
                setLoadingState(true);
                let response = await getPizzaList({});
                setPizzaList(response);
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
            }
            finally {
                setLoadingState(false);
            }
        }

        fetchPizzaList();
    }, [user]);

    return (
        <pizzaListContext.Provider value={ { isLoading, pizzaList } }>
            {children}
        </pizzaListContext.Provider>
    )
}

export const usePizzaList = () => useContext(pizzaListContext);