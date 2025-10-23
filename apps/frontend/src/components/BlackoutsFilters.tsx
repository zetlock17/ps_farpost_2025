import { useBlackoutsStore } from "../store/blackoutsStore";
import type { BlackoutsQueryParams } from "../api/mockBlackoutsApi";

const BlackoutsFilters = () => {
  const selectedType = useBlackoutsStore((state) => state.selectedType);
  const setTypeFilter = useBlackoutsStore((state) => state.setTypeFilter);
  const clearFilters = useBlackoutsStore((state) => state.clearFilters);

  const filterOptions: { value: BlackoutsQueryParams['type'] | 'all', label: string }[] = [
    { value: 'all', label: 'Все' },
    { value: 'hot_water', label: 'Горячая вода' },
    { value: 'cold_water', label: 'Холодная вода' },
    { value: 'electricity', label: 'Электричество' },
    { value: 'heat', label: 'Отопление' },
  ];

  return (
    <div className="p-5 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Фильтры отключений</h3>
      <div className="flex gap-2.5 flex-wrap">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setTypeFilter(option.value)}
            className={`px-4 py-2 rounded border cursor-pointer transition-all ${
              selectedType === option.value
                ? 'border-2 border-blue-600 bg-blue-600 text-white font-bold'
                : 'border border-gray-300 bg-white text-black hover:bg-gray-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {selectedType !== 'all' && (
        <button
          onClick={clearFilters}
          className="mt-2.5 px-4 py-2 border border-red-600 rounded bg-red-600 text-white cursor-pointer hover:bg-red-700 transition-colors"
        >
          Очистить фильтры
        </button>
      )}
    </div>
  );
};

export default BlackoutsFilters;