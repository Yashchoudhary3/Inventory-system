import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Customers from "./pages/Customers";
import Dashboard from "./pages/Dashboard";
import OrderDetail from "./pages/OrderDetail";
import Orders from "./pages/Orders";
import Products from "./pages/Products";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="customers" element={<Customers />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
