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
  building_number: string;
  street: string;
  district: string;
  folk_district: string;
  big_folk_district: string;
  city: string;
  coordinates: Coordinate;
}

export interface BlackoutsQueryParams {
  type?: "hot_water" | "cold_water" | "electricity" | "heat";
  districts?: string[];
  query?: string;
  startDate?: string;
}

export interface SimilarAddress {
  street: string;
  number: string;
}

export interface District {
  name: string;
}
