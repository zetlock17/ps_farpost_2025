export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Blackout {
  id: string;
  start_date: string;
  end_date: string;
  description: string;
  type: "hot_water" | "cold_water" | "electricity" | "heat";
  building_number: number;
  street: string;
  district: string;
  folk_district: string;
  big_folk_district: string;
  city: string;
  coordinate: Coordinate;
}

export interface BlackoutsQueryParams {
  type?: "hot_water" | "cold_water" | "electricity" | "heat";
}
