import type { Pizza, PizzaListRequestData, PizzaListResponseData, SetFavouriteTagsRequest, Tag, TagsResponse } from "~/models/pizza";
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

export async function getPizzaTags(): Promise<Tag[]> {
    const response = await api.get<TagsResponse>(
        "tags/get_list"
    );

    return response.data.tags;
}

export async function getFavouriteTags(): Promise<Tag[]> {
    const response = await api.get<TagsResponse>(
        "tags/get_favourites"
    );

    return response.data.tags;
}

export async function setUserFavouriteTags(data: SetFavouriteTagsRequest): Promise<Tag[]> {
    const response = await api.patch<TagsResponse>(
        "tags/set_fav_tags",
        data
    );

    return response.data.tags;
}