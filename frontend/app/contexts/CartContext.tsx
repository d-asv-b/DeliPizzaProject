import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type IngredientPriceMap = {
  [id: string]: number;
}

type PizzaPriceMap = {
  [pizzaId: string]: number;
}

type CartContextType = {
    cart: CartItem[];
    totalPrice: (pizzaPrices: PizzaPriceMap, ingredientPrices: IngredientPriceMap) => number;
    addItem: (item: CartItem) => void;
    removeItem: (idx: number) => void;
    updateItem: (idx: number, newItem: CartItem) => void;
    clearCart: () => void;
};

export const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartContextProvider = ({ children }: { children: ReactNode }) => {
    const [ cart, setCart ] = useState<CartItem[]>([]);

    useEffect(() => {
        const storedCart = localStorage.getItem("CART");

        if (storedCart) {
            try {
                setCart(JSON.parse(storedCart));
            }
            catch {
                console.warn("Failed to parse cart from local storage. Removing it.");
                localStorage.removeItem("CART");
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("CART", JSON.stringify(cart));
    }, [cart]);

    const calculateTotalPrice = (pizzaPrices: PizzaPriceMap, ingredientPrices: IngredientPriceMap) => {
        let totalPrice = 0;

        for (let item of cart) {
            let itemTotalPrice = 0;
            itemTotalPrice += pizzaPrices[item.pizzaId] ?? 0;

            for (let ingredientId in item.ingredients.add) {
                itemTotalPrice += ingredientPrices[ingredientId] ?? 0;
            }

            totalPrice += itemTotalPrice * item.count;
        }

        return totalPrice;
    };

    const addCartItem = (item: CartItem) => {
        setCart((prev) => [ ...prev, item ]);
    };

    const removeCartItem = (idx: number) => {
        setCart(
            (prev) => {
                return prev.filter((_, i) => i !== idx);
            }
        );
    };

    const updateCartItem = (idx: number, newItem: CartItem) => {
        setCart(
            (prev) => {
                return prev.map(
                    (item, i) => i === idx ? { ...item, ...newItem } : item
                );
            }
        );
    };

    const clearCart = () => setCart([]);

    return (
        <CartContext.Provider 
            value={ 
                { 
                    cart: cart,
                    totalPrice: calculateTotalPrice,
                    addItem: addCartItem,
                    removeItem: removeCartItem,
                    updateItem: updateCartItem,
                    clearCart: clearCart
                } 
            }>
            {children}
        </CartContext.Provider>
    );
};

export const useCartContext = () => useContext(CartContext);