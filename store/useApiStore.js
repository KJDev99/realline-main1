"use client";

import { create } from "zustand";
import { getData as apiGet, postData as apiPost, putData as apiPut, deleteData as apiDelete } from "@/lib/apiService";

const useApiStore = create((set, get) => ({
    isLoading: false,
    data: null,
    error: null,

    setLoading: (value) => set({ isLoading: value }),
    setData: (value) => set({ data: value }),
    setError: (value) => set({ error: value }),
    clear: () => set({ isLoading: false, data: null, error: null }),

    getData: async (url, config = {}) => {
        set({ isLoading: true, error: null });
        try {
            const data = await apiGet(url, config);
            set({ data });
            return data;
        } catch (error) {
            set({ error });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    postData: async (url, payload = {}, config = {}) => {
        set({ isLoading: true, error: null });
        try {
            const data = await apiPost(url, payload, config);
            set({ data });
            return data;
        } catch (error) {
            set({ error });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    putData: async (url, payload = {}, config = {}) => {
        set({ isLoading: true, error: null });
        try {
            const data = await apiPut(url, payload, config);
            set({ data });
            return data;
        } catch (error) {
            set({ error });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    deleteData: async (url, config = {}) => {
        set({ isLoading: true, error: null });
        try {
            const data = await apiDelete(url, config);
            set({ data });
            return data;
        } catch (error) {
            set({ error });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },
}));

export default useApiStore;
