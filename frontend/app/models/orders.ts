interface CartItem {
    pizzaId: string;           // ID заказанной пиццы
    ingredients: {
        add: string[],         // ID ингредиентов для добавления
        remove: string[]       // ID ингредиентов для удаления
    },
    count: number;
};

interface PlaceOrderRequest {
    cart: CartItem[];
    addressId: string;
    methodId: string;
    time?: Date
};