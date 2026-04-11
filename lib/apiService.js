import apiClient from "./apiClient";

const formatError = (error) => {
    if (!error) return new Error("Unknown error");
    if (error.response) {
        const message = error.response.data?.message || error.response.statusText || "API Error";
        const err = new Error(message);
        err.status = error.response.status;
        err.data = error.response.data;
        return err;
    }
    if (error.request) {
        const err = new Error("No response from server");
        err.data = error.request;
        return err;
    }
    return new Error(error.message || "API Client error");
};

export const getData = async (url, config = {}) => {
    try {
        const response = await apiClient.get(url, config);
        return response.data;
    } catch (error) {
        throw formatError(error);
    }
};

export const postData = async (url, payload = {}, config = {}) => {
    try {
        const response = await apiClient.post(url, payload, config);
        return response.data;
    } catch (error) {
        throw formatError(error);
    }
};

export const putData = async (url, payload = {}, config = {}) => {
    try {
        const response = await apiClient.put(url, payload, config);
        return response.data;
    } catch (error) {
        throw formatError(error);
    }
};

export const deleteData = async (url, config = {}) => {
    try {
        const response = await apiClient.delete(url, config);
        return response.data;
    } catch (error) {
        throw formatError(error);
    }
};
