import { createContext, useContext, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalEntry = {
    id: number;
    content: ReactNode;
};

const ModalContext = createContext<(modal: ReactNode) => number>(() => 0);
const CloseContext = createContext<(id: number) => void>(() => {});

let nextModalId = 1;

export function ModalProvider({ children }: { children: ReactNode }) {
    const [ modals, setModals ] = useState<ModalEntry[]>([]);

    const openNewModal = ((modal: ReactNode) => {
        let modalId = nextModalId++;
        setModals((prev) => [ ...prev, { id: modalId, content: modal }]);
        return modalId;
    });

    const closeModal = ((id: number) => {
        setModals((prev) => prev.filter((elem) => elem.id != id));
    });

    return (
        <ModalContext.Provider value={ openNewModal }>
            <CloseContext.Provider value={ closeModal }>
                { children }
                {
                    modals.map(
                        (modal) => (
                            createPortal(
                                modal.content,
                                document.getElementById("modal-root") || document.body
                            )
                        )
                    )
                }
            </CloseContext.Provider>
        </ModalContext.Provider>
    )
}

export const useModal = () => useContext(ModalContext);
export const useCloseModal = () => useContext(CloseContext);