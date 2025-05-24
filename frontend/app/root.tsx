import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "react-router";

import "./app.css";
import { PizzaListProvider } from "./contexts/PizzaListContext";
import { AppThemeProvider } from "./contexts/AppThemeContext";
import PageContainer from "./PageContainer";
import { Toaster } from "react-hot-toast";
import { AuthContextProvider } from "./contexts/AuthContext";
import { ModalProvider } from "./contexts/ModalHost";
import { DeliveryAddressContextProvider } from "./contexts/DeliveryAddressesContext";
import { PaymentMethodsContext, PaymentMethodsContextProvide } from "./contexts/PaymentMethodsContexts";
import { CartContextProvider } from "./contexts/CartContext";

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="h-full">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <Meta />
                <Links/>
            </head>
            <body className="flex h-full w-full">
                <AppThemeProvider>
                    <PizzaListProvider>
                        <CartContextProvider>
                            <AuthContextProvider>
                                <PaymentMethodsContextProvide>
                                    <DeliveryAddressContextProvider>
                                        <ModalProvider>
                                            <PageContainer>
                                                <Toaster position="top-center"/>
                                                <div id="modal-root"></div>
                                                {children}
                                            </PageContainer>
                                        </ModalProvider>
                                    </DeliveryAddressContextProvider>
                                </PaymentMethodsContextProvide>
                            </AuthContextProvider>
                        </CartContextProvider>
                    </PizzaListProvider>
                </AppThemeProvider>
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
    return <Outlet />;
}
