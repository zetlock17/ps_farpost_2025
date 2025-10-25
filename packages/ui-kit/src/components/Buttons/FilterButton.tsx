import type { ComponentPropsWithoutRef } from "react";

type FilterButtonProps = ComponentPropsWithoutRef<"button">;

export const FilterButton = ({ children, className, ...props }: FilterButtonProps) => {
    return (
        <button
            {...props}
            className={`inline-flex h-12 items-center justify-center rounded-xl bg-[#F97D41] px-6 text-sm font-semibold shadow-lg transition hover:bg-[#e47036] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        >
            <span className="text-white">{children}</span>
        </button>
    );
};
