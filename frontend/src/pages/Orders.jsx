import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  customersApi,
  getErrorMessage,
  ordersApi,
  productsApi,
} from "../api/client";
import Modal from "../components/Modal";
import { useToast } from "../context/ToastContext";

const emptyLine = { product_id: "", quantity: "1" };

export default function Orders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState([{ ...emptyLine }]);
  const [errors, setErrors] = useState({});

  const loadData = useCallback(async () => {
    try {
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        ordersApi.list(),
        customersApi.list(),
        productsApi.list(),
      ]);
      setOrders(ordersRes.data);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const validate = () => {
    const e = {};
    if (!customerId) e.customer = "Select a customer";
    const validLines = lines.filter((l) => l.product_id && Number(l.quantity) > 0);
    if (validLines.length === 0) e.items = "Add at least one product with quantity";
    lines.forEach((line, i) => {
      if (line.product_id && (!line.quantity || Number(line.quantity) < 1)) {
        e[`qty_${i}`] = "Quantity must be at least 1";
      }
    });
    const ids = validLines.map((l) => l.product_id);
    if (new Set(ids).size !== ids.length) e.items = "Duplicate products not allowed";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const items = lines
      .filter((l) => l.product_id && Number(l.quantity) > 0)
      .map((l) => ({
        product_id: Number(l.product_id),
        quantity: Number(l.quantity),
      }));

    try {
      await ordersApi.create({
        customer_id: Number(customerId),
        items,
      });
      showToast("Order created successfully");
      setModalOpen(false);
      setCustomerId("");
      setLines([{ ...emptyLine }]);
      loadData();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Cancel/delete this order? Stock will be restored.")) return;
    try {
      await ordersApi.delete(id);
      showToast("Order deleted");
      loadData();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  const updateLine = (index, field, value) => {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, [field]: value } : line)));
  };

  const addLine = () => setLines((prev) => [...prev, { ...emptyLine }]);
  const removeLine = (index) => {
    if (lines.length === 1) return;
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const estimatedTotal = lines.reduce((sum, line) => {
    const product = products.find((p) => String(p.id) === String(line.product_id));
    if (!product || !line.quantity) return sum;
    return sum + Number(product.price) * Number(line.quantity);
  }, 0);

  return (
    <div className="page">
      <div className="page-header row">
        <div className="page-intro">
          <p className="subtitle">Create and track customer orders</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setModalOpen(true)}
          disabled={customers.length === 0 || products.length === 0}
        >
          + Create Order
        </button>
      </div>

      {(customers.length === 0 || products.length === 0) && (
        <p className="hint">
          Add at least one customer and one product before creating orders.
        </p>
      )}

      {loading ? (
        <p className="loading">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="empty-state">No orders yet.</p>
      ) : (
        <div className="table-panel">
          <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.customer_name || `Customer #${o.customer_id}`}</td>
                  <td>${Number(o.total_amount).toFixed(2)}</td>
                  <td>{new Date(o.created_at).toLocaleString()}</td>
                  <td className="actions">
                    <Link to={`/orders/${o.id}`} className="btn btn-sm">
                      View
                    </Link>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(o.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <Modal title="Create Order" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="form">
            <label>
              Customer
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className={errors.customer ? "input-error" : ""}
              >
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </option>
                ))}
              </select>
              {errors.customer && <span className="field-error">{errors.customer}</span>}
            </label>

            <div className="order-lines">
              <h4>Order Items</h4>
              {errors.items && <span className="field-error">{errors.items}</span>}
              {lines.map((line, index) => (
                <div key={index} className="order-line">
                  <select
                    value={line.product_id}
                    onChange={(e) => updateLine(index, "product_id", e.target.value)}
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ${Number(p.price).toFixed(2)} (stock: {p.quantity_in_stock})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={line.quantity}
                    onChange={(e) => updateLine(index, "quantity", e.target.value)}
                  />
                  {lines.length > 1 && (
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => removeLine(index)}>
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-sm" onClick={addLine}>
                + Add line
              </button>
            </div>

            <p className="order-total">
              Estimated total: <strong>${estimatedTotal.toFixed(2)}</strong>
              <span className="hint"> (final amount calculated by server)</span>
            </p>

            <div className="form-actions">
              <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Place Order
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
