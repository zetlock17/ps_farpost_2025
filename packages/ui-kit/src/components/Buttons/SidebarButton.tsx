import type { ReactNode } from "react";

interface SidebarButtonProps {
    onClick: () => void;
    isActive: boolean;
    "aria-label": string;
    children: ReactNode;
}

export const SidebarButton = ({ onClick, isActive, "aria-label": ariaLabel, children }: SidebarButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={`flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${
                isActive ? "bg-orange-100 text-orange-500" : "text-slate-500 hover:bg-slate-100"
            }`}
            aria-label={ariaLabel}
        >
            {children}
        </button>
    );
};

