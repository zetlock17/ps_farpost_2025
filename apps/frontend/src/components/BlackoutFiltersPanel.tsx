import { useMemo, useState, type FormEvent, useEffect, useRef } from "react";
import { FilterButton, MultiSelect, Select } from "ui-kit";
import type { Option } from "ui-kit";
import { useBlackoutsStore } from "../store/blackoutsStore";
import type { BlackoutsQueryParams } from "../types/types";
import DateFilter from "./DateFilter";
import { useClickOutside } from "../hooks/useClickOutside";

const typeOptions: { value: "hot_water" | "cold_water" | "electricity" | "heat" | "all"; label: string }[] = [
    { value: "all", label: "Все" },
    { value: "hot_water", label: "Горячая вода" },
    { value: "cold_water", label: "Холодная вода" },
    { value: "electricity", label: "Электричество" },
    { value: "heat", label: "Отопление" },
];

const BlackoutFiltersPanel = () => {
    const setTypeFilter = useBlackoutsStore((state) => state.setTypeFilter);
    const setDistrictFilter = useBlackoutsStore((state) => state.setDistrictFilter);
    const searchBlackouts = useBlackoutsStore((state) => state.searchBlackouts);
    const clearFilters = useBlackoutsStore((state) => state.clearFilters);
    const selectedType = useBlackoutsStore((state) => state.selectedType);
    const selectedDistricts = useBlackoutsStore((state) => state.selectedDistricts);
    const availableDistricts = useBlackoutsStore((state) => state.availableDistricts);
    const isLoading = useBlackoutsStore((state) => state.isLoading);
    const searchQuery = useBlackoutsStore((state) => state.searchQuery);
    const selectedDate = useBlackoutsStore((state) => state.selectedDate);
    const similarAddresses = useBlackoutsStore((state) => state.similarAddresses);
    const fetchSimilarAddresses = useBlackoutsStore((state) => state.fetchSimilarAddresses);
    const clearSimilarAddresses = useBlackoutsStore((state) => state.clearSimilarAddresses);

    const [draftQuery, setDraftQuery] = useState(searchQuery);
    const suggestionsRef = useRef<HTMLDivElement | any>(null);

    useClickOutside(suggestionsRef, () => {
        clearSimilarAddresses();
    });

    const debouncedFetch = useMemo(
        () =>
            debounce((query: string) => {
                void fetchSimilarAddresses(query);
            }, 300),
        [fetchSimilarAddresses]
    );

    useEffect(() => {
        if (draftQuery.trim().length > 2) {
            debouncedFetch(draftQuery);
        } else {
            clearSimilarAddresses();
        }
    }, [draftQuery, debouncedFetch, clearSimilarAddresses]);

    const hasActiveFilters = useMemo(() => {
        return (
            selectedType !== "all" ||
            selectedDistricts.length > 0 ||
            searchQuery.trim().length > 0 ||
            selectedDate !== null
        );
    }, [selectedType, selectedDistricts, selectedDate, searchQuery]);

    const districtOptions = useMemo(() => {
        return availableDistricts.map((district) => ({
            value: district.name,
            label: district.name,
        }));
    }, [availableDistricts]);

    const selectedDistrictOptions = useMemo(() => {
        return districtOptions.filter((option) => selectedDistricts.includes(option.value));
    }, [districtOptions, selectedDistricts]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        clearSimilarAddresses();
        await searchBlackouts(draftQuery);
    };

    const handleTypeSelect = (value: string) => {
        void setTypeFilter(value as BlackoutsQueryParams["type"] | "all");
    };

    const handleDistrictSelect = (options: readonly Option[]) => {
        const values = options.map((option) => option.value);
        void setDistrictFilter(values);
    };

    const handleClear = () => {
        setDraftQuery("");
        clearSimilarAddresses();
        clearFilters();
    };

    return (
        <div className="p-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="relative flex-1" ref={suggestionsRef}>
                    <input
                        type="text"
                        value={draftQuery}
                        onChange={(event) => setDraftQuery(event.target.value)}
                        placeholder="Адрес, район или описание"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#F97D41] focus:outline-none"
                    />
                    {similarAddresses.length > 0 && (
                        <ul className="absolute z-10 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
                            {similarAddresses.map((address) => (
                                <li
                                    key={address.street + address.number}
                                    className="cursor-pointer px-4 py-2 hover:bg-slate-100"
                                    onClick={() => {
                                        const fullAddress = `${address.street}, ${address.number}`;
                                        setDraftQuery(fullAddress);
                                        clearSimilarAddresses();
                                        void searchBlackouts(fullAddress);
                                    }}
                                >
                                    {`${address.street}, ${address.number}`}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <FilterButton type="submit" disabled={isLoading}>
                    {isLoading ? "Ищем..." : "Найти"}
                </FilterButton>
            </form>

            <div className="mt-4 flex flex-col gap-3">
                <Select
                    id="type-select"
                    label="Тип"
                    value={selectedType}
                    onChange={handleTypeSelect}
                    options={typeOptions}
                />

                <MultiSelect
                    id="district-select"
                    label="Район"
                    value={selectedDistrictOptions}
                    onChange={handleDistrictSelect}
                    options={districtOptions}
                    placeholder="Выберите район"
                />

                <DateFilter />

                {(hasActiveFilters || selectedDate) && (
                    <div className="flex flex-col">
                        <label className="mb-1.5 text-sm font-medium text-slate-600">
                            &nbsp;
                        </label>
                        <FilterButton type="button" onClick={handleClear}>
                            Сбросить фильтры
                        </FilterButton>
                    </div>
                )}
            </div>
        </div>
    );
};

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const debounced = (...args: Parameters<F>) => {
        if (timeout !== null) {
            clearTimeout(timeout);
            timeout = null;
        }
        timeout = setTimeout(() => func(...args), waitFor);
    };

    return debounced;
}

export default BlackoutFiltersPanel;
