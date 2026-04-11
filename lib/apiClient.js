import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

const apiClient = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    timeout: 20000,
});

apiClient.interceptors.request.use((config) => {
    // Universal request logger and request modifier (for auth tokens, etc)
    console.debug("API Request", { url: config.url, method: config.method, data: config.data });
    return config;
}, (error) => {
    return Promise.reject(error);
});

apiClient.interceptors.response.use((response) => {
    console.debug("API Response", { url: response.config.url, status: response.status, data: response.data });
    return response;
}, (error) => {
    if (error.response) {
        console.error("API Client Error", { url: error.config?.url, status: error.response.status, data: error.response.data });
    } else {
        console.error("API Client Network/Timeout Error", error.message);
    }
    return Promise.reject(error);
});

export default apiClient;
