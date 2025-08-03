import { ofetch } from "ofetch";

export const apiClient = ofetch.create({
  // baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  headers: {
    "Content-Type": "application/json",
  },
  onRequest({ request, options }) {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        const token = sessionStorage.getItem("ubicateToken");
        if (token) {
          options.headers.set("ubicate-token", token);
        }
      }
    } catch (error) {
      // Storage access might be blocked in incognito mode or PWA
      console.warn("Unable to access sessionStorage for token:", error);
    }
  },
});