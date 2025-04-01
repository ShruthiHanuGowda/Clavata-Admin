import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_APP_DENERGY_TESTNET_API_URL });

export const getStats = async () => {
  const { data } = await api.get('/api/v2/stats');
  return data;
};

export const getCounters = async () => {
  const { data } = await api.get('/stats-api/api/v1/counters');
  return data;
};

export const getCharts = async () => {
  const { data } = await api.get('/stats-api/api/v1/lines');
  return data;
};

export const getChartDataById = async (id: string, slot: string) => {
  const { data } = await api.get(`/stats-api/api/v1/lines/${id}?resolution=${slot.toUpperCase()}`);
  return data;
};

export const getTransactionChartData = async (slot: string) => {
  const { data } = await api.get(`/stats-api/api/v1/lines/newTxns?resolution=${slot.toUpperCase()}`);
  return data;
};

export const getWalletChartData = async (slot: string) => {
  const { data } = await api.get(`/stats-api/api/v1/lines/newAccounts?resolution=${slot.toUpperCase()}`);
  return data;
};
