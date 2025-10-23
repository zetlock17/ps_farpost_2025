import { create } from 'zustand';
import type { Blackout, BlackoutsQueryParams } from '../api/mockBlackoutsApi';
import { getMockBlackouts } from '../api/mockBlackoutsApi';

interface BlackoutsState {
  blackouts: Blackout[];
  filteredBlackouts: Blackout[];
  selectedType: BlackoutsQueryParams['type'] | 'all';
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchBlackouts: () => void;
  setTypeFilter: (type: BlackoutsQueryParams['type'] | 'all') => void;
  clearFilters: () => void;
  getBlackoutById: (id: string) => Blackout | undefined;
}

export const useBlackoutsStore = create<BlackoutsState>((set, get) => ({
  blackouts: [],
  filteredBlackouts: [],
  selectedType: 'all',
  isLoading: false,
  error: null,

  fetchBlackouts: () => {
    set({ isLoading: true, error: null });
    try {
      const data = getMockBlackouts();
      set({ 
        blackouts: data, 
        filteredBlackouts: data,
        isLoading: false 
      });
    } catch {
      set({ 
        error: 'Ошибка при загрузке данных', 
        isLoading: false 
      });
    }
  },

  setTypeFilter: (type) => {
    const { blackouts } = get();
    
    if (type === 'all') {
      set({ 
        selectedType: type, 
        filteredBlackouts: blackouts 
      });
    } else {
      const filtered = blackouts.filter(blackout => blackout.type === type);
      set({ 
        selectedType: type, 
        filteredBlackouts: filtered 
      });
    }
  },

  clearFilters: () => {
    const { blackouts } = get();
    set({ 
      selectedType: 'all', 
      filteredBlackouts: blackouts 
    });
  },

  getBlackoutById: (id: string) => {
    const { blackouts } = get();
    return blackouts.find(blackout => blackout.id === id);
  },
}));
