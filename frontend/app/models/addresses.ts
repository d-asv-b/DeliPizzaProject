export interface DeliveryAddressRequest {
    city: string;
    street: string;
    building: string;
    room: string;
};

export interface EditDeliveryAddressRequest {
    addressId: string;
    newAddressValue: DeliveryAddressRequest;
};

export interface DeliveryAddress {
    city: string;
    street: string;
    building: string;
    room: string;
    coordinates: string;
};

export interface DeliveryAddressesResponse {
    deliveryAddresses: DeliveryAddress[];
};

export interface DeleteDeliveryAddressRequest {
    addressId: string;
};