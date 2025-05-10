import axios from "axios"
import { refreshTokenPair } from "./auth";

const api = axios.create({
    baseURL: "/api/",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    }
});

api.interceptors.request.use(
    async (config) => {
        let accessToken = sessionStorage.getItem("ACCESS_TOKEN");

        if (accessToken !== null) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    }
)

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        let originalRequest = error.config.originalRequest
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const tokenData = await refreshTokenPair();
                sessionStorage.setItem("ACCESS_TOKEN", tokenData.accessToken);

                return api(originalRequest);
            }
            catch (err) {
                return Promise.reject(err);
            }
        }

        localStorage.removeItem("USER_DATA");
        return Promise.reject(error)
    }
)

export default api