import { getRequest } from "./api";
import type { District, SimilarAddress } from "../types/types";

export const getSimilarAddresses = async (street: string, number: string) => {
  const response = await getRequest<SimilarAddress[]>('/api/address/', { street, number });
  return response.data;
};

export const getDistricts = async () => {
  const response = await getRequest<District[]>('/api/address/districts');
  return response.data;
};
