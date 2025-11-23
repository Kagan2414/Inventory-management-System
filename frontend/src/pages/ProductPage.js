import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import ImportExport from '../components/ImportExport';
import ProductForm from '../components/ProductForm';
import ProductTable from '../components/ProductTable';
import HistorySidebar from '../components/HistorySidebar';
import Pagination from '../components/Pagination';

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, sort: sortField, order: sortOrder };
      if (categoryFilter) params.category = categoryFilter;
      if (query) params.search = query;

      const res = await api.get('/products', { params });
      setProducts(res.data.products || []);
      setTotalPages(Math.ceil(res.data.total / limit));
    } catch (err) {
      console.error('Error fetching products:', err);
      alert('Error fetching products');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, query, page, limit, sortField, sortOrder]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/meta/categories');
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Fetch products whenever dependencies change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Fetch categories only once on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [query, categoryFilter]);

  return (
    <div className="layout">
      <div>
        <div className="section">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input"
            placeholder="Search products..."
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="input"
            style={{ maxWidth: 150 }}
          >
            <option value="5">5 per page</option>
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
          </select>

          <span>
            <ImportExport onImported={fetchProducts} />
          </span>
          <span>
            <ProductForm onSaved={fetchProducts} />
          </span>
        </div>

        <ProductTable
          products={products}
          loading={loading}
          onEdit={fetchProducts}
          onSelect={setSelectedProduct}
          onDelete={fetchProducts}
          onSort={handleSort}
          sortField={sortField}
          sortOrder={sortOrder}
        />

        {!loading && products.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <div>
        <HistorySidebar product={selectedProduct} />
      </div>
    </div>
  );
}