import React, { useEffect, useState } from 'react';

const DashboardPage = () => {
  const [items, setItems] = useState([]);
  const [recentCartItems, setRecentCartItems] = useState([]);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    // Fetch all items
    const fetchItems = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/items', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setItems(data.reverse());
      } catch (err) {
        console.error('Failed to fetch items:', err);
      }
    };

    // Fetch and merge cart with item details
    const fetchRecentCartItems = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/cart', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const cartData = await res.json();

        // Sort cart items by latest and limit to 5
        const recent = [...cartData].sort((a, b) => b.item_id - a.item_id).slice(0, 5);

        // Extract itemIds and fetch those item details
        const itemIds = recent.map(c => c.item_id).join(',');
        const itemRes = await fetch(`http://localhost:5000/api/items?ids=${itemIds}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const itemDetails = await itemRes.json();

        // Merge cart items with item details
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

    // Fetch username
    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setUsername(data.username || 'User');
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };

    fetchItems();
    fetchRecentCartItems();
    fetchUser();
  }, []);

  return (
    <div className="p-6">
      {/* Greeting Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Hi, {username}!</h1>
        <p className="text-lg text-gray-700">Welcome back. Have a nice shopping!</p>
      </div>

      {/* Newly Added Items */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Newly Added Items</h2>
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="w-full table-auto text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Model</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Stock</th>
              </tr>
            </thead>
            <tbody>
              {items.slice(0, 5).map(item => (
                <tr key={item.id} className="border-t">
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{item.model}</td>
                  <td className="p-3">${item.price}</td>
                  <td className="p-3">{item.quantity}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-3 text-center text-gray-500">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recently Added Cart Items */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Recently Added Cart Items</h2>
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="w-full table-auto text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Model</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Quantity</th>
                <th className="p-3 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentCartItems.map((item, index) => (
                <tr key={`${item.item_id}-${index}`} className="border-t">
                  <td className="p-3">{item.name || 'Unknown'}</td>
                  <td className="p-3">{item.model || 'N/A'}</td>
                  <td className="p-3">${item.price || 0}</td>
                  <td className="p-3">{item.quantity}</td>
                  <td className="p-3 font-semibold">${item.total?.toFixed(2) || 0}</td>
                </tr>
              ))}
              {recentCartItems.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-3 text-center text-gray-500">
                    No cart activity found
                  </td>
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
