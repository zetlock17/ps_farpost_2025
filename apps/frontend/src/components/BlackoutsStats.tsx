import { useBlackoutsStore } from "../store/blackoutsStore";
import { Column } from '@ant-design/charts';
import dayjs from "dayjs";

const BlackoutsStats = () => {
  const filteredBlackouts = useBlackoutsStore((state) => state.filteredBlackouts);
  const isLoading = useBlackoutsStore((state) => state.isLoading);
  const selectedType = useBlackoutsStore((state) => state.selectedType);
  const selectedDate = useBlackoutsStore((state) => state.selectedDate);

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

  const hourlyData: { hour: string; count: number; type: string }[] = [];

  const blackoutsForChart = filteredBlackouts.filter(b =>
    selectedDate && dayjs(b.start_date).isSame(selectedDate, 'day')
  );

  const hourlyCounts: Record<string, Record<string, number>> = {};

  for (let i = 0; i < 24; i++) {
    hourlyCounts[`${i}:00`] = {};
  }

  blackoutsForChart.forEach(blackout => {
    const hour = new Date(blackout.start_date).getHours();
    const hourKey = `${hour}:00`;
    if (!hourlyCounts[hourKey]) {
      hourlyCounts[hourKey] = {};
    }
    if (!hourlyCounts[hourKey][blackout.type]) {
      hourlyCounts[hourKey][blackout.type] = 0;
    }
    hourlyCounts[hourKey][blackout.type]++;
  });

  Object.entries(hourlyCounts).forEach(([hour, counts]) => {
    if (Object.keys(counts).length === 0) {
      hourlyData.push({ hour, count: 0, type: 'нет' });
    } else {
      Object.entries(counts).forEach(([type, count]) => {
        hourlyData.push({ hour, count, type: typeLabels[type] || type });
      });
    }
  });

  const chartConfig = {
    data: hourlyData,
    height: 300,
    xField: 'hour',
    yField: 'count',
    isStack: true,
    seriesField: 'type',
    colorField: 'type',
    color: ({ type }: { type: string }) => {
      if (type === 'Горячая вода') return '#FA8C16'; // оранжевый
      if (type === 'Холодная вода') return '#1890FF'; // синий
      if (type === 'Электричество') return '#FADB14'; // желтый
      if (type === 'Отопление') return '#FF4D4F'; // красный
      return '#E8E8E8'; // серый для 'нет'
    },
    xAxis: {
      label: {
        autoRotate: false,
      },
      title: {
        text: 'Час дня',
      }
    },
    yAxis: {
      title: {
        text: 'Кол-во новых отключений',
      }
    },
    tooltip: {
      formatter: (datum: { type: string; count: number }) => {
        return { name: datum.type, value: datum.count };
      },
    },
    legend: {
      layout: 'horizontal' as const,
      position: 'top' as const,
    },
    meta: {
      hour: { alias: 'Час' },
      count: { alias: 'Количество' },
    },
  };

  if (isLoading) {
    return <div className="p-4 text-center">Загрузка данных...</div>;
  }

  return (
    <div className="p-4">
      <div>
        <h3 className="text-lg font-semibold mb-3">Новые отключения за ({selectedDate?.format('DD.MM.YYYY')})</h3>
        <Column {...chartConfig} />
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-3">Общая информация</h3>
        <p><strong>Всего отключений:</strong> {filteredBlackouts.length}</p>
        <p><strong>Выбранный фильтр:</strong> {selectedType === 'all' ? 'Все типы' : (selectedType ? typeLabels[selectedType] : 'Не выбран')}</p>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-3">Распределение по типам</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(typeLabels).map((type) => (
            <div key={type} className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="text-xs text-gray-600">{typeLabels[type]}</div>
              <div className="text-xl font-bold text-blue-600">{stats[type] || 0}</div>
            </div>
          ))}
        </div>
      </div>

      {/* <div className="mt-4">
        <h3 className="text-lg font-semibold mb-3">Список отключений</h3>
        <div className="flex flex-col gap-2">
          {filteredBlackouts.map((blackout) => (
            <div key={blackout.id} className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex justify-between mb-2">
                <strong>{typeLabels[blackout.type]}</strong>
                <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs">
                  {blackout.district}
                </span>
              </div>
              <p className="my-1 text-sm"><strong>Адрес:</strong> {blackout.street}, {blackout.building_number}</p>
              <p className="my-1 text-sm"><strong>Описание:</strong> {blackout.description}</p>
              <p className="my-1 text-xs text-gray-500">
                <strong>Начало:</strong> {new Date(blackout.start_date).toLocaleString('ru-RU')}
              </p>
              <p className="my-1 text-xs text-gray-500">
                <strong>Окончание:</strong> {new Date(blackout.end_date).toLocaleString('ru-RU')}
              </p>
            </div>
          ))}
        </div>
      </div> */}

      {filteredBlackouts.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          Нет данных для отображения
        </div>
      )}
    </div>
  );
};

export default BlackoutsStats;