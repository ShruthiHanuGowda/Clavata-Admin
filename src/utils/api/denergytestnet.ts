import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_DENERGY_TESTNET_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network Error: Unable to connect to server. Please check your connection.');
    }
    if (error.response?.status === 0) {
      throw new Error('CORS Error: Server configuration issue. Please contact support.');
    }
    throw error;
  }
);

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

export const getNewAccounts = async () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const dd = String(today.getDate()).padStart(2, '0');

  const formattedDate = `${yyyy}-${mm}-${dd}`;

  const { data } = await api.get(`/stats-api/api/v1/lines/newAccounts?from=${formattedDate}&to=${formattedDate}&resolution=DAY`);
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
