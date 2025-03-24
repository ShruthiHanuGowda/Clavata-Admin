import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_APP_DENERGY_TESTNET_API_URL });

export const getStats = async () => {
  const { data } = await api.get('/v2/stats');
  return data;
};

export const getChartData = async () => {
  const { data } = await axios.get('https://explorernew.denergytestnet.com/stats-api/api/v1/lines/newTxns?resolution=WEEK');
  return data;
};
