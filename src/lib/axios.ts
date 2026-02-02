import { getCookie } from "@/utils/commonFunc";
import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_PROXY_API_URL, // your backend URL
    withCredentials: true, // allows sending cookies if backend uses them
});

export const logout = () => {
    localStorage.removeItem("authToken");
    document.cookie = "authorization=; path=/;";
    localStorage.removeItem("persist:auth");
    setTimeout(() => {
        window.location.href = "/doctor-auth/login";
    }, 0);
}

api.interceptors.request.use(
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
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log("error", error);
        console.log(error, "9878")
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
        return Promise.reject(error);
    }
);

export default api;

