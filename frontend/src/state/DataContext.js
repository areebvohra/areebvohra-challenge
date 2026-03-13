import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const DataContext = createContext();

/**
 * DataProvider component that manages global state for items, pagination, search, and loading.
 * Provides context value with state and helper functions for managing items list.
 *
 * State:
 *   - items: Array of item objects currently displayed
 *   - currentPage: Current page number (1-based)
 *   - pageSize: Number of items per page (fixed at 5)
 *   - searchQuery: Current search filter query
 *   - totalCount: Total number of items matching search filter
 *   - totalPages: Total number of pages for current search
 *   - hasMore: Whether more items exist beyond current page
 *   - isLoading: Whether data is currently being fetched
 *   - error: Error message if fetch fails
 *
 * Helpers:
 *   - fetchItems(page, search, signal): Fetches items from API
 *   - setPage(page): Navigate to specific page (maintains search)
 *   - setSearchQuery(query): Search items (resets to page 1)
 *   - goToNextPage(): Navigate to next page
 *   - goToPreviousPage(): Navigate to previous page
 */
export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetches items from the backend API.
   * Handles pagination and search filtering on the server side.
   *
   * @param {number} page - Page number to fetch (defaults to 1)
   * @param {string} search - Search query string (defaults to '')
   * @param {AbortSignal} signal - Signal to cancel fetch if component unmounts
   */
  const fetchItems = useCallback(async (page = 1, search = '', signal) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      if (search) {
        params.append('q', search);
      }
      const res = await fetch(`http://localhost:3001/api/items?${params}`, { signal });
      const json = await res.json();
      setItems(json.data);
      setCurrentPage(json.pagination.page);
      setTotalCount(json.pagination.totalCount);
      setTotalPages(json.pagination.totalPages);
      setHasMore(json.pagination.hasMore);
    } catch (err) {
      // Ignore AbortError (expected when component unmounts)
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Navigate to a specific page while maintaining current search query.
   * @param {number} page - Target page number
   */
  const setPage = useCallback((page) => {
    fetchItems(page, searchQuery);
  }, [fetchItems, searchQuery]);

  /**
   * Execute a new search query and reset to page 1.
   * @param {string} query - Search query string
   */
  const setSearchQueryAndReset = useCallback((query) => {
    setSearchQuery(query);
    fetchItems(1, query);
  }, [fetchItems]);

  /**
   * Navigate to next page if available.
   */
  const goToNextPage = useCallback(() => {
    if (hasMore) {
      setPage(currentPage + 1);
    }
  }, [hasMore, currentPage, setPage]);

  /**
   * Navigate to previous page if not on first page.
   */
  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setPage(currentPage - 1);
    }
  }, [currentPage, setPage]);

  /**
   * Memoize context value to prevent unnecessary re-renders of consuming components.
   * Only updates when dependencies change.
   */
  const value = useMemo(() => ({
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
    setSearchQuery: setSearchQueryAndReset,
    goToNextPage,
    goToPreviousPage
  }), [
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
    setSearchQueryAndReset,
    goToNextPage,
    goToPreviousPage
  ]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

/**
 * Hook to access the DataContext.
 * Must be used within a DataProvider component.
 *
 * @returns {Object} Context value containing state and helper functions
 * @throws {Error} If used outside of DataProvider
 */
export const useData = () => useContext(DataContext);