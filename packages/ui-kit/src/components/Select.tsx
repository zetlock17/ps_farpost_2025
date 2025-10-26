import type { ChangeEvent, ComponentPropsWithoutRef } from "react";

type Option = {
    value: string | number;
    label: string;
};

type SelectProps = Omit<ComponentPropsWithoutRef<"select">, "onChange"> & {
    label: string;
    options: Option[];
    onChange: (value: string) => void;
};

export const Select = ({ id, label, options, value, onChange, ...rest }: SelectProps) => {
    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
        onChange(event.target.value);
    };

    return (
        <div className="flex flex-col">
            <label className="mb-1.5 text-sm font-medium text-slate-600" htmlFor={id}>
                {label}
            </label>
            <select
                id={id}
                value={value}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:border-[#F97D41] focus:outline-none"
                {...rest}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};
