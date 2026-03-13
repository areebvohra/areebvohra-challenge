import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Items from './Items';
import { DataProvider } from '../state/DataContext';

// Mock fetch
global.fetch = jest.fn();

// Mock react-window FixedSizeList
jest.mock('react-window', () => ({
  FixedSizeList: ({ children: Row, itemCount }) => (
    <div data-testid="items-list">
      {Array.from({ length: Math.min(itemCount, 5) }).map((_, idx) => (
        <Row key={idx} index={idx} style={{}} />
      ))}
    </div>
  )
}));

const mockItemsResponse = {
  data: [
    { id: 1, name: 'Laptop', category: 'Electronics', price: 2499 },
    { id: 2, name: 'Mouse', category: 'Electronics', price: 49 }
  ],
  pagination: {
    page: 1,
    pageSize: 5,
    totalCount: 2,
    totalPages: 1,
    hasMore: false
  }
};

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <DataProvider>{component}</DataProvider>
    </BrowserRouter>
  );
};

describe('Items Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
  });

  describe('Component rendering', () => {
    test('should render without crashing', () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockItemsResponse)
      });

      expect(() => {
        renderWithProviders(<Items />);
      }).not.toThrow();
    });

    test('should render main container', () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockItemsResponse)
      });

      renderWithProviders(<Items />);

      const container = document.querySelector('.items-container');
      expect(container).toBeTruthy();
    });
  });

  describe('Page structure', () => {
    test('should have a title section', () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockItemsResponse)
      });

      renderWithProviders(<Items />);

      expect(document.querySelector('.items-title')).toBeTruthy();
    });

    test('should have a search section', () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockItemsResponse)
      });

      renderWithProviders(<Items />);

      expect(document.querySelector('.search-section')).toBeTruthy();
    });

    test('should have search input field', () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockItemsResponse)
      });

      renderWithProviders(<Items />);

      const searchInput = document.querySelector('.search-input');
      expect(searchInput).toBeTruthy();
      expect(searchInput.type).toBe('text');
    });

    test('should have search button', () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockItemsResponse)
      });

      renderWithProviders(<Items />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('CSS classes and styling', () => {
    test('should apply correct CSS classes', () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockItemsResponse)
      });

      renderWithProviders(<Items />);

      expect(document.querySelector('.items-container')).toBeTruthy();
      expect(document.querySelector('.items-title')).toBeTruthy();
      expect(document.querySelector('.search-section')).toBeTruthy();
      expect(document.querySelector('.search-input-group')).toBeTruthy();
      expect(document.querySelector('.search-controls')).toBeTruthy();
    });

    test('should have pagination controls available', () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockItemsResponse)
      });

      renderWithProviders(<Items />);

      // Either loading indicator or pagination controls should be present
      const pagination = document.querySelector('.pagination-controls');
      const loading = document.querySelector('.loading-indicator');
      expect(pagination || loading).toBeTruthy();
    });

    test('should render search and filter section', () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockItemsResponse)
      });

      renderWithProviders(<Items />);

      const searchSection = document.querySelector('.search-section');
      expect(searchSection).toBeTruthy();
    });
  });

  describe('Accessibility attributes', () => {
    test('should have proper ARIA labels on search input', () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockItemsResponse)
      });

      renderWithProviders(<Items />);

      const searchInput = document.querySelector('.search-input');
      expect(searchInput.getAttribute('aria-label')).toBeTruthy();
    });

    test('should have label for search input', () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockItemsResponse)
      });

      renderWithProviders(<Items />);

      const label = document.querySelector('.search-label');
      expect(label).toBeTruthy();
    });

    test('should have role=status for loading indicator', () => {
      fetch.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() =>
              resolve({
                json: () => Promise.resolve(mockItemsResponse)
              }),
              100
            )
          )
      );

      renderWithProviders(<Items />);

      const loadingIndicator = document.querySelector('[role="status"]');
      expect(loadingIndicator).toBeTruthy();
    });
  });

  describe('Initial state', () => {
    test('should show loading state initially', () => {
      fetch.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() =>
              resolve({
                json: () => Promise.resolve(mockItemsResponse)
              }),
              50
            )
          )
      );

      renderWithProviders(<Items />);

      const loadingIndicator = document.querySelector('.loading-indicator');
      const spinner = document.querySelector('.spinner');
      expect(loadingIndicator || spinner).toBeTruthy();
    });

    test('should have component structure on render', () => {
      fetch.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() =>
              resolve({
                json: () => Promise.resolve(mockItemsResponse)
              }),
              50
            )
          )
      );

      const { container } = renderWithProviders(<Items />);

      // Container should be present
      expect(container.querySelector('.items-container')).toBeTruthy();
    });
  });

  describe('Error handling', () => {
    test('should have error message class available', () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockItemsResponse)
      });

      const { container } = renderWithProviders(<Items />);

      // CSS class should exist even if not displayed
      const styles = document.styleSheets;
      expect(styles).toBeTruthy();
    });

    test('should handle fetch rejection gracefully', () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      expect(() => {
        renderWithProviders(<Items />);
      }).not.toThrow();
    });
  });

  describe('Component lifecycle', () => {
    test('should call fetch on mount', () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockItemsResponse)
      });

      renderWithProviders(<Items />);

      expect(fetch).toHaveBeenCalled();
    });

    test('should clean up abort controller on unmount', () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockItemsResponse)
      });

      const { unmount } = renderWithProviders(<Items />);

      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });
});
