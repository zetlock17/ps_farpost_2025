import { create } from "zustand";
import type { Blackout, BlackoutsQueryParams } from "../types/types";
import { getMockBlackouts, searchMockBlackouts } from "../api/mockBlackoutsApi";
import dayjs from "dayjs";

interface BlackoutsState {
    blackouts: Blackout[];
    filteredBlackouts: Blackout[];
    selectedType: BlackoutsQueryParams["type"] | "all";
    selectedDistrict: string | "all";
    availableDistricts: string[];
    searchQuery: string;
    selectedDate: Date | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchBlackouts: () => Promise<void>;
    setTypeFilter: (type: BlackoutsQueryParams["type"] | "all") => Promise<void>;
    setDistrictFilter: (district: string | "all") => Promise<void>;
    searchBlackouts: (query: string) => Promise<void>;
    setSelectedDate: (value: Date | null) => Promise<void>;
    clearFilters: () => void;
    getBlackoutById: (id: string) => Blackout | undefined;
}

export const useBlackoutsStore = create<BlackoutsState>((set, get) => ({
    blackouts: [],
    filteredBlackouts: [],
    selectedType: "all",
    selectedDistrict: "all",
    availableDistricts: [],
    searchQuery: "",
    selectedDate: null,
    isLoading: false,
    error: null,

    fetchBlackouts: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = getMockBlackouts();
            const districts = Array.from(new Set(data.map((item) => item.district))).sort();
            set({
                blackouts: data,
                filteredBlackouts: data,
                availableDistricts: districts,
                selectedType: "all",
                selectedDistrict: "all",
                searchQuery: "",
                selectedDate: null,
                isLoading: false,
            });
        } catch {
            set({
                error: "Ошибка при загрузке данных",
                isLoading: false,
            });
        }
    },

    setTypeFilter: async (type) => {
        const { selectedDistrict, searchQuery, selectedDate } = get();
        const params: BlackoutsQueryParams = {};

        if (type !== "all") {
            params.type = type;
        }

        if (selectedDistrict !== "all") {
            params.district = selectedDistrict;
        }

        if (searchQuery.trim()) {
            params.query = searchQuery;
        }

        if (selectedDate) {
            params.startDate = dayjs(selectedDate).format("YYYY-MM-DD");
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

    setDistrictFilter: async (district) => {
        const { selectedType, searchQuery, selectedDate } = get();
        const params: BlackoutsQueryParams = {};

        if (selectedType !== "all") {
            params.type = selectedType;
        }

        if (district !== "all") {
            params.district = district;
        }

        if (searchQuery.trim()) {
            params.query = searchQuery;
        }

        if (selectedDate) {
            params.startDate = dayjs(selectedDate).format("YYYY-MM-DD");
        }

        set({ isLoading: true, error: null });

        try {
            const data = await searchMockBlackouts(params);
            set({
                filteredBlackouts: data,
                selectedDistrict: district,
                isLoading: false,
            });
        } catch {
            set({ error: "Ошибка при фильтрации данных", isLoading: false });
        }
    },

    searchBlackouts: async (query) => {
        const { selectedType, selectedDistrict, selectedDate } = get();
        const params: BlackoutsQueryParams = {};

        if (selectedType !== "all") {
            params.type = selectedType;
        }

        if (selectedDistrict !== "all") {
            params.district = selectedDistrict;
        }

        if (query.trim()) {
            params.query = query;
        }

        if (selectedDate) {
            params.startDate = dayjs(selectedDate).format("YYYY-MM-DD");
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

    setSelectedDate: async (value) => {
        const { selectedType, selectedDistrict, searchQuery } = get();
        const params: BlackoutsQueryParams = {};

        if (selectedType !== "all") {
            params.type = selectedType;
        }

        if (selectedDistrict !== "all") {
            params.district = selectedDistrict;
        }

        if (searchQuery.trim()) {
            params.query = searchQuery;
        }

        if (value) {
            params.startDate = dayjs(value).format("YYYY-MM-DD");
        }

        set({ isLoading: true, error: null, selectedDate: value });

        try {
            const data = await searchMockBlackouts(params);
            set({
                filteredBlackouts: data,
                isLoading: false,
            });
        } catch {
            set({ error: "Ошибка при фильтрации данных", isLoading: false });
        }
    },

    clearFilters: () => {
        const { blackouts } = get();
        set({
            selectedType: "all",
            selectedDistrict: "all",
            searchQuery: "",
            selectedDate: null,
            filteredBlackouts: blackouts,
            isLoading: false,
            error: null,
        });
    },

    getBlackoutById: (id: string) => {
        const { blackouts } = get();
        return blackouts.find((blackout) => blackout.id === id);
    },
}));
