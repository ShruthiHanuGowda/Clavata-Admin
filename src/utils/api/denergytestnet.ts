import axios from 'axios';
import { formatDateForApi } from '../../utils/date';

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
  const upperSlot = slot.toUpperCase();
  let url = `/stats-api/api/v1/lines/${id}`;

  if (upperSlot === 'YEAR') {
    const now = new Date();

    // Set to beginning of current month
    const toDate = new Date(now.getFullYear(), now.getMonth(), 1);

    // Subtract 11 months to get 12 months total (inclusive)
    const fromDate = new Date(toDate.getFullYear(), toDate.getMonth() - 11, 1);

    const from = formatDateForApi(fromDate);
    const to = formatDateForApi(toDate); // include current month

    url += `?from=${from}&to=${to}&resolution=MONTH`;
  } else if (upperSlot === 'MONTH') {
    const now = new Date();
    const year = now.getFullYear();

    const fromDate = new Date(year, 0, 1); // Jan 1
    const toDate = new Date(year, 11, 31); // Dec 31

    const from = formatDateForApi(fromDate);
    const to = formatDateForApi(toDate);

    url += `?from=${from}&to=${to}&resolution=MONTH`;
  } else if (upperSlot === 'WEEK') {
    const today = new Date();
    const day = today.getDay(); // 0 (Sun) to 6 (Sat)

    // Calculate Monday
    const diffToMonday = (day === 0 ? -6 : 1) - day; // Sunday = 0, so adjust
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);

    // Calculate Sunday
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const from = formatDateForApi(monday);
    const to = formatDateForApi(sunday);

    url += `?from=${from}&to=${to}&resolution=DAY`; // resolution=DAY to get daily values in the week
  } else if (upperSlot === 'DAY') {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(toDate.getDate() - 6); // Include today, so 7 total

    const from = formatDateForApi(fromDate);
    const to = formatDateForApi(toDate);

    url += `?from=${from}&to=${to}&resolution=DAY`;
  } else {
    url += `?resolution=${upperSlot}`;
  }

  const { data } = await api.get(url);
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
