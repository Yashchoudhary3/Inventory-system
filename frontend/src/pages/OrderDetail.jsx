import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getErrorMessage, ordersApi } from "../api/client";
import { useToast } from "../context/ToastContext";

export default function OrderDetail() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await ordersApi.get(id);
        setOrder(data);
      } catch (err) {
        showToast(getErrorMessage(err), "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, showToast]);

  if (loading) return <p className="loading">Loading order...</p>;
  if (!order) {
    return (
      <div className="page">
        <p className="error-text">Order not found.</p>
        <Link to="/orders" className="btn">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <Link to="/orders" className="back-link">← Back to Orders</Link>
        <p className="subtitle order-detail-meta">
          Order <strong>#{order.id}</strong> · {order.customer_name} ·{" "}
          {new Date(order.created_at).toLocaleString()}
        </p>
      </div>

      <div className="detail-card">
        <div className="detail-row">
          <span>Customer</span>
          <strong>{order.customer_name}</strong>
        </div>
        <div className="detail-row">
          <span>Total Amount</span>
          <strong className="total-highlight">${Number(order.total_amount).toFixed(2)}</strong>
        </div>
      </div>

      <section className="card-section">
        <h3>Line Items</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.product_name || `Product #${item.product_id}`}</td>
                  <td>{item.quantity}</td>
                  <td>${Number(item.unit_price).toFixed(2)}</td>
                  <td>${(Number(item.unit_price) * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
