import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type FormEvent,
    type PointerEvent as ReactPointerEvent,
} from "react";
import { DatePicker, ConfigProvider } from "antd";
import ruRU from "antd/locale/ru_RU";
import dayjs, { type Dayjs } from "dayjs";
import "dayjs/locale/ru";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FilterButton, Select } from "ui-kit";
import MapOfBlackouts from "./MapOfBlackouts";
import { useBlackoutsStore } from "../store/blackoutsStore";
import type { BlackoutsQueryParams } from "../types/types";

dayjs.locale("ru");

const typeOptions: { value: "hot_water" | "cold_water" | "electricity" | "heat" | "all"; label: string }[] = [
    { value: "all", label: "Все" },
    { value: "hot_water", label: "Горячая вода" },
    { value: "cold_water", label: "Холодная вода" },
    { value: "electricity", label: "Электричество" },
    { value: "heat", label: "Отопление" },
];

const PANEL_MIN_HEIGHT = 25;
const PANEL_MAX_HEIGHT = 500;
const MOBILE_PANEL_HEIGHT = 380;

const TaxiAggregatorLayout = () => {
    const fetchBlackouts = useBlackoutsStore((state) => state.fetchBlackouts);
    const setTypeFilter = useBlackoutsStore((state) => state.setTypeFilter);
    const setDistrictFilter = useBlackoutsStore((state) => state.setDistrictFilter);
    const searchBlackouts = useBlackoutsStore((state) => state.searchBlackouts);
    const setSelectedDate = useBlackoutsStore((state) => state.setSelectedDate);
    const clearFilters = useBlackoutsStore((state) => state.clearFilters);
    const selectedType = useBlackoutsStore((state) => state.selectedType);
    const selectedDistrict = useBlackoutsStore((state) => state.selectedDistrict);
    const availableDistricts = useBlackoutsStore((state) => state.availableDistricts);
    const filteredBlackouts = useBlackoutsStore((state) => state.filteredBlackouts);
    const isLoading = useBlackoutsStore((state) => state.isLoading);
    const error = useBlackoutsStore((state) => state.error);
    const searchQuery = useBlackoutsStore((state) => state.searchQuery);
    const selectedDate = useBlackoutsStore((state) => state.selectedDate);

    const [draftQuery, setDraftQuery] = useState("");
    const [panelHeight, setPanelHeight] = useState<number>(360);
    const [isResizing, setIsResizing] = useState(false);
    const resizeStateRef = useRef<{ startY: number; startHeight: number }>({
        startY: 0,
        startHeight: 360,
    });
    const [isMobile, setIsMobile] = useState<boolean>(() => {
        if (typeof window === "undefined") {
            return false;
        }
        return window.matchMedia("(max-width: 640px)").matches;
    });

    useEffect(() => {
        return () => {
            document.body.classList.remove("select-none");
        };
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const handleResize = () => {
            setIsMobile(window.matchMedia("(max-width: 640px)").matches);
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        if (isMobile) {
            setPanelHeight(MOBILE_PANEL_HEIGHT);
            setIsResizing(false);
            document.body.classList.remove("select-none");
        }
    }, [isMobile]);

    useEffect(() => {
        fetchBlackouts();
    }, [fetchBlackouts]);

    useEffect(() => {
        setDraftQuery(searchQuery);
    }, [searchQuery]);

    const hasActiveFilters = useMemo(() => {
        return (
            selectedType !== "all" ||
            selectedDistrict !== "all" ||
            searchQuery.trim().length > 0 ||
            selectedDate !== null
        );
    }, [selectedType, selectedDistrict, selectedDate, searchQuery]);

    const resultLabel = useMemo(() => {
        if (isLoading) {
            return "Поиск подходящих отключений...";
        }

        if (filteredBlackouts.length === 0) {
            return "Ничего не найдено";
        }

        if (filteredBlackouts.length === 1) {
            return "Найдено 1 отключение";
        }

        if (filteredBlackouts.length < 5) {
            return `Найдено ${filteredBlackouts.length} отключения`;
        }

        return `Найдено ${filteredBlackouts.length} отключений`;
    }, [filteredBlackouts.length, isLoading]);

    const districtOptions = useMemo(() => {
        return [
            { value: "all", label: "Все районы" },
            ...availableDistricts.map((district) => ({
                value: district,
                label: district,
            })),
        ];
    }, [availableDistricts]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await searchBlackouts(draftQuery);
    };

    const handleTypeSelect = (value: string) => {
        void setTypeFilter(value as BlackoutsQueryParams["type"] | "all");
    };

    const handleDistrictSelect = (value: string) => {
        void setDistrictFilter(value === "all" ? "all" : value);
    };

    const handleDateChange = (date: Dayjs | null) => {
        void setSelectedDate(date ? date.toDate() : null);
    };

    const shiftSelectedDate = (days: number) => {
        const baseDate = selectedDate ? dayjs(selectedDate) : dayjs();
        const newDate = baseDate.add(days, "day");
        void setSelectedDate(newDate.toDate());
    };

    const clampPanelHeight = (value: number) => {
        return Math.min(PANEL_MAX_HEIGHT, Math.max(PANEL_MIN_HEIGHT, value));
    };

    const handleResizeStart = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (isMobile) {
            return;
        }
        event.preventDefault();
        resizeStateRef.current = {
            startY: event.clientY,
            startHeight: panelHeight,
        };
        setIsResizing(true);
        document.body.classList.add("select-none");
    };

    const handleClear = () => {
        setDraftQuery("");
        clearFilters();
        setSelectedDate(null);
    };

    useEffect(() => {
        if (!isResizing || isMobile) {
            return;
        }

        const handlePointerMove = (event: PointerEvent) => {
            const { startY, startHeight } = resizeStateRef.current;
            const delta = startY - event.clientY;
            const nextHeight = clampPanelHeight(startHeight + delta);
            setPanelHeight(nextHeight);
        };

        const handlePointerUp = () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
            setIsResizing(false);
            document.body.classList.remove("select-none");
        };

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
            document.body.classList.remove("select-none");
        };
    }, [isResizing, isMobile]);

    return (
        <ConfigProvider
            locale={ruRU}
            theme={{
                token: {
                    colorPrimary: "#F97D41",
                    borderRadius: 12,
                },
                components: {
                    DatePicker: {
                        activeBorderColor: "#F97D41",
                        hoverBorderColor: "#F97D41",
                    },
                },
            }}
        >
            <div className="relative h-screen w-full bg-slate-900">
                <MapOfBlackouts variant="fullscreen" showViewToggle={false} className="h-full" />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center">
                    <div className="pointer-events-auto w-full max-w-3xl px-4 sm:px-6">
                        <div
                            className="flex h-full flex-col overflow-hidden rounded-t-3xl border border-white/30 bg-white/80 backdrop-blur-sm"
                            style={{ height: `${isMobile ? MOBILE_PANEL_HEIGHT : panelHeight}px` }}
                        >
                            <div className="flex items-center justify-center pb-2 pt-3">
                                <div
                                    role="separator"
                                    aria-orientation="horizontal"
                                    aria-disabled={isMobile}
                                    className={`h-1 w-12 rounded-full ${
                                        isResizing ? "bg-[#F97D41]" : "bg-slate-300"
                                    } ${isMobile ? "cursor-default" : "cursor-ns-resize"}`}
                                    onPointerDown={handleResizeStart}
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto px-5 pb-4 pt-2">
                                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                                    <h2 className="text-xl font-semibold text-slate-900">Фильтр отключений</h2>
                                    <span className="text-sm font-medium text-slate-500">{resultLabel}</span>
                                </div>

                                <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
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

                                    <Select
                                        id="district-select"
                                        label="Район"
                                        value={selectedDistrict}
                                        onChange={handleDistrictSelect}
                                        options={districtOptions}
                                    />

                                    <div className="flex flex-col">
                                        <label
                                            className="mb-1.5 text-sm font-medium text-slate-600"
                                            htmlFor="start-date"
                                        >
                                            Дата отключений
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => shiftSelectedDate(-1)}
                                                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                                                aria-label="Предыдущий день"
                                            >
                                                <ChevronLeft className="h-5 w-5" />
                                            </button>
                                            <DatePicker
                                                id="start-date"
                                                value={selectedDate ? dayjs(selectedDate) : null}
                                                onChange={handleDateChange}
                                                placeholder="Выберите дату"
                                                className="h-12 w-full"
                                                format="DD.MM.YYYY"
                                                allowClear={false}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => shiftSelectedDate(1)}
                                                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                                                aria-label="Следующий день"
                                            >
                                                <ChevronRight className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {(hasActiveFilters || selectedDate) && (
                                        <div className="flex flex-col sm:col-span-2 lg:col-span-1">
                                            <label className="mb-1.5 text-sm font-medium text-slate-600">
                                                &nbsp;
                                            </label>
                                            <FilterButton type="button" onClick={handleClear}>
                                                Сбросить фильтры
                                            </FilterButton>
                                        </div>
                                    )}
                                </div>

                                {error && (
                                    <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                                        {error}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default TaxiAggregatorLayout;
