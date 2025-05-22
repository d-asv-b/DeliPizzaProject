export interface DeliveryAddressRequest {
    city: string;
    street: string;
    buildingNumber: string;
    appartmentNumber: string;
};

export interface EditDeliveryAddressRequest {
    addressId: string;
    newAddressValue: DeliveryAddressRequest;
};

export interface DeliveryAddress {
    id?: string;
    city: string;
    street: string;
    buildingNumber: string;
    appartmentNumber: string;
    entranceNumber: string;
    intercom: string;
    comment: string
    coordinates: string;
};

export interface DeliveryAddressesResponse {
    userAddresses: DeliveryAddress[];
};

export interface DeleteDeliveryAddressRequest {
    addressId: string;
};

export interface GeocodeResolveAddressRequest {
    lat: number;
    lon: number;
}

export interface GeocodeResolveAddressResponse {
    city: string;
    street: string;
    buildingNumber: string;
}