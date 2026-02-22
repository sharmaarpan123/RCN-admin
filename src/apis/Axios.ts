import { getCookie } from "@/utils/commonFunc";
import axios from "axios";
import toast from "react-hot-toast";

const AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL, // your backend URL
    withCredentials: true, // allows sending cookies if backend uses them
});

export const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    document.cookie = "authorization=; path=/;";
    setTimeout(() => {
        window.location.href = "/";
    }, 0);
}

AxiosInstance.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = getCookie("authorization");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        Promise.reject(error)
    }
);

// Response interceptor → handle errors
AxiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.data === "Internal Server Error") {
            toast.dismiss()
            return toast.error("Network error. Please check your connection and try again.")
        }
        if (error?.data?.message === "Network Error") {
            toast.dismiss();
            toast.error("Network Error");
            return false;
        }
        if (error?.status === 401) {
            if (typeof window !== "undefined") {
                logout()
            }
        }
        return error
    }
);

export default AxiosInstance;

