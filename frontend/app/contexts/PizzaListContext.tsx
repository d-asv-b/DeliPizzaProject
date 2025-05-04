import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getPizzaList } from "~/api/pizza";
import type { Pizza } from "~/models/pizza";

export type pizzaListState = {
    isLoading: boolean,
    pizzaList: Pizza[]
}

export const pizzaListContext = createContext<pizzaListState>({} as pizzaListState);

export const PizzaListProvider = ({ children }: { children: ReactNode }) => {
    const [ pizzaList, setPizzaList ] = useState([] as Pizza[]);
    const [ isLoading, setLoadingState ] = useState(true);

    useEffect(() => {
        const fetchPizzaList = async () => {            
            try {
                let response = await getPizzaList({});
                setPizzaList(response.pizzaData);
            }
            catch (e) {
                console.log(e);
            }
            finally {
                setLoadingState(false);
            }
        }

        fetchPizzaList();
    }, []);

    return (
        <pizzaListContext.Provider value={ { isLoading, pizzaList } }>
            {children}
        </pizzaListContext.Provider>
    )
}

export const usePizzaList = () => useContext(pizzaListContext);