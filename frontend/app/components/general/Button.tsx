import type { ReactNode } from "react";

type ButtonProps = {
    children?: string | ReactNode;
    isDisabled?: boolean;
    onClick: () => void;
};

export default function Button({ onClick, children: content, isDisabled }: ButtonProps) {
    return (
        <button
            className="p-2 rounded-xl hover:cursor-pointer bg-primary hover:bg-btn-primary-hover active:bg-btn-primary-click text-text-primary disabled:bg-btn-primary-disabled"
            onClick={ onClick }
            disabled={ isDisabled }
        >
            { content }
        </button>
    );
}