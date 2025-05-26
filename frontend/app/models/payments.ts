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
    expiryDate: string;
};

interface DeletePaymentMethodRequest {
    methodId: string;
};

interface PaymentMethodsResponse {
    paymentMethods: PaymentMethod[];
};