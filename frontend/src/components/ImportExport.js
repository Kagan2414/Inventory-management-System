import React, { useRef } from 'react';
import api from '../api';

export default function ImportExport({ onImported }) {
  const fileRef = useRef();

  const trigger = () => fileRef.current.click();

  const onFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('csvFile', file);

    try {
      const res = await api.post('/products/import', fd);
      alert(`Imported: ${res.data.added} added, ${res.data.skipped} skipped`);
      onImported();
    } catch {
      alert('Import failed');
    }
  };

  const exportCSV = async () => {
    try {
      const res = await api.get('/products/export/csv', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'products.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Export failed');
    }
  };

  return (
    <>
      <input type="file" ref={fileRef} className="hidden" onChange={onFile} accept=".csv" />
      <button className="btn btn-warning" onClick={trigger}>Import</button>
      <button className="btn btn-light" onClick={exportCSV} style={{ marginLeft: 10 }}>Export</button>
    </>
  );
}