import api from ".";

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await api.get<PaymentMethodsResponse>(
        "/payments/get_methods"
    );

    return response.data.methods;
}

export async function addPaymentMethod(data: CreatePaymentMethodRequest): Promise<PaymentMethod[]> {
    const response = await api.post<PaymentMethodsResponse>(
        "/payments/add_method",
        data
    );

    return response.data.methods;
}

export async function removePaymentMethod(data: DeletePaymentMethodRequest): Promise<PaymentMethod[]> {
    const response = await api.delete<PaymentMethodsResponse>(
        "/payment/remove_method",
        {
            params: {
                methodId: data.methodId
            }
        }
    );

    return response.data.methods;
}