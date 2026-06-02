import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export const getErrorMessage = (error) => {
  const detail = error.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
  }
  return error.message || "Something went wrong";
};

export const productsApi = {
  list: () => api.get("/products"),
  get: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const customersApi = {
  list: () => api.get("/customers"),
  get: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post("/customers", data),
  delete: (id) => api.delete(`/customers/${id}`),
};

export const ordersApi = {
  list: () => api.get("/orders"),
  get: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post("/orders", data),
  delete: (id) => api.delete(`/orders/${id}`),
};

export const dashboardApi = {
  stats: () => api.get("/dashboard/stats"),
};

export default api;
