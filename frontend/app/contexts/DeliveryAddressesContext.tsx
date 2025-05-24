import { AxiosError } from "axios";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getUserDeliveryAddresses } from "~/api/addresses";
import type { DeliveryAddress } from "~/models/addresses";

type DeliveryAddressesContextType = {
    addresses: DeliveryAddress[];
    setAddresses: (addresses: DeliveryAddress[]) => void;
}

export const DeliveryAddressesContext = createContext<DeliveryAddressesContextType>({} as DeliveryAddressesContextType);

export const DeliveryAddressContextProvider = ({ children }: {children : ReactNode}) => {
    const [ deliveryAddresses, setDeliveryAddresses ] = useState<DeliveryAddress[]>([]);

    useEffect(() => {
        const getDeliveryAddresses = async () => {
            try {
                const addresesList = await getUserDeliveryAddresses();
                return addresesList
            }
            catch (error) {
                if (error instanceof AxiosError && error.response) {
                    if (error.response.data.error) {
                        console.error(error.response.data.error);
                    }
                    else {
                        console.error(error.message);
                    }
                }
                else {
                    console.error("Что-то пошло не так :(");
                }

                return [];
            }
        }

        getDeliveryAddresses().then(
            addresses => setDeliveryAddresses(addresses)
        );
    }, []);

    return (
        <DeliveryAddressesContext.Provider value={{ addresses: deliveryAddresses, setAddresses: setDeliveryAddresses }}>
            { children }
        </DeliveryAddressesContext.Provider>
    );
};

export const useDeliveryAddresses = () => useContext(DeliveryAddressesContext);