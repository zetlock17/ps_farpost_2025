import { useSearchParams } from 'react-router-dom';
import { useBlackoutsStore } from '../store/blackoutsStore';
import { useEffect } from 'react';
import { ArrowLeft, CalendarClock, Info, Map, MapPin } from 'lucide-react';

const BuildingPage = () => {
  const [searchParams] = useSearchParams();
  const blackoutId = searchParams.get('id');
  
  const getBlackoutById = useBlackoutsStore((state) => state.getBlackoutById);
  const fetchBlackouts = useBlackoutsStore((state) => state.fetchBlackouts);
  const blackouts = useBlackoutsStore((state) => state.blackouts);

  useEffect(() => {
    if (blackouts.length === 0) {
      fetchBlackouts();
    }
  }, [blackouts.length, fetchBlackouts]);

  const blackout = blackoutId ? getBlackoutById(blackoutId) : null;

  const typeLabels: Record<string, string> = {
    hot_water: 'Горячая вода',
    cold_water: 'Холодная вода',
    electricity: 'Электричество',
    heat: 'Отопление',
  };

  const renderNotFound = (message: string) => (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-5">
      <h2 className="text-2xl font-bold mb-4 text-gray-700">Информация не найдена</h2>
      <p className="mb-6 text-gray-500">{message}</p>
      <a 
        href="/" 
        className="inline-flex items-center px-4 py-2 bg-[#F97D41] text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Вернуться на главную
      </a>
    </div>
  );

  if (!blackoutId) {
    return renderNotFound("ID отключения не указан. Пожалуйста, выберите отключение из списка.");
  }

  if (!blackout) {
    return renderNotFound(`Отключение с ID "${blackoutId}" не найдено.`);
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
        <a 
          href="/" 
          className="inline-flex items-center text-[#F97D41] font-semibold mb-6 hover:underline"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Вернуться на главную
        </a>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3 sm:mb-0">
                Детали отключения
              </h2>
              <span className="px-4 py-2 bg-[#F97D41] text-white rounded-full text-sm font-bold self-start sm:self-center">
                {typeLabels[blackout.type]}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="flex items-center text-xl font-semibold text-gray-800 mb-3">
                    <MapPin className="w-6 h-6 mr-3 text-[#F97D41]" />
                    Адрес
                  </h3>
                  <p className="text-gray-600 pl-9">
                    <strong>{blackout.city}</strong>, {blackout.street}, д. {blackout.building_number}
                  </p>
                </div>

                <div>
                  <h3 className="flex items-center text-xl font-semibold text-gray-800 mb-3">
                    <Map className="w-6 h-6 mr-3 text-[#F97D41]" />
                    Местоположение
                  </h3>
                  <div className="pl-9 space-y-1 text-gray-600">
                    <p><strong>Район:</strong> {blackout.district}</p>
                    <p><strong>Народный район:</strong> {blackout.folk_district}</p>
                    <p><strong>Большой народный район:</strong> {blackout.big_folk_district}</p>
                    <p><strong>Координаты:</strong> {blackout.coordinates.latitude.toFixed(6)}, {blackout.coordinates.longitude.toFixed(6)}</p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="flex items-center text-xl font-semibold text-gray-800 mb-3">
                    <Info className="w-6 h-6 mr-3 text-[#F97D41]" />
                    Описание
                  </h3>
                  <p className="text-gray-600 pl-9 leading-relaxed">{blackout.description}</p>
                </div>

                <div>
                  <h3 className="flex items-center text-xl font-semibold text-gray-800 mb-3">
                    <CalendarClock className="w-6 h-6 mr-3 text-[#F97D41]" />
                    Период отключения
                  </h3>
                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg pl-9">
                    <p className="font-medium text-gray-700"><strong>Начало:</strong> {new Date(blackout.start_date).toLocaleString('ru-RU', {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}</p>
                    <p className="font-medium text-gray-700"><strong>Окончание:</strong> {new Date(blackout.end_date).toLocaleString('ru-RU', {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}</p>
                    <p className="mt-2 font-bold text-[#F97D41]">Длительность: {(() => {
                      const start = new Date(blackout.start_date);
                      const end = new Date(blackout.end_date);
                      const diffMs = end.getTime() - start.getTime();
                      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                      const diffDays = Math.floor(diffHours / 24);
                      const remainingHours = diffHours % 24;
                      
                      if (diffDays > 0) {
                        return `${diffDays} дн. ${remainingHours} ч.`;
                      }
                      return `${diffHours} ч.`;
                    })()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildingPage;