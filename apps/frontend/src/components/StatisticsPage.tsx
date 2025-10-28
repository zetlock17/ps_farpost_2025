import BlackoutsStats from './BlackoutsStats';

const StatisticsPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Статистика отключений</h1>
      <BlackoutsStats />
    </div>
  );
};

export default StatisticsPage;
