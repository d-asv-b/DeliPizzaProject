interface PaymentMethod {
    id: string;
    cardHolder: string;
    cardLast4Numbers: string;
    expiryMonth: number;
    expiryYear: number;
    addedAt: string;
};

interface CreatePaymentMethodRequest {
    cardHolder: string;
    cardLast4Numbers: string;
    expiryMonth: number;
    expiryYear: number;
};

interface DeletePaymentMethodRequest {
    methodId: string;
};

interface PaymentMethodsResponse {
    paymentMethods: PaymentMethod[];
};