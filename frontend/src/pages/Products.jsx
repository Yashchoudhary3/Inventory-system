import { useCallback, useEffect, useState } from "react";
import { getErrorMessage, productsApi } from "../api/client";
import Modal from "../components/Modal";
import { useToast } from "../context/ToastContext";

const emptyForm = { name: "", sku: "", price: "", quantity_in_stock: "" };

export default function Products() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const loadProducts = useCallback(async () => {
    try {
      const { data } = await productsApi.list();
      setProducts(data);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.sku.trim()) e.sku = "SKU is required";
    if (!form.price || Number(form.price) <= 0) e.price = "Price must be greater than 0";
    if (form.quantity_in_stock === "" || Number(form.quantity_in_stock) < 0) {
      e.quantity_in_stock = "Stock cannot be negative";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      quantity_in_stock: String(product.quantity_in_stock),
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: Number(form.price),
      quantity_in_stock: Number(form.quantity_in_stock),
    };

    try {
      if (editing) {
        await productsApi.update(editing.id, payload);
        showToast("Product updated successfully");
      } else {
        await productsApi.create(payload);
        showToast("Product created successfully");
      }
      setModalOpen(false);
      loadProducts();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await productsApi.delete(id);
      showToast("Product deleted");
      loadProducts();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  return (
    <div className="page">
      <div className="page-header row">
        <div className="page-intro">
          <p className="subtitle">Manage your product catalog and stock levels</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + Add Product
        </button>
      </div>

      {loading ? (
        <p className="loading">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="empty-state">No products yet. Add your first product.</p>
      ) : (
        <div className="table-panel">
          <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td><code>{p.sku}</code></td>
                  <td>${Number(p.price).toFixed(2)}</td>
                  <td>
                    <span className={p.quantity_in_stock <= 10 ? "badge badge-warning" : "badge badge-ok"}>
                      {p.quantity_in_stock}
                    </span>
                  </td>
                  <td className="actions">
                    <button type="button" className="btn btn-sm" onClick={() => openEdit(p)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>
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
        <Modal title={editing ? "Edit Product" : "Add Product"} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="form">
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={errors.name ? "input-error" : ""}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </label>
            <label>
              SKU / Code
              <input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className={errors.sku ? "input-error" : ""}
              />
              {errors.sku && <span className="field-error">{errors.sku}</span>}
            </label>
            <label>
              Price ($)
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className={errors.price ? "input-error" : ""}
              />
              {errors.price && <span className="field-error">{errors.price}</span>}
            </label>
            <label>
              Quantity in Stock
              <input
                type="number"
                min="0"
                value={form.quantity_in_stock}
                onChange={(e) => setForm({ ...form, quantity_in_stock: e.target.value })}
                className={errors.quantity_in_stock ? "input-error" : ""}
              />
              {errors.quantity_in_stock && (
                <span className="field-error">{errors.quantity_in_stock}</span>
              )}
            </label>
            <div className="form-actions">
              <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editing ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
