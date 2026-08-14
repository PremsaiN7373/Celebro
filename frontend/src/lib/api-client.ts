import axios from "axios";

/**
 * In dev, VITE_API_URL is unset so this stays "/api/v1" and Vite's proxy
 * (see vite.config.ts) forwards it to localhost:8000. In production, set
 * VITE_API_URL to your real backend's URL, e.g. "https://api.yourapp.com",
 * and it's used directly instead — see DEPLOYMENT.md.
 */
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : "/api/v1";

/**
 * Single axios instance for the whole app. Every feature's api.ts
 * should import this instead of creating its own axios instance.
 */
export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach the access token to every request.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, try a silent refresh once before giving up.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem("access_token", data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return apiClient(original);
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);
