import { useEffect, type ReactNode } from "react";
import { IoClose } from "react-icons/io5";

type BasicModalProps = {
    isOpen: boolean;
    title: string;
    children: ReactNode;
    onClose: () => void;
}

export default function BasicModalWindow({ isOpen, title, children, onClose }: BasicModalProps) {
    useEffect(
        () => {
            const handleEsc = (e: KeyboardEvent) => {
                if (e.key === "Escape") {
                    onClose();
                }
            };

            if (isOpen) {
                document.addEventListener("keydown", handleEsc);
            }

            return () => {
                document.removeEventListener("keydown", handleEsc);
            };
        },
        [ isOpen, onClose ]
    );

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 h-full w-full flex items-center justify-center backdrop-blur-xs">
            <div className="h-fit min-w-72 max-w-1/2 p-5 rounded-xl bg-white text-text-secondary">
                <div className="flex flex-row">
                    <div className="flex-col grow content-center text-2xl text-semibold pr-5">
                        { title }
                    </div>
                    <button 
                        className="hover:cursor-pointer border-l-1 border-gray-400 m-1 p-2"
                        onClick={() => onClose()}    
                    >
                        <IoClose size={25} className="text-red-500"/>
                    </button>
                </div>
                <div
                    className="flex flex-row pt-2"
                >
                    { children }
                </div>
            </div>
        </div>
    );
}