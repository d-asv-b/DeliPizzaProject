import axios, { AxiosError } from "axios"
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

interface RequestQueueItem {
    resolve: (value?: any) => void;
    reject: (error: any) => void;
}

let isRefreshing = false;
let requestQueue: RequestQueueItem[] = [];

const processRequestQueue = (error: any | null) => {
    requestQueue.forEach(
        (request) => {
            if (error) {
                request.reject(error);
            }
            else {
                request.resolve();
            }
        }
    )

    requestQueue = [];
}

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config!;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(
                    (resolve, reject) => {
                        requestQueue.push({ resolve, reject });
                    }
                ).then(
                    () => {
                        return api(originalRequest)
                    }
                )
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                let accessToken = (await refreshTokenPair());
                sessionStorage.setItem("ACCESS_TOKEN", accessToken);
                processRequestQueue(null);

                return api(originalRequest);
            }
            catch (err) {
                sessionStorage.removeItem("ACCESS_TOKEN");
                localStorage.removeItem("USER_DATA");

                processRequestQueue(err);

                return Promise.reject(err);
            }
            finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error)
    }
)

export default api