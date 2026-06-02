import { useCallback, useEffect, useState } from "react";
import { customersApi, getErrorMessage } from "../api/client";
import Modal from "../components/Modal";
import { useToast } from "../context/ToastContext";

const emptyForm = { full_name: "", email: "", phone: "" };

export default function Customers() {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const loadCustomers = useCallback(async () => {
    try {
      const { data } = await customersApi.list();
      setCustomers(data);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.phone.trim()) e.phone = "Phone is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await customersApi.create({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      showToast("Customer created successfully");
      setModalOpen(false);
      setForm(emptyForm);
      loadCustomers();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await customersApi.delete(id);
      showToast("Customer deleted");
      loadCustomers();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  return (
    <div className="page">
      <div className="page-header row">
        <div className="page-intro">
          <p className="subtitle">Manage customer records and contact information</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
          + Add Customer
        </button>
      </div>

      {loading ? (
        <p className="loading">Loading customers...</p>
      ) : customers.length === 0 ? (
        <p className="empty-state">No customers yet.</p>
      ) : (
        <div className="table-panel">
          <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.full_name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td className="actions">
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(c.id)}
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
        <Modal title="Add Customer" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="form">
            <label>
              Full Name
              <input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className={errors.full_name ? "input-error" : ""}
              />
              {errors.full_name && <span className="field-error">{errors.full_name}</span>}
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={errors.email ? "input-error" : ""}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </label>
            <label>
              Phone
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={errors.phone ? "input-error" : ""}
              />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </label>
            <div className="form-actions">
              <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
