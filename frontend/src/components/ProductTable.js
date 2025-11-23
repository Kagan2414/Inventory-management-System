import React from 'react';
import ProductRow from './ProductRow';

export default function ProductTable({ products, loading, onEdit, onSelect, onDelete }) {
  if (loading) return <div>Loading...</div>;
  if (!products.length) return <div>No products found.</div>;

  return (
    <div>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th><th>Category</th><th>Brand</th>
            <th>Stock</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => (
            <ProductRow
              key={p.id}
              product={p}
              onEdit={onEdit}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
