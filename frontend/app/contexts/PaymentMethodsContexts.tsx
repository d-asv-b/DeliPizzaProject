import { AxiosError } from "axios";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getPaymentMethods } from "~/api/payments";
import { useAuthContext } from "./AuthContext";


type PaymentMethodContextType = {
    methods: PaymentMethod[];
    setMethods: (val: PaymentMethod[]) => void;
};

export const PaymentMethodsContext = createContext<PaymentMethodContextType>({} as PaymentMethodContextType);

export const PaymentMethodsContextProvide = ({ children }: { children: ReactNode }) => {
    const [ paymentMethods, setPaymentMethods ] = useState<PaymentMethod[]>([]);
    const { user } = useAuthContext();

    useEffect(() => {
        const getMethods = async () => {
            try {
                let paymentMethods = await getPaymentMethods();
                return paymentMethods;
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

        getMethods().then(
            (val) => setPaymentMethods(val)
        );
    }, [user]);

    return (
        <PaymentMethodsContext.Provider value={ { methods: paymentMethods, setMethods: setPaymentMethods } }>
            { children }
        </PaymentMethodsContext.Provider>
    );
};

export const usePaymentMethods = () => useContext(PaymentMethodsContext);