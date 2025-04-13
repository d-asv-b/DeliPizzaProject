import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import type { Pizza } from "~/typings";

export type pizzaListState = {
    isLoading: boolean,
    pizzaList: Pizza[]
}

export const pizzaListContext = createContext<pizzaListState>({} as pizzaListState);

export const PizzaListProvider = ({ children }: { children: ReactNode }) => {
    const [ pizzaList, setPizzaList ] = useState({} as Pizza[]);
    const [ isLoading, setLoadingState ] = useState(true);

    useEffect(() => {
        const fetchPizzaList = async () => {            
            try {
                let response = await fetch("/api/pizzas/get_list");
                let pizzaList = (await response.json()) as Pizza[];
                setPizzaList(pizzaList);
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