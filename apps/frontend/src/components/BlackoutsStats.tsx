import { useBlackoutsStore } from "../store/blackoutsStore";
import BlackoutsFilters from "./BlackoutsFilters";

const BlackoutsStats = () => {
  const filteredBlackouts = useBlackoutsStore((state) => state.filteredBlackouts);
  const isLoading = useBlackoutsStore((state) => state.isLoading);
  const selectedType = useBlackoutsStore((state) => state.selectedType);

  // Подсчет статистики по типам
  const stats = filteredBlackouts.reduce((acc, blackout) => {
    acc[blackout.type] = (acc[blackout.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeLabels: Record<string, string> = {
    hot_water: 'Горячая вода',
    cold_water: 'Холодная вода',
    electricity: 'Электричество',
    heat: 'Отопление',
  };

  if (isLoading) {
    return <div className="p-5 text-center">Загрузка данных...</div>;
  }

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">Статистика отключений</h2>
      
      <BlackoutsFilters />

      <div className="mt-5">
        <h3 className="text-xl font-semibold mb-3">Общая информация</h3>
        <p><strong>Всего отключений:</strong> {filteredBlackouts.length}</p>
        <p><strong>Выбранный фильтр:</strong> {selectedType === 'all' ? 'Все типы' : (selectedType ? typeLabels[selectedType] : 'Не выбран')}</p>
      </div>

      <div className="mt-5">
        <h3 className="text-xl font-semibold mb-3">Распределение по типам</h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          {Object.entries(stats).map(([type, count]) => (
            <div key={type} className="p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
              <div className="text-sm text-gray-600">{typeLabels[type] || type}</div>
              <div className="text-2xl font-bold text-blue-600">{count}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <h3 className="text-xl font-semibold mb-3">Список отключений</h3>
        <div className="flex flex-col gap-2.5">
          {filteredBlackouts.map((blackout) => (
            <div key={blackout.id} className="p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
              <div className="flex justify-between mb-2.5">
                <strong>{typeLabels[blackout.type]}</strong>
                <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs">
                  {blackout.district}
                </span>
              </div>
              <p className="my-1.5"><strong>Адрес:</strong> {blackout.street}, {blackout.building_number}</p>
              <p className="my-1.5"><strong>Описание:</strong> {blackout.description}</p>
              <p className="my-1.5 text-xs text-gray-600">
                <strong>Начало:</strong> {new Date(blackout.start_date).toLocaleString('ru-RU')}
              </p>
              <p className="my-1.5 text-xs text-gray-600">
                <strong>Окончание:</strong> {new Date(blackout.end_date).toLocaleString('ru-RU')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {filteredBlackouts.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          Нет данных для отображения
        </div>
      )}
    </div>
  );
};

export default BlackoutsStats;