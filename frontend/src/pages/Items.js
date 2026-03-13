import React, { useEffect, useState } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';
import { FixedSizeList } from 'react-window';
import './Items.css';

function Items() {
  const {
    items,
    currentPage,
    pageSize,
    searchQuery,
    totalCount,
    totalPages,
    hasMore,
    isLoading,
    error,
    fetchItems,
    setPage,
    setSearchQuery,
    goToNextPage,
    goToPreviousPage
  } = useData();

  const [searchInput, setSearchInput] = useState('');
  const [searchInputError, setSearchInputError] = useState('');

  useEffect(() => {
    const abortController = new AbortController();

    fetchItems(1, '', abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [fetchItems]);

  const handleSearchSubmit = () => {
    // Validate search query is not empty before submitting
    if (searchInput.trim().length === 0) {
      setSearchInputError('Search query cannot be empty');
      return;
    }
    setSearchInputError('');
    setSearchQuery(searchInput);
  };

  const handleClearSearch = () => {
    // Reset search input and query to show all items
    setSearchInput('');
    setSearchInputError('');
    setSearchQuery('');
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  const SkeletonLoader = () => (
    <div className="items-skeleton">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="skeleton-item">
          <div className="skeleton-text" />
        </div>
      ))}
    </div>
  );

  const Row = ({ index, style }) => (
    <div style={style} className="item-row">
      <Link to={`/items/${items[index].id}`} className="item-link">
        {items[index].name}
      </Link>
    </div>
  );

  if (error) {
    return (
      <div className="items-container">
        <div className="error-message" role="alert">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="items-container">
      <h1 className="items-title">Items</h1>

      <div className="search-section">
        <div className="search-input-group">
          <label htmlFor="search-input" className="search-label">
            Search Items
          </label>
          <div className="search-controls">
            <input
              id="search-input"
              type="text"
              placeholder="Enter search term..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (searchInputError) setSearchInputError('');
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
              className="search-input"
              aria-label="Search items by name"
              aria-describedby={searchInputError ? 'search-error' : undefined}
            />
            <button
              onClick={handleSearchSubmit}
              className="btn btn-primary"
              aria-label="Search"
            >
              Search
            </button>
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="btn btn-secondary"
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
          </div>
          {searchInputError && (
            <div id="search-error" className="input-error">
              {searchInputError}
            </div>
          )}
          {searchQuery && (
            <div className="search-active">
              Results for: <strong>"{searchQuery}"</strong>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <>
          <div className="loading-indicator" role="status" aria-live="polite">
            <div className="spinner"></div>
            <span>Loading items...</span>
          </div>
          <SkeletonLoader />
        </>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p>No items found{searchQuery ? ` for "${searchQuery}"` : ''}.</p>
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="btn btn-primary"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="pagination-info">
            <span>
              Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong>{Math.min(currentPage * pageSize, totalCount)}</strong> of{' '}
              <strong>{totalCount}</strong> items
            </span>
            <span className="page-indicator">
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>
          </div>

          <div className="pagination-controls">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="btn btn-pagination"
              aria-label="Go to previous page"
              aria-disabled={currentPage === 1}
            >
              ← Previous
            </button>

            <div className="page-buttons" role="group" aria-label="Page navigation">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`btn btn-page ${pageNum === currentPage ? 'active' : ''}`}
                  aria-label={`Go to page ${pageNum}`}
                  aria-current={pageNum === currentPage ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={goToNextPage}
              disabled={!hasMore}
              className="btn btn-pagination"
              aria-label="Go to next page"
              aria-disabled={!hasMore}
            >
              Next →
            </button>
          </div>

          <div className="list-container">
            <FixedSizeList
              height={600}
              itemCount={items.length}
              itemSize={48}
              width="100%"
              overscanCount={5}
              role="list"
              aria-label="Items list"
            >
              {Row}
            </FixedSizeList>
          </div>
        </>
      )}
    </div>
  );
}

export default Items;