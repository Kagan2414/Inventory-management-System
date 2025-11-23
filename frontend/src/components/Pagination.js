import React from 'react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="section" style={{ justifyContent: 'center', marginTop: 20 }}>
      <button 
        className="btn btn-light" 
        disabled={currentPage === 1}
        onClick={() => onPageChange(1)}
      >
        «
      </button>
      <button 
        className="btn btn-light" 
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ‹ Previous
      </button>
      
      {pages.map(pageNum => (
        <button
          key={pageNum}
          className={`btn ${pageNum === currentPage ? 'btn-primary' : 'btn-light'}`}
          onClick={() => onPageChange(pageNum)}
        >
          {pageNum}
        </button>
      ))}
      
      <button 
        className="btn btn-light" 
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next ›
      </button>
      <button 
        className="btn btn-light" 
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(totalPages)}
      >
        »
      </button>
      
      <span style={{ marginLeft: 15, color: 'var(--text-secondary)' }}>
        Page {currentPage} of {totalPages}
      </span>
    </div>
  );
}