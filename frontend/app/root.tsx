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
                        <AuthContextProvider>
                            <ModalProvider>
                                <PageContainer>
                                    <Toaster position="top-center"/>
                                    <div id="modal-root"></div>
                                    {children}
                                </PageContainer>
                            </ModalProvider>
                        </AuthContextProvider>
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
