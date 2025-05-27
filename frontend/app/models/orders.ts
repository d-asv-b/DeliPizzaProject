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

interface OrderStatus {
    id: string;
    orderPositions: string[];
    status: 'created' | 'paid' | 'cooking' | 'cooked' | 'delivering' | 'completed' | 'cancelled';
    deliveryExpected: string;
    creationDate: string;
    deliveryCoordinates: string;
    restaurantCoordinates: string;
    amount?: number;
}

interface OrderHistoryItem {
    id: string;
    orderPositions: {
        name: string;
        add: {
            name: string
        }[];
        remove: {
            name: string
        }[];
    }[];
    status: 'created' | 'paid' | 'cooking' | 'cooked' | 'delivering' | 'completed' | 'cancelled';
    creationDate: string;
    amount?: number;
}

interface OrderResponse {
    orderStatus: OrderStatus;
}

interface OrderCancellationRequest {
    orderId: string;
}

interface OrdersListResponse {
    orders: OrderHistoryItem[];
}