import axios, { AxiosRequestConfig } from 'axios';

const axiosServices = axios.create({ baseURL: import.meta.env.VITE_APP_API_URL || 'http://localhost:3010/' });

// ==============================|| AXIOS - FOR MOCK SERVICES ||============================== //

// axiosServices.interceptors.request.use(
//   async (config) => {
//     const accessToken = localStorage.getItem('serviceToken');
//     if (accessToken) {
//       config.headers['Authorization'] = `Bearer ${accessToken}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );


axiosServices.interceptors.request.use(
  async (config) => {
    try {
      const root = localStorage.getItem("persist:root");
      if (root) {
        const parsedRoot = JSON.parse(root);
        const auth = parsedRoot?.auth ? JSON.parse(parsedRoot.auth) : null;
        const accessToken = auth?.token;

        if (accessToken) {
          config.headers = config.headers || {};
          config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
      }
    } catch (err) {
      console.error("Error parsing persist:root", err);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosServices;

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.get(url, { ...config });

  return res.data;
};

export const fetcherPost = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.post(url, { ...config });

  return res.data;
};
