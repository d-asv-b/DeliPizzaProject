import api from ".";

export async function placeOrder(data: PlaceOrderRequest): Promise<string> {
    const response = await api.post<PlaceOrderResponse>(
        "/orders/place_order",
        data
    );

    return response.data.orderId;
}

export async function getOrderStatus(data: OrderStatusRequest): Promise<OrderResponse> {
    const response = await api.get<OrderResponse>(
        "/orders/get_order_status",
        {
            params: {
                orderId: data.orderId
            }
        }
    );

    return response.data;
}

export async function getUserOrders(): Promise<OrdersListResponse> {
    const response = await api.get<OrdersListResponse>(
        "/orders/get_list"
    );

    return response.data;
}

export async function cancelOrder(data: OrderCancellationRequest) {
    const response = await api.delete(
        "/orders/cancel_order",
        {
            params: {
                orderId: data.orderId
            }
        }
    );
}