import { useCartContext } from "~/contexts/CartContext";
import { usePizzaList } from "~/contexts/PizzaListContext";

export function useCartTotal(): number {
    const { totalPrice } = useCartContext();
    const { pizzaList } = usePizzaList();

    const pizzaPrices = pizzaList
    .reduce(
        (priceMap, pizza) => {
            priceMap[pizza.id] = pizza.basePrice;
            return priceMap;
        }, {} as { [ id: string ]: number }
    );

    const ingredientPrices = pizzaList
    .flatMap(
        (pizza) => [
            ...pizza.mainIngredients,
            ...pizza.additionalIngredients
        ]
    )
    .reduce((priceMap, ingredient) => {
        priceMap[ingredient.id] = ingredient.price;
        return priceMap
    }, {} as { [id: string]: number });

    return totalPrice(pizzaPrices, ingredientPrices);
}
