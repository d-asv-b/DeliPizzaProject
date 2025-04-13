export type Ingredient = {
    id: string,
    name: string,
    iconUrl: string,
    price: number
}

export type Pizza = {
    id: string
    name: string
    iconUrl: string
    description: string
    basePrice: number
    mainIngredients: Ingredient[]
    additionalIngredients: Ingredient[]
}