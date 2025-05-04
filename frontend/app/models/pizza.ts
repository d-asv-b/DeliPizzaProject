export interface Ingredient {
    id: string;
    name: string;
    iconUrl: string;
    price: number
};

export interface Pizza {
    id: string
    name: string
    iconUrl: string
    description: string
    basePrice: number
    mainIngredients: Ingredient[]
    additionalIngredients: Ingredient[]
};

export interface PizzaListRequestData {
    start?: number
    amount?: number
};

export interface PizzaListResponseData {
    pizzaData: Pizza[]
}