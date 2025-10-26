import type { Blackout, BlackoutsQueryParams } from '../types/types';

const mockBlackouts: Blackout[] = [
  {
    id: "1",
    start_date: "2018-01-01 00:08:00",
    end_date: "2018-01-01 18:00:00",
    description: "Плановое отключение горячей воды",
    type: "hot_water",
    building_number: 115,
    street: "Олега Кошевого",
    district: "Первомайский",
    folk_district: "Центр",
    big_folk_district: "Центральный",
    city: "Владивосток",
    coordinate: {
      latitude: 43.118149232314195,
      longitude: 131.91705567259487
    }
  },
  {
    id: "2",
    start_date: "2018-01-01 00:08:00",
    end_date: "2018-01-03 18:00:00",
    description: "Конец света",
    type: "electricity",
    building_number: 28,
    street: "Алеутская",
    district: "Первореченский",
    folk_district: "Вторая речка",
    big_folk_district: "Первореченский",
    city: "Владивосток",
    coordinate: {
      latitude: 43.16961073676316,
      longitude: 131.91495033291815
    }
  },
  {
    id: "3",
    start_date: "2018-01-01 00:08:00",
    end_date: "2018-05-03 18:00:00",
    description: "Ремонт системы холодного водоснабжения",
    type: "cold_water",
    building_number: 42,
    street: "Океанский проспект",
    district: "Первореченский",
    folk_district: "Океанская",
    big_folk_district: "Первореченский",
    city: "Владивосток",
    coordinate: {
      latitude: 43.18063759738267,
      longitude: 131.92124785113728
    }
  },
  {
    id: "4",
    start_date: "2018-01-04 00:08:00",
    end_date: "2018-01-06 12:00:00",
    description: "Плановое отключение отопления",
    type: "heat",
    building_number: 7,
    street: "Пологая",
    district: "Ленинский",
    folk_district: "Эгершельд",
    big_folk_district: "Ленинский",
    city: "Владивосток",
    coordinate: {
      latitude: 43.17903755954418,
      longitude: 131.91691874069434
    }
  },
  {
    id: "5",
    start_date: "2018-01-06 00:08:00",
    end_date: "2018-01-07 12:00:00",
    description: "Техническое обслуживание системы горячего водоснабжения",
    type: "hot_water",
    building_number: 33,
    street: "Русская",
    district: "Фрунзенский",
    folk_district: "Русская",
    big_folk_district: "Фрунзенский",
    city: "Владивосток",
    coordinate: {
      latitude: 43.178232189099894,
      longitude: 131.91783887186472
    }
  },
  {
    id: "6",
    start_date: "2018-01-04 00:08:00",
    end_date: "2018-01-09 12:00:00",
    description: "Плановые работы на электроподстанции хыхых",
    type: "electricity",
    building_number: 55,
    street: "100 лет Владивостоку",
    district: "Советский",
    folk_district: "Снеговая падь",
    big_folk_district: "Советский",
    city: "Владивосток",
    coordinate: {
      latitude: 43.1888338,
      longitude: 131.91752145
    }
  },
  {
    id: "7",
    start_date: "2018-01-02 00:08:00",
    end_date: "2018-01-12 12:00:00",
    description: "Замена участка водопровода",
    type: "cold_water",
    building_number: 12,
    street: "Партизанский проспект",
    district: "Первомайский",
    folk_district: "Луговая",
    big_folk_district: "Первомайский",
    city: "Владивосток",
    coordinate: {
      latitude: 43.189505131334414,
      longitude: 131.91565886820456
    }
  },
  {
    id: "8",
    start_date: "2018-01-12 00:08:00",
    end_date: "2018-01-12 12:00:00",
    description: "Ремонт теплотрассы",
    type: "heat",
    building_number: 89,
    street: "Борисенко",
    district: "Ленинский",
    folk_district: "Борисенко",
    big_folk_district: "Ленинский",
    city: "Владивосток",
    coordinate: {
      latitude: 43.1908353876483,
      longitude: 131.91714886267664
    }
  }
];

function filterBlackouts(params?: BlackoutsQueryParams): Blackout[] {
  let filteredBlackouts = [...mockBlackouts];

  if (params?.type) {
    filteredBlackouts = filteredBlackouts.filter(
      (blackout) => blackout.type === params.type
    );
  }

  if (params?.district) {
    filteredBlackouts = filteredBlackouts.filter(
      (blackout) => blackout.district.toLowerCase() === params.district?.toLowerCase()
    );
  }

  if (params?.query) {
    const normalized = params.query.trim().toLowerCase();
    filteredBlackouts = filteredBlackouts.filter((blackout) => {
      const searchableValues = [
        blackout.description,
        blackout.street,
        blackout.district,
        blackout.folk_district,
        blackout.big_folk_district,
        blackout.city,
        String(blackout.building_number)
      ];

      return searchableValues.some((value) =>
        value.toLowerCase().includes(normalized)
      );
    });
  }

  if (params?.startDate) {
    const dayStart = new Date(`${params.startDate}T00:00:00`);
    if (!Number.isNaN(dayStart.getTime())) {
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayStartTimestamp = dayStart.getTime();
      const dayEndTimestamp = dayEnd.getTime();

      filteredBlackouts = filteredBlackouts.filter((blackout) => {
        const startTimestamp = Date.parse(blackout.start_date.replace(" ", "T"));
        return (
          !Number.isNaN(startTimestamp) &&
          startTimestamp >= dayStartTimestamp &&
          startTimestamp < dayEndTimestamp
        );
      });
    }
  }

  return filteredBlackouts;
}

export function getMockBlackouts(params?: BlackoutsQueryParams): Blackout[] {
  return filterBlackouts(params);
}

export function searchMockBlackouts(params?: BlackoutsQueryParams): Promise<Blackout[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(filterBlackouts(params));
    }, 400);
  });
}
