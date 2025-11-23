import React, { useState } from 'react';
import api from '../api';

export default function ProductRow({ product, onEdit, onSelect, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: product.name,
    category: product.category,
    brand: product.brand,
    stock: product.stock
  });

  const save = async () => {
    await api.put(`/products/${product.id}`, form);
    setIsEditing(false);
    onEdit();
  };

  const remove = async () => {
    if (window.confirm('Delete this product?')) {
      await api.delete(`/products/${product.id}`);
      onDelete();
    }
  };

  return (
    <tr>
      <td>
        {isEditing ? (
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        ) : (
          <button onClick={() => onSelect(product)} className="btn-light">{product.name}</button>
        )}
      </td>

      <td>
        {isEditing ?
          <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          : product.category}
      </td>

      <td>
        {isEditing ?
          <input className="input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          : product.brand}
      </td>

      <td>
        {isEditing ?
          <input type="number" className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) })} />
          : product.stock}
      </td>

      <td className={product.stock === 0 ? 'status-out' : 'status-in'}>
        {product.stock === 0 ? 'Out of Stock' : 'In Stock'}
      </td>

      <td>
        {isEditing ? (
          <>
            <button className="btn btn-primary" onClick={save}>Save</button>
            <button className="btn btn-light" onClick={() => setIsEditing(false)}>Cancel</button>
          </>
        ) : (
          <>
            <button className="btn btn-warning" onClick={() => setIsEditing(true)}>Edit</button>
            <button className="btn btn-danger" onClick={remove}>Delete</button>
          </>
        )}
      </td>
    </tr>
  );
}
