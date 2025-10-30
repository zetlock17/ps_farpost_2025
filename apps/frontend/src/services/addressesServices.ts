import { getRequest } from "./api";
import type { District, SimilarAddress, AddressInfo } from "../types/types";
import dayjs from "dayjs";

export const getSimilarAddresses = async (input: string) => {
  const response = await getRequest<SimilarAddress[]>('/api/address/', { input });
  console.log('Similar addresses response:', response);
  return response.data;
};

export const getDistricts = async () => {
  const response = await getRequest<District[]>('/api/address/districts');
  return response.data;
};

export const getAddressInfo = async (buildingId: string, limit_neighbors: number) => {
  const savedDate = localStorage.getItem('selectedDate');
  const selectedDate = savedDate ? dayjs(savedDate) : dayjs();
  const date = selectedDate.hour(23).minute(59).second(59).millisecond(0).toISOString();

  console.log('Fetching address info with params:', { buildingId, date, limit_neighbors });
  const response = await getRequest<AddressInfo>('/api/blackout/by_address', { building_id: buildingId, date, limit_neighbors });
  console.log('Address info response:', response);
  return response.data;
}