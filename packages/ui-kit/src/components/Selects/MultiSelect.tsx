
import React from 'react';
import Select, { type Props as SelectProps, type GroupBase } from 'react-select';

export interface Option {
    value: string;
    label: string;
}

export interface MultiSelectProps extends SelectProps<Option, true, GroupBase<Option>> {
    label?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ label, ...props }) => {
    return (
        <div>
            {label && <label className="mb-1.5 block text-sm font-medium text-slate-600">{label}</label>}
            <Select
                isMulti
                {...props}
                styles={{
                    control: (base, state) => ({
                        ...base,
                        borderRadius: '0.75rem',
                        borderColor: state.isFocused ? '#F97D41' : '#e2e8f0',
                        boxShadow: state.isFocused ? '0 0 0 1px #F97D41' : 'none',
                        '&:hover': {
                            borderColor: state.isFocused ? '#F97D41' : '#cbd5e1',
                        },
                        minHeight: '48px',
                    }),
                    multiValue: (base) => ({
                        ...base,
                        backgroundColor: '#F97D41',
                        color: 'white',
                        borderRadius: '0.375rem',
                    }),
                    multiValueLabel: (base) => ({
                        ...base,
                        color: 'white',
                        fontWeight: 500,
                    }),
                    multiValueRemove: (base) => ({
                        ...base,
                        color: 'white',
                        '&:hover': {
                            backgroundColor: '#E86C30',
                            color: 'white',
                        },
                    }),
                    option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected ? '#F97D41' : state.isFocused ? '#FEF3EE' : 'white',
                        color: state.isSelected ? 'white' : '#334155',
                        '&:active': {
                            backgroundColor: '#F97D41',
                        },
                    }),
                }}
            />
        </div>
    );
};

export default MultiSelect;
