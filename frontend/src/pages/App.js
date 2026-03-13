import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import Items from './Items';
import ItemDetail from './ItemDetail';
import { DataProvider } from '../state/DataContext';
import './App.css';

function App() {
  return (
    <DataProvider>
      <nav className="app-nav">
        <div className="nav-container">
          <NavLink to="/" className="nav-brand">
            📦 Items Store
          </NavLink>
          <ul className="nav-links">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                Items
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Items />} />
        <Route path="/items/:id" element={<ItemDetail />} />
      </Routes>
    </DataProvider>
  );
}

export default App;