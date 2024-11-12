import axios, { AxiosInstance } from "axios";

const api = axios.create({
  baseURL: "http://192.168.18.170:1338/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");

    // Verifica se o URL não é o de login
    if (token && config.url !== "/auth/local") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
