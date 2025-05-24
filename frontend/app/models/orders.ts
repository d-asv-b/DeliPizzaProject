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
    deliveryAddressId: string;
    paymentMethodId: string;
    deliveryTime: string;      // строка формата "день/час:минута/час.пояс"
};

interface PlaceOrderResponse {
    orderId: string;
}

interface OrderStatusRequest {
    orderId: string;
}

interface OrderResponse {
    id: string;
    orderPositions: string;
    status: 'created' | 'paid' | 'cooking' | 'cooked' | 'delivering' | 'completed' | 'cancelled';
    deliveryTime: string;
    creationDate: string;
    deliveryCoordinates: [number, number];
    restaurantCoordinates: [number, number];
}

interface OrderCancellationRequest {
    orderId: string;
}

interface OrdersListResponse {
    orders: OrderResponse[];
}