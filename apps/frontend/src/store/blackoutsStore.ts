import { create } from "zustand";
import type { Blackout, BlackoutsQueryParams, District } from "../types/types";
import { getMockBlackouts, searchMockBlackouts } from "../api/mockBlackoutsApi";
import dayjs from "dayjs";
import { getDistricts } from "../services/addressesServices";
import { getBlackoutsByDate } from "../services/blackoutsServices";

interface BlackoutsState {
    blackouts: Blackout[];
    filteredBlackouts: Blackout[];
    selectedType: BlackoutsQueryParams["type"] | "all";
    selectedDistricts: string[];
    availableDistricts: District[];
    searchQuery: string;
    selectedDate: dayjs.Dayjs | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchBlackouts: () => Promise<void>;
    fetchDistricts: () => Promise<void>;
    setTypeFilter: (type: BlackoutsQueryParams["type"] | "all") => Promise<void>;
    setDistrictFilter: (districts: string[]) => Promise<void>;
    searchBlackouts: (query: string) => Promise<void>;
    setDateFilter: (value: dayjs.Dayjs | null) => Promise<void>;
    clearFilters: () => void;
    getBlackoutById: (id: string) => Blackout | undefined;
}

export const useBlackoutsStore = create<BlackoutsState>((set, get) => ({
    blackouts: [],
    filteredBlackouts: [],
    selectedType: "all",
    selectedDistricts: [],
    availableDistricts: [],
    searchQuery: "",
    selectedDate: dayjs(),
    isLoading: false,
    error: null,

    fetchBlackouts: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = getMockBlackouts();
            set({
                blackouts: data,
                isLoading: false,
            });
            // Apply default filters after fetching
            get().setDateFilter(dayjs());
            get().fetchDistricts();
        } catch {
            set({
                error: "Ошибка при загрузке данных",
                isLoading: false,
            });
        }
    },

    fetchDistricts: async () => {
        try {
            const districts = await getDistricts();
            set({ availableDistricts: districts });
        } catch (error) {
            console.error("Failed to fetch districts:", error);
            set({ error: "Не удалось загрузить список районов" });
        }
    },

    setTypeFilter: async (type) => {
        const { selectedDistricts, searchQuery, selectedDate } = get();
        const params: BlackoutsQueryParams = {};

        if (type !== "all") {
            params.type = type;
        }

        if (selectedDistricts.length > 0) {
            params.districts = selectedDistricts;
        }

        if (searchQuery.trim()) {
            params.query = searchQuery;
        }

        if (selectedDate) {
            params.startDate = selectedDate.format("YYYY-MM-DD");
        }

        set({ isLoading: true, error: null });

        try {
            const data = await searchMockBlackouts(params);
            set({
                filteredBlackouts: data,
                selectedType: type,
                isLoading: false,
            });
        } catch {
            set({ error: "Ошибка при фильтрации данных", isLoading: false });
        }
    },

    setDistrictFilter: async (districts) => {
        const { selectedType, searchQuery, selectedDate } = get();
        const params: BlackoutsQueryParams = {};

        if (selectedType !== "all") {
            params.type = selectedType;
        }

        if (districts.length > 0) {
            params.districts = districts;
        }

        if (searchQuery.trim()) {
            params.query = searchQuery;
        }

        if (selectedDate) {
            params.startDate = selectedDate.format("YYYY-MM-DD");
        }

        set({ isLoading: true, error: null });

        try {
            const data = await searchMockBlackouts(params);
            set({
                filteredBlackouts: data,
                selectedDistricts: districts,
                isLoading: false,
            });
        } catch {
            set({ error: "Ошибка при фильтрации данных", isLoading: false });
        }
    },

    searchBlackouts: async (query) => {
        const { selectedType, selectedDistricts, selectedDate } = get();
        const params: BlackoutsQueryParams = {};

        if (selectedType !== "all") {
            params.type = selectedType;
        }

        if (selectedDistricts.length > 0) {
            params.districts = selectedDistricts;
        }

        if (query.trim()) {
            params.query = query;
        }

        if (selectedDate) {
            params.startDate = selectedDate.format("YYYY-MM-DD");
        }

        set({ isLoading: true, error: null });

        try {
            const data = await searchMockBlackouts(params);
            set({
                filteredBlackouts: data,
                searchQuery: query,
                isLoading: false,
            });
        } catch {
            set({ error: "Ошибка при поиске данных", isLoading: false });
        }
    },

    setDateFilter: async (value) => {
        if (!value) {
            set({
                blackouts: [],
                filteredBlackouts: [],
                selectedDate: null,
            });
            return;
        }

        set({ isLoading: true, error: null, selectedDate: value });

        try {
            const today = dayjs().startOf('day');
            let date: string;

            if (value.isBefore(today)) {
                date = value.hour(23).minute(59).second(59).millisecond(0).toISOString();
            } else {
                date = dayjs().toISOString();
            }

            const data = await getBlackoutsByDate(date);
            set({
                blackouts: data,
                filteredBlackouts: data,
                isLoading: false,
            });
        } catch {
            set({ error: "Ошибка при фильтрации данных", isLoading: false });
        }
    },

    clearFilters: () => {
        set({
            selectedType: "all",
            selectedDistricts: [],
            searchQuery: "",
        });
        get().setDateFilter(dayjs());
    },

    getBlackoutById: (id: string) => {
        const { blackouts } = get();
        return blackouts.find((blackout) => blackout.id === id);
    },
}));
