import { useMemo, useState, type FormEvent } from "react";
import { FilterButton, MultiSelect, Select } from "ui-kit";
import type { Option } from "ui-kit";
import { useBlackoutsStore } from "../store/blackoutsStore";
import type { BlackoutsQueryParams } from "../types/types";
import DateFilter from "./DateFilter";

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

    const [draftQuery, setDraftQuery] = useState(searchQuery);

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
        clearFilters();
    };

    return (
        <div className="p-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={draftQuery}
                        onChange={(event) => setDraftQuery(event.target.value)}
                        placeholder="Адрес, район или описание"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#F97D41] focus:outline-none"
                    />
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

export default BlackoutFiltersPanel;
