import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardApi, getErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";

export default function Dashboard() {
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await dashboardApi.stats();
        setStats(data);
      } catch (err) {
        showToast(getErrorMessage(err), "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [showToast]);

  if (loading) return <p className="loading">Loading dashboard...</p>;
  if (!stats) return <p className="error-text">Unable to load dashboard.</p>;

  const cards = [
    { label: "Total Products", value: stats.total_products, link: "/products" },
    { label: "Total Customers", value: stats.total_customers, link: "/customers" },
    { label: "Total Orders", value: stats.total_orders, link: "/orders" },
    { label: "Low Stock Items", value: stats.low_stock_products.length, link: "/products" },
  ];

  return (
    <div className="page">
      <div className="page-intro">
        <p className="subtitle">Overview of your inventory and orders</p>
      </div>

      <div className="stats-grid">
        {cards.map((card) => (
          <Link key={card.label} to={card.link} className="stat-card">
            <span className="stat-label">{card.label}</span>
            <span className="stat-value">{card.value}</span>
          </Link>
        ))}
      </div>

      <section className="card-section">
        <h3>Low Stock Products (≤ 10 units)</h3>
        {stats.low_stock_products.length === 0 ? (
          <p className="empty-state">All products are well stocked.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {stats.low_stock_products.map((p) => (
                  <tr key={p.id} className={p.quantity_in_stock === 0 ? "row-danger" : "row-warning"}>
                    <td>{p.name}</td>
                    <td>{p.sku}</td>
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td>{p.quantity_in_stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
