import { getRequest } from "./api";
import type { Blackout } from "../types/types";

export const getBlackoutsByDate = async (date: string) => {
  const response = await getRequest<Blackout[]>('/api/blackout/', { date });
  console.log('Blackouts for date', date, ':', response.data);
  return response.data;
};
