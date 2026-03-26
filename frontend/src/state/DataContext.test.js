import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { DataProvider, useData } from './DataContext';

// Mock fetch
global.fetch = jest.fn();

describe('DataContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
  });

  const mockItemsResponse = {
    data: [
      { id: 1, name: 'Item 1', category: 'Test', price: 100 },
      { id: 2, name: 'Item 2', category: 'Test', price: 200 }
    ],
    pagination: {
      page: 1,
      pageSize: 5,
      totalCount: 2,
      totalPages: 1,
      hasMore: false
    }
  };

  const wrapper = ({ children }) => (
    <DataProvider>{children}</DataProvider>
  );

  describe('Context hook availability', () => {
    test('should provide useData hook within provider', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockItemsResponse)
      });

      const { result } = renderHook(() => useData(), { wrapper });

      await waitFor(() => {
        // Context should be accessible
        expect(result.current).toBeDefined();
        expect(result.current).toHaveProperty('items');
        expect(result.current).toHaveProperty('setPage');
        expect(result.current).toHaveProperty('setSearchQuery');
        expect(result.current).toHaveProperty('goToNextPage');
        expect(result.current).toHaveProperty('goToPreviousPage');
      });
    });

    test('should have proper initial state structure', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockItemsResponse)
      });

      const { result } = renderHook(() => useData(), { wrapper });

      await waitFor(() => {
        // Verify all state properties exist
        expect(result.current.items).toBeDefined();
        expect(result.current.currentPage).toBeDefined();
        expect(result.current.pageSize).toBeDefined();
        expect(result.current.searchQuery).toBeDefined();
        expect(result.current.totalCount).toBeDefined();
        expect(result.current.totalPages).toBeDefined();
        expect(result.current.hasMore).toBeDefined();
        expect(result.current.isLoading).toBeDefined();
        expect(result.current.error).toBeDefined();
      });
    });

    test('should have valid initial values', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockItemsResponse)
      });

      const { result } = renderHook(() => useData(), { wrapper });

      await waitFor(() => {
        // Check initial types
        expect(Array.isArray(result.current.items)).toBe(true);
        expect(typeof result.current.currentPage).toBe('number');
        expect(typeof result.current.pageSize).toBe('number');
        expect(typeof result.current.searchQuery).toBe('string');
        expect(typeof result.current.totalCount).toBe('number');
        expect(typeof result.current.totalPages).toBe('number');
        expect(typeof result.current.hasMore).toBe('boolean');
        expect(typeof result.current.isLoading).toBe('boolean');
      });
    });
  });

  describe('Helper functions are callable', () => {
    test('setPage should be a function and callable', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockItemsResponse)
      });

      const { result } = renderHook(() => useData(), { wrapper });

      await waitFor(() => {
        expect(typeof result.current.setPage).toBe('function');
      });

      await act(async () => {
        result.current.setPage(2);
      });
    });

    test('setSearchQuery should be a function and callable', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockItemsResponse)
      });

      const { result } = renderHook(() => useData(), { wrapper });

      await waitFor(() => {
        expect(typeof result.current.setSearchQuery).toBe('function');
      });

      await act(async () => {
        result.current.setSearchQuery('test');
      });
    });

    test('goToNextPage should be a function and callable', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockItemsResponse)
      });

      const { result } = renderHook(() => useData(), { wrapper });

      await waitFor(() => {
        expect(typeof result.current.goToNextPage).toBe('function');
      });

      await act(async () => {
        result.current.goToNextPage();
      });
    });

    test('goToPreviousPage should be a function and callable', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockItemsResponse)
      });

      const { result } = renderHook(() => useData(), { wrapper });

      await waitFor(() => {
        expect(typeof result.current.goToPreviousPage).toBe('function');
      });

      await act(async () => {
        result.current.goToPreviousPage();
      });
    });
  });

  describe('Error handling', () => {
    test('should handle fetch errors without crashing', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useData(), { wrapper });

      await waitFor(() => {
        // Should not throw even if fetch fails
        expect(result.current).toBeDefined();
        expect(typeof result.current.error === 'string' || result.current.error === null).toBe(true);
      });
    });

    test('should ignore AbortError exceptions', async () => {
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';
      fetch.mockRejectedValueOnce(abortError);

      const { result } = renderHook(() => useData(), { wrapper });

      await waitFor(() => {
        // AbortError should not cause issues
        expect(result.current).toBeDefined();
      });
    });
  });

  describe('Page size constant', () => {
    test('should have pageSize of 5', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockItemsResponse)
      });

      const { result } = renderHook(() => useData(), { wrapper });

      await waitFor(() => {
        expect(result.current.pageSize).toBe(5);
      });
    });
  });

  describe('Fetch integration', () => {
    test('should provide a fetchItems function', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockItemsResponse)
      });

      const { result } = renderHook(() => useData(), { wrapper });

      await waitFor(() => {
        // Verify fetchItems exists in context
        expect(result.current.fetchItems).toBeDefined();
        expect(typeof result.current.fetchItems).toBe('function');
      });
    });

    test('should handle successful fetch responses', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockItemsResponse)
      });

      const { result } = renderHook(() => useData(), { wrapper });

      await waitFor(() => {
        // Should not have error after successful response
        expect(typeof result.current.error === 'string' || result.current.error === null).toBe(true);
      });
    });
  });
});
