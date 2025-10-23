import { useBlackoutsStore } from "../store/blackoutsStore";
import { Link } from "react-router-dom";

const MapOfBlackouts = () => {
  const filteredBlackouts = useBlackoutsStore((state) => state.filteredBlackouts);
  const isLoading = useBlackoutsStore((state) => state.isLoading);

  const typeLabels: Record<string, string> = {
    hot_water: 'Горячая вода',
    cold_water: 'Холодная вода',
    electricity: 'Электричество',
    heat: 'Отопление',
  };

  const typeColors: Record<string, string> = {
    hot_water: '#ff6b6b',
    cold_water: '#4dabf7',
    electricity: '#ffd43b',
    heat: '#ff8787',
  };

  if (isLoading) {
    return <div className="p-5 text-center">Загрузка карты...</div>;
  }

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">Карта отключений</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 mt-5">
        {filteredBlackouts.map((blackout) => (
          <Link 
            key={blackout.id}
            to={`/building/?id=${blackout.id}`}
            className="no-underline text-inherit"
          >
            <div 
              className="p-4 bg-white rounded-lg shadow-sm cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              style={{ border: `3px solid ${typeColors[blackout.type]}` }}
            >
              <div className="flex justify-between items-center mb-2.5">
                <span 
                  className="px-2 py-1 text-white rounded text-xs font-bold"
                  style={{ background: typeColors[blackout.type] }}
                >
                  {typeLabels[blackout.type]}
                </span>
                <span className="text-xs text-gray-600">
                  {blackout.district}
                </span>
              </div>
              
              <p className="my-1.5 font-bold text-sm">
                {blackout.street}, {blackout.building_number}
              </p>
              
              <p className="my-2.5 text-[13px] text-gray-700 overflow-hidden text-ellipsis whitespace-nowrap">
                {blackout.description}
              </p>
              
              <div className="mt-2.5 text-xs text-gray-500">
                <div>📍 {blackout.folk_district}</div>
                <div className="mt-1.5">
                  🕐 {new Date(blackout.start_date).toLocaleDateString('ru-RU')} - {new Date(blackout.end_date).toLocaleDateString('ru-RU')}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredBlackouts.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          Нет отключений для отображения
        </div>
      )}
    </div>
  );
};

export default MapOfBlackouts;