import React from 'react';
import ProductRow from './ProductRow';

export default function ProductTable({ 
  products, 
  loading, 
  onEdit, 
  onSelect, 
  onDelete,
  onSort,
  sortField,
  sortOrder 
}) {
  if (loading) return <div className="loading">Loading...</div>;
  if (!products.length) return <div className="card">No products found.</div>;

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th onClick={() => onSort('name')} style={{ cursor: 'pointer' }}>
              Name<SortIcon field="name" />
            </th>
            <th onClick={() => onSort('category')} style={{ cursor: 'pointer' }}>
              Category<SortIcon field="category" />
            </th>
            <th onClick={() => onSort('brand')} style={{ cursor: 'pointer' }}>
              Brand<SortIcon field="brand" />
            </th>
            <th onClick={() => onSort('stock')} style={{ cursor: 'pointer' }}>
              Stock<SortIcon field="stock" />
            </th>
            <th>Status</th>
            <th>Actions</th>
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