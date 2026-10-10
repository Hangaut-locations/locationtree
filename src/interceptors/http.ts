"use client";

import axios from "axios";
import { toast } from "react-hot-toast";
import { renewTokenIfNeeded, restoreLogin } from "../lib/tokenRenew";
import { SESSION_ENDED_EVENT } from "../lib/session";

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const formClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

export const adminCaller = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

adminCaller.interceptors.request.use(
  async (config) => {
    await renewTokenIfNeeded();
    const token = sessionStorage.getItem("user_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (!token) {
      const currentLocation = window.location.pathname;
      // const toastId = toast.loading(
      //   "Your session has expired. Please login again.",
      // );
      // setTimeout(() => {
      //   toast.dismiss(toastId);
      // }, 4000); // toast.error("Your session has expired. Please login again.");
      // window.location.href = `/login?redirect=${currentLocation}`;
    }

    return config;
  },

  (err) => {
    return Promise.reject(err);
  },
);
let expiredNoticeShown = false;

adminCaller.interceptors.response.use(
  (response) => response,
  async (error) => {
    const currentLocation = window.location.pathname;
    const originalRequest = error.config;

    // Handle network/CORS case safely
    if (!error.response) {
      console.error("Network/CORS error:", error);
      return Promise.reject(error);
    }

    const status = error.response.status;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // const refreshToken = sessionStorage.getItem("refresh_token");

      // if (!refreshToken) {
      //   sessionStorage.clear();
      //   window.location.href = `/login?redirect=${currentLocation}`;
      //   return Promise.reject(error);
      // }

      // token was sent but the api rejected it (expired). remember me can still get a new one
      if (originalRequest.headers?.Authorization) {
        if (await restoreLogin()) {
          originalRequest.headers.Authorization = `Bearer ${sessionStorage.getItem("user_token")}`;
          return adminCaller(originalRequest);
        }
        sessionStorage.removeItem("user_token");
        sessionStorage.removeItem("hangaut_user");
        window.dispatchEvent(new Event(SESSION_ENDED_EVENT));
        if (!expiredNoticeShown) {
          expiredNoticeShown = true;
          toast.error("Your login expired, please log in again");
        }
        // window.location.href = `/login?redirect=${currentLocation}`;
      }

      return Promise.reject(error);
    }

    if (status === 500) {
      toast.error("Something went wrong");
    }

    return Promise.reject(error);
  },
);

formClient.interceptors.request.use(
  async (config) => {
    await renewTokenIfNeeded();
    const token = sessionStorage.getItem("user_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (!token) {
      const currentLocation = window.location.pathname;
      // const toastId = toast.loading(
      //   "Your session has expired. Please login again.",
      // );
      // toast.dismiss(toastId);

      // window.location.href = `/login?redirect=${currentLocation}`;
    }

    return config;
  },

  (err) => {
    return Promise.reject(err);
  },
);
