import React, { useState } from 'react';
import api from '../api';

export default function ProductForm({ onSaved }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', brand: '', stock: 0 });

  const save = async () => {
    try {
      await api.post('/products', form);
      setForm({ name: '', category: '', brand: '', stock: 0 });
      setOpen(false);
      onSaved();
    } catch (err) {
      alert('Error creating product');
    }
  };

  return (
    <div>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>Add Product</button>

      {open && (
        <div className="card fade-in" style={{ marginTop: 15 }}>
          <h3>Add New Product</h3>
          <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input className="input" placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          <input type="number" className="input" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value || 0) })} />

          <div style={{ marginTop: 10 }}>
            <button className="btn btn-primary" onClick={save}>Save</button>
            <button className="btn btn-light" style={{ marginLeft: 10 }} onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
