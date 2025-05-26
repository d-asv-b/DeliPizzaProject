export interface Ingredient {
    id: string;
    name: string;
    iconUrl: string;
    price: number;
};

export interface Tag {
    id: string;
    value: string;
}

export interface TagsResponse {
    tags: Tag[];
}

export interface SetFavouriteTagsRequest {
    tag_ids: string[];
}

export interface Pizza {
    id: string;
    name: string;
    iconUrl: string;
    shortDescription: string;
    description: string;
    tags: Tag[];
    basePrice: number;
    mainIngredients: Ingredient[];
    additionalIngredients: Ingredient[];
};

export interface PizzaListRequestData {
    start?: number;
    amount?: number;
};

export interface PizzaListResponseData {
    pizzaData: Pizza[];
};