import React, { useState, useRef, useEffect } from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

type DropdownItem = {
    title: string;
    onClick: () => void;
};

interface DropdownProps {
    extraClasses?: string;
    items: DropdownItem[];
    title?: string;
}

export default function DropdownMenu( { items, title, extraClasses = "" }: DropdownProps ) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

     const [hasInteracted, setHasInteracted] = useState(false);

    const handleToggle = () => {
        setIsOpen((prev) => !prev);
        setHasInteracted(true);
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
        <button
            onClick={ handleToggle }
            className={ `inline-flex justify-center items-center w-full rounded-md shadow-sm px-4 py-2 bg-input text-sm font-medium text-text-input hover:cursor-pointer focus:outline-none ${extraClasses}` }
        >
            <span className="flex flex-grow justify-center">
                { title }
            </span>
            <span className={ `transform transition-all duration-500 ${ hasInteracted ? (isOpen ? "animate-rotate-arrow-up" : "animate-rotate-arrow-down") : "" }` }>
                <MdOutlineKeyboardArrowDown size={20}/>
            </span>
        </button>

        {isOpen && (
            <div className="absolute right-0 mt-2 w-3/4 rounded-md shadow-lg bg-input ring-1 ring-black ring-opacity-5 z-10">
                <div>
                    { items.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                item.onClick();
                                setIsOpen(false);
                            }}
                            className="block w-full text-center px-4 py-2 text-sm text-text-input hover:text-text-main hover:bg-main hover:cursor-pointer"
                        >
                            {item.title}
                        </button>
                    )) }
                </div>
            </div>
        )}
        </div>
    );
};
