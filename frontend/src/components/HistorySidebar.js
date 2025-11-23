import React, { useEffect, useState } from 'react';
import api from '../api';

export default function HistorySidebar({ product }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!product) return;
    const fetch = async () => {
      const res = await api.get(`/products/${product.id}/history`);
      setHistory(res.data.history || []);
    };
    fetch();
  }, [product]);

  if (!product) return <div className="card">Select a product to view history</div>;

  return (
    <div className="sidebar card fade-in">
      <h3>History – {product.name}</h3>
      {history.length === 0 && <div>No changes yet.</div>}

      {history.map((h) => (
        <div key={h.id} className="card" style={{ marginTop: 10 }}>
          <div><b>{new Date(h.change_date).toLocaleString()}</b></div>
          <div>Old: {h.old_quantity} → New: {h.new_quantity}</div>
        </div>
      ))}
    </div>
  );
}
