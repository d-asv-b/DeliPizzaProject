import { useEffect, type ReactNode } from "react";
import { IoClose } from "react-icons/io5";

type BasicModalProps = {
    isOpen: boolean;
    title: string;
    minWidth?: number;
    children: ReactNode;
    onClose: () => void;
}

export default function BasicModalWindow({ isOpen, title, minWidth = 72, children, onClose }: BasicModalProps) {
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
        <div className="fixed inset-0 h-full w-full flex items-center justify-center backdrop-blur-sm">
            <div className={ `min-w-1/4 w-full h-full lg:h-fit lg:w-fit lg:rounded-xl p-5 border-2 overflow-y-auto border-gray-600 bg-main text-text-secondary [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:my-3 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:my-3 [&::-webkit-scrollbar-thumb]:bg-scrollbar` }>
                <div className="flex flex-row">
                    <div className="flex-col grow content-center text-2xl text-semibold pr-5">
                        { title }
                    </div>
                    <button 
                        className="hover:cursor-pointer pl-2"
                        onClick={() => onClose()}    
                    >
                        <IoClose size={25} className="text-red-500"/>
                    </button>
                </div>
                <div
                    className="flex flex-row border-t-1 border-gray-500 mt-2 pt-2 justify-center"
                >
                    { children }
                </div>
            </div>
        </div>
    );
} 