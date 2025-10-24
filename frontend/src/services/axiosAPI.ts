import { getSessionIdToken } from "@/apps/auth/services/auth";
import axios, { AxiosError } from "axios";
import axiosRetry from "axios-retry";

export const CURRENT_API_URL = import.meta.env.VITE_API_URL;

const axiosAPI = axios.create({
  baseURL: CURRENT_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: agrega token de sesión en cada request
axiosAPI.interceptors.request.use(async (config) => {
  const token = await getSessionIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Configurar reintentos automáticos
axiosRetry(axiosAPI, {
  retries: 2,
  // backoff exponencial para evitar thundering herd
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    const status = error.response?.status;

    // Solo reintentar si es idempotente y fue error de red/timeout o un 5xx
    const is5xx = typeof status === "number" && status >= 500 && status < 600;
    const isNetwork =
      axiosRetry.isNetworkError(error) || error.code === "ECONNABORTED";

    return Boolean(is5xx || isNetwork);
  },
});

// Interceptor de errores
const errorInterceptor = (error: AxiosError) => {
  return Promise.reject(error);
};

axiosAPI.interceptors.response.use((response) => response, errorInterceptor);

export { axiosAPI };
