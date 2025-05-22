import type { Pizza, PizzaListRequestData, PizzaListResponseData } from "~/models/pizza";
import api from ".";

export async function getPizzaList(data: PizzaListRequestData): Promise<Pizza[]> {
    const response = await api.get<PizzaListResponseData>(
        "/pizzas/get_list",
        {
            params: {
                start: data.start,
                amount: data.amount
            }
        }
    );
    
    return response.data.pizzaData;
}