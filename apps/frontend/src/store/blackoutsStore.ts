import { create } from "zustand";
import type { Blackout, BlackoutsQueryParams, District, SimilarAddress } from "../types/types";
import dayjs from "dayjs";
import { getDistricts, getSimilarAddresses } from "../services/addressesServices";
import { getBlackoutsByDate } from "../services/blackoutsServices";

interface BlackoutsState {
    blackouts: Blackout[];
    filteredBlackouts: Blackout[];
    selectedType: BlackoutsQueryParams["type"] | "all";
    selectedDistricts: string[];
    availableDistricts: District[];
    searchQuery: string;
    selectedDate: dayjs.Dayjs | null;
    similarAddresses: SimilarAddress[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchBlackouts: () => Promise<void>;
    fetchDistricts: () => Promise<void>;
    fetchSimilarAddresses: (query: string) => Promise<void>;
    clearSimilarAddresses: () => void;
    setTypeFilter: (type: BlackoutsQueryParams["type"] | "all") => Promise<void>;
    setDistrictFilter: (districts: string[]) => Promise<void>;
    searchBlackouts: (query: string) => Promise<void>;
    setDateFilter: (value: dayjs.Dayjs | null) => Promise<void>;
    clearFilters: () => void;
    getBlackoutById: (id: string) => Blackout | undefined;
}

function filterBlackouts(blackouts: Blackout[], params: BlackoutsQueryParams): Blackout[] {
    let filtered = [...blackouts];

    if (params.type) {
        filtered = filtered.filter((blackout) => blackout.type === params.type);
    }

    if (params.districts && params.districts.length > 0) {
        const lowerCaseDistricts = params.districts.map((d) => d.toLowerCase());
        filtered = filtered.filter(
            (blackout) =>
                lowerCaseDistricts.includes(blackout.district.toLowerCase()) ||
                lowerCaseDistricts.includes(blackout.folk_district.toLowerCase()) ||
                lowerCaseDistricts.includes(blackout.big_folk_district.toLowerCase())
        );
    }

    if (params.query) {
        const normalized = params.query.trim().toLowerCase();
        filtered = filtered.filter((blackout) => {
            const searchableValues = [
                blackout.description,
                blackout.street,
                blackout.district,
                blackout.folk_district,
                blackout.big_folk_district,
                blackout.city,
                blackout.building_number,
            ];

            return searchableValues.some((value) =>
                value.toLowerCase().includes(normalized)
            );
        });
    }

    return filtered;
}

export const useBlackoutsStore = create<BlackoutsState>((set, get) => ({
    blackouts: [],
    filteredBlackouts: [],
    selectedType: "all",
    selectedDistricts: [],
    availableDistricts: [],
    searchQuery: "",
    selectedDate: (() => {
        const saved = localStorage.getItem('selectedDate');
        return saved ? dayjs(saved) : dayjs();
    })(),
    similarAddresses: [],
    isLoading: false,
    error: null,

    fetchBlackouts: async () => {
        set({ isLoading: true, error: null });
        try {
            set({
                blackouts: [],
                filteredBlackouts: [],
                isLoading: false,
            });
            get().setDateFilter(get().selectedDate);
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

    fetchSimilarAddresses: async (query: string) => {
        if (query.length < 3) {
            set({ similarAddresses: [] });
            return;
        }
        try {
            const addresses = await getSimilarAddresses(query);
            set({ similarAddresses: addresses });
        } catch (error) {
            console.error("Failed to fetch similar addresses:", error);
            set({ error: "Не удалось загрузить похожие адреса" });
        }
    },

    clearSimilarAddresses: () => {
        set({ similarAddresses: [] });
    },

    setTypeFilter: async (type) => {
        const { selectedDistricts, searchQuery, blackouts } = get();
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

        set({ isLoading: true, error: null });

        try {
            const filtered = filterBlackouts(blackouts, params);
            set({
                filteredBlackouts: filtered,
                selectedType: type,
                isLoading: false,
            });
        } catch {
            set({ error: "Ошибка при фильтрации данных", isLoading: false });
        }
    },

    setDistrictFilter: async (districts) => {
        const { selectedType, searchQuery, blackouts } = get();

        if (districts.length === 0) {
            set({
                selectedDistricts: [],
                filteredBlackouts: blackouts,
            });
            return;
        }

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

        set({ isLoading: true, error: null });

        try {
            const filtered = filterBlackouts(blackouts, params);
            set({
                filteredBlackouts: filtered,
                selectedDistricts: districts,
                isLoading: false,
            });
        } catch {
            set({ error: "Ошибка при фильтрации данных", isLoading: false });
        }
    },

    searchBlackouts: async (query) => {
        const { selectedType, selectedDistricts, blackouts } = get();
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

        set({ isLoading: true, error: null });

        try {
            const filtered = filterBlackouts(blackouts, params);
            set({
                filteredBlackouts: filtered,
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
            localStorage.removeItem('selectedDate');
            return;
        }

        set({ isLoading: true, error: null, selectedDate: value });
        localStorage.setItem('selectedDate', value.toISOString());

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

            // Apply current filters
            const { selectedType, selectedDistricts, searchQuery } = get();
            const params: BlackoutsQueryParams = {};
            if (selectedType !== "all") params.type = selectedType;
            if (selectedDistricts.length > 0) params.districts = selectedDistricts;
            if (searchQuery.trim()) params.query = searchQuery;
            const filtered = filterBlackouts(data, params);
            set({ filteredBlackouts: filtered });
        } catch {
            set({ error: "Ошибка при фильтрации данных", isLoading: false });
        }
    },

    clearFilters: () => {
        set({
            selectedType: "all",
            selectedDistricts: [],
            searchQuery: "",
            filteredBlackouts: get().blackouts,
        });
    },

    getBlackoutById: (id: string) => {
        const { blackouts } = get();
        return blackouts.find((blackout) => blackout.id === id);
    },
}));
