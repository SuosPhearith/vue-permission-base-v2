import useSnackbar from "@/composables/useSnackbar";
import { router } from "@/plugins/1.router";
import axios from "axios";
import { formTranslater } from "./formLang";

const { trigger } = useSnackbar();

// Create Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  // timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add authorization token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add any other custom headers here
    return config;
  },
  (error) => {
    console.error("[Request Error]", error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { response, config } = error;
    if (response.status !== 401) {
      trigger(formTranslater(response.data.error) || "Something when wrong.", "error");
    }
    if (response) {
      const { status, data } = response;
      switch (status) {
        case 401:
          console.warn("Unauthorized - maybe token expired");
          if (!config._retry) {
            config._retry = true;

            try {
              const refreshTokenRes = await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
                {},
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );

              if (
                refreshTokenRes.status === 200 &&
                refreshTokenRes.data.access_token
              ) {
                localStorage.setItem(
                  "token",
                  refreshTokenRes.data.access_token
                );
                config.headers.Authorization = `Bearer ${refreshTokenRes.data.access_token}`;
                return axiosInstance(config);
              } else {
                router.push(`/login${window.location.search}`);
              }
            } catch (err) {
              router.push(`/login${window.location.search}`);
            }
          } else {
            router.push(`/login${window.location.search}`);
          }
          break;

        case 403:
          console.warn("Forbidden - you do not have access");
          // ::::::::::::::::::::::::::::::::::::::::::::::::: PUSH TO LOGIN SCREEN
          break;

        case 404:
          console.warn("Not Found:", data.message || "Endpoint not found");
          break;

        case 500:
          console.error("Internal Server Error");
          break;

        default:
          console.warn(`Unhandled status ${status}:`, data);
          break;
      }
    } else {
      // Network or CORS errors
      console.error("[Network Error]", error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
