import React, { useState } from 'react';
import api from '../api';

export default function ProductRow({ product, onEdit, onSelect, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: product.name,
    category: product.category || '',
    brand: product.brand || '',
    stock: product.stock
  });

  const save = async () => {
    try {
      await api.put(`/products/${product.id}`, form);
      setIsEditing(false);
      onEdit();
    } catch (err) {
      alert('Error updating product: ' + (err.response?.data?.error || err.message));
    }
  };

  const remove = async () => {
    if (window.confirm('Delete this product?')) {
      try {
        await api.delete(`/products/${product.id}`);
        onDelete();
      } catch (err) {
        alert('Error deleting product: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  return (
    <tr>
      <td data-label="Name">
        {isEditing ? (
          <input 
            className="input" 
            value={form.name} 
            onChange={(e) => setForm({ ...form, name: e.target.value })} 
          />
        ) : (
          <button 
            onClick={() => onSelect(product)} 
            className="btn btn-light"
            style={{ padding: '6px 12px' }}
          >
            {product.name}
          </button>
        )}
      </td>

      <td data-label="Category">
        {isEditing ? (
          <input 
            className="input" 
            value={form.category} 
            onChange={(e) => setForm({ ...form, category: e.target.value })} 
          />
        ) : (
          product.category || '-'
        )}
      </td>

      <td data-label="Brand">
        {isEditing ? (
          <input 
            className="input" 
            value={form.brand} 
            onChange={(e) => setForm({ ...form, brand: e.target.value })} 
          />
        ) : (
          product.brand || '-'
        )}
      </td>

      <td data-label="Stock">
        {isEditing ? (
          <input 
            type="number" 
            className="input" 
            value={form.stock} 
            onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} 
          />
        ) : (
          product.stock
        )}
      </td>

      <td data-label="Status" className={product.stock === 0 ? 'status-out' : 'status-in'}>
        {product.stock === 0 ? 'Out of Stock' : 'In Stock'}
      </td>

      <td data-label="Actions">
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