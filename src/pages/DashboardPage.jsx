import React, { useEffect, useState } from 'react';
import { authFetch } from './utils/authFetch';
import './pagestyles/DashboardPage.css'; // Custom CSS

const DashboardPage = () => {
  const [items, setItems] = useState([]);
  const [recentCartItems, setRecentCartItems] = useState([]);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await authFetch('/api/items');
        if (!data) return;
        setItems(data.reverse());
      } catch (err) {
        console.error('Failed to fetch items:', err);
      }
    };

    const fetchRecentCartItems = async () => {
      try {
        const cartData = await authFetch('/api/cart');
        if (!cartData) return;

        const recent = [...cartData].sort((a, b) => b.item_id - a.item_id).slice(0, 5);
        const itemIds = recent.map(c => c.item_id).join(',');
        const itemDetails = await authFetch(`/api/items?ids=${itemIds}`);
        if (!itemDetails) return;

        const merged = recent.map(cartItem => {
          const item = itemDetails.find(i => i.id === cartItem.item_id) || {};
          return {
            ...cartItem,
            name: item.name,
            model: item.model,
            price: item.price,
            total: (item.price || 0) * cartItem.quantity
          };
        });

        setRecentCartItems(merged);
      } catch (err) {
        console.error('Failed to fetch recent cart items:', err);
      }
    };

    const fetchUser = async () => {
      try {
        const data = await authFetch('/api/auth/me');
        if (!data) return;
        setUsername(data.username || 'User');
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };

    fetchItems();
    fetchRecentCartItems();
    fetchUser();
  }, []);

  // Summary stats
  const totalItemCount = items.length;
  const totalModels = new Set(items.map(item => item.model)).size;
  const totalItemQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

  const totalCartItems = recentCartItems.length;
  const totalCartQuantity = recentCartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = recentCartItems.reduce((acc, item) => acc + item.total, 0);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Hi, {username}!</h1>
        <p>Welcome back. Have a nice shopping!</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card">
          <h3>Total Items</h3>
          <p>Items: <strong>{totalItemCount}</strong></p>
          <p>Models: <strong>{totalModels}</strong></p>
          <p>Total Quantity: <strong>{totalItemQuantity}</strong></p>
        </div>
        <div className="card">
          <h3>Cart Summary</h3>
          <p>Items: <strong>{totalCartItems}</strong></p>
          <p>Quantity: <strong>{totalCartQuantity}</strong></p>
          <p>Total Price: <strong>${totalCartPrice.toFixed(2)}</strong></p>
        </div>
      </div>

      {/* Newly Added Items Table */}
      <section className="table-section">
        <h2>Newly Added Items</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Model</th>
                <th>Price</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {items.slice(0, 5).map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.model}</td>
                  <td>${item.price}</td>
                  <td>{item.quantity}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="4" className="no-data">No items found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Cart Items Table */}
      <section className="table-section">
        <h2>Recently Added Cart Items</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Model</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {recentCartItems.map((item, i) => (
                <tr key={`${item.item_id}-${i}`}>
                  <td>{item.name || 'Unknown'}</td>
                  <td>{item.model || 'N/A'}</td>
                  <td>${item.price || 0}</td>
                  <td>{item.quantity}</td>
                  <td><strong>${item.total?.toFixed(2) || 0}</strong></td>
                </tr>
              ))}
              {recentCartItems.length === 0 && (
                <tr>
                  <td colSpan="5" className="no-data">No cart activity found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
