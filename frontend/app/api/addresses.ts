
import type { DeliveryAddress, DeliveryAddressesResponse, DeliveryAddressRequest, EditDeliveryAddressRequest, DeleteDeliveryAddressRequest, GeocodeResolveAddressResponse, GeocodeResolveAddressRequest } from "~/models/addresses";
import api from ".";

export async function getUserDeliveryAddresses(): Promise<DeliveryAddress[]> {
    const response = await api.get<DeliveryAddressesResponse>(
        "/addresses/get_list",
    );

    return response.data.userAddresses;
}

export async function addDeliveryAddress(data: DeliveryAddressRequest): Promise<DeliveryAddress[]> {
    const response = await api.post<DeliveryAddressesResponse>(
        "/addresses/add_address",
        data
    );

    return response.data.userAddresses;
}

export async function editDeliveryAddress(data: EditDeliveryAddressRequest): Promise<DeliveryAddress[]> {
    const response = await api.patch<DeliveryAddressesResponse>(
        "/addresses/edit_address",
        data,
        {
            params: {
                addressId: data.addressId
            }
        }
    );

    return response.data.userAddresses;
}

export async function deleteDeliveryAddress(data: DeleteDeliveryAddressRequest): Promise<DeliveryAddress[]> {
    const response = await api.delete<DeliveryAddressesResponse>(
        "/addresses/delete_address",
        {
            params: {
                addressId: data.addressId
            }
        }
    );

    return response.data.userAddresses;
}

export async function resolveAddressByCoords(data: GeocodeResolveAddressRequest): Promise<GeocodeResolveAddressResponse> {
    const response = await api.get<GeocodeResolveAddressResponse>(
        "/addresses/geocode",
        {
            params: {
                lon: data.lon,
                lat: data.lat
            }
        }
    );

    return response.data;
}