import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ItemDetail.css';

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const abortController = new AbortController();

    setIsLoading(true);
    setError(null);

    // Fetch individual item details from backend
    fetch(`http://localhost:3001/api/items/${id}`, { signal: abortController.signal })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Item not found (${res.status})`);
        }
        return res.json();
      })
      .then(data => {
        setItem(data);
        setIsLoading(false);
      })
      .catch(err => {
        // Ignore AbortError (expected when component unmounts or id changes)
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load item');
          setIsLoading(false);
        }
      });

    // Cleanup: abort in-flight request when component unmounts or id changes
    return () => abortController.abort();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const SkeletonDetail = () => (
    <div className="item-detail-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-title" />
      </div>
      <div className="skeleton-content">
        <div className="skeleton-field">
          <div className="skeleton-label" />
          <div className="skeleton-value" />
        </div>
        <div className="skeleton-field">
          <div className="skeleton-label" />
          <div className="skeleton-value" />
        </div>
        <div className="skeleton-field">
          <div className="skeleton-label" />
          <div className="skeleton-value" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="item-detail-container">
      <button
        onClick={handleBack}
        className="btn btn-back"
        aria-label="Go back"
      >
        ← Back
      </button>

      {error && (
        <div className="error-message" role="alert">
          <strong>Error:</strong> {error}
          <button
            onClick={() => navigate('/items')}
            className="btn btn-primary"
            style={{ marginLeft: '16px' }}
          >
            Back to Items
          </button>
        </div>
      )}

      {isLoading ? (
        <>
          <div className="loading-indicator" role="status" aria-live="polite">
            <div className="spinner"></div>
            <span>Loading item details...</span>
          </div>
          <SkeletonDetail />
        </>
      ) : item ? (
        <article className="item-detail">
          <header className="item-header">
            <h1 className="item-title">{item.name}</h1>
          </header>

          <section className="item-details">
            <div className="detail-field">
              <label className="detail-label">Category</label>
              <p className="detail-value">{item.category}</p>
            </div>

            <div className="detail-field">
              <label className="detail-label">Price</label>
              <p className="detail-price">
                ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
              </p>
            </div>

            {item.id && (
              <div className="detail-field">
                <label className="detail-label">Item ID</label>
                <p className="detail-value detail-id">{item.id}</p>
              </div>
            )}
          </section>

          <footer className="item-actions">
            <button
              onClick={handleBack}
              className="btn btn-secondary"
              aria-label="Go back to items list"
            >
              ← Back to Items
            </button>
          </footer>
        </article>
      ) : null}
    </div>
  );
}

export default ItemDetail;