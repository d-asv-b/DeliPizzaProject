import type { PizzaListRequestData, PizzaListResponseData } from "~/models/pizza";
import api from ".";

export async function getPizzaList(data: PizzaListRequestData): Promise<PizzaListResponseData> {
    const { data: payload } = await api.get<PizzaListResponseData>(
        "/pizza/get_list",
        {
            params: {
                start: data.start,
                amount: data.amount
            }
        }
    );
    return payload;
}