"use client";

import axios from "axios";

// Centralized axios instance for the app. Always sends credentials (cookies) to the backend.
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  withCredentials: true,
});
