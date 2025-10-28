import { getRequest } from "./api";
import type { District, SimilarAddress } from "../types/types";

export const getSimilarAddresses = async (input: string) => {
  const response = await getRequest<SimilarAddress[]>('/api/address/', { input });
  return response.data;
};

export const getDistricts = async () => {
  const response = await getRequest<District[]>('/api/address/districts');
  return response.data;
};
