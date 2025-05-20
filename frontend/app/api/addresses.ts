
import type { DeliveryAddress, DeliveryAddressesResponse, DeliveryAddressRequest, EditDeliveryAddressRequest, DeleteDeliveryAddressRequest } from "~/models/addresses";
import api from ".";

export async function getUserDeliveryAddresses(): Promise<DeliveryAddress[]> {
    const response = await api.get<null, DeliveryAddressesResponse>(
        "/addresses/get_list",
    );

    return response.deliveryAddresses;
}

export async function addDeleiveryAddress(data: DeliveryAddressRequest): Promise<DeliveryAddress[]> {
    const response = await api.post<DeliveryAddressRequest, DeliveryAddressesResponse>(
        "/addresses/add_address",
        data
    );

    return response.deliveryAddresses;
}

export async function editDeliveryAddress(data: EditDeliveryAddressRequest): Promise<DeliveryAddress[]> {
    const response = await api.patch<EditDeliveryAddressRequest, DeliveryAddressesResponse>(
        "/addresses/edit_address",
        data,
        {
            params: {
                addressId: data.addressId
            }
        }
    );

    return response.deliveryAddresses;
}

export async function deleteDeliveryAddress(data: DeleteDeliveryAddressRequest): Promise<DeliveryAddress[]> {
    const response = await api.delete<null, DeliveryAddressesResponse>(
        "/addresses/delete_address",
        {
            params: {
                addressId: data.addressId
            }
        }
    );

    return response.deliveryAddresses;
}