import React, { useEffect, useState } from 'react';
import './pagestyles/ItemPage.css';

const ItemPage = () => {
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    price: '',
    quantity: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
  const token = localStorage.getItem('authToken');
  try {
    // Fetch all items (with full details)
    const itemsRes = await fetch('https://us-central1-focal-inquiry-468015-q5.cloudfunctions.net/api/api/items', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const itemsData = await itemsRes.json();

    // Fetch cart (already contains all details for items in cart)
    const cartRes = await fetch('https://us-central1-focal-inquiry-468015-q5.cloudfunctions.net/api/api/cart', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const cartData = await cartRes.json();
// console.log('Cart data:', cartData);

// Set initial quantities: if in cart, use cart quantity; else 1
const initialQuantities = {};
itemsData.forEach((item) => {
  // Find if this item is in the cart
  // console.log('Checking item:', item);
  const cartEntry = cartData.find((entry) => entry.item_id === item.id);
  initialQuantities[item.id] = cartEntry ? cartEntry.quantity : 1;
});

setItems(itemsData);
setQuantities(initialQuantities);

  // console.log('Fetched items:', itemsData);
  // console.log('Initial quantities:', initialQuantities);

  } catch (err) {
    console.error(err);
    setError('Failed to load items');
  } finally {
    setLoading(false);
  }
};

  const handleIncrement = (id, stock) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.min(prev[id] + 1, stock),
    }));
  };

  const handleDecrement = (id) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, prev[id] - 1),
    }));
  };

  const addToCart = async (item) => {
    const token = localStorage.getItem('authToken');
    const quantity = quantities[item.id] || 1;

    try {
      const res = await fetch('https://us-central1-focal-inquiry-468015-q5.cloudfunctions.net/api/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          item_id: item.id,
          quantity,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Added ${quantity} x ${item.name} to cart`);
      } else {
        alert(data.message || 'Failed to add item to cart');
      }
    } catch (err) {
      console.error(err);
      alert('Server error while adding to cart');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const submitNewItem = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch('https://us-central1-focal-inquiry-468015-q5.cloudfunctions.net/api/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          model: formData.model,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity, 10)
        })
      });

      if (!res.ok) throw new Error('Failed to add item');
      alert('Item added!');
      setShowForm(false);
      setFormData({ name: '', model: '', price: '', quantity: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error adding item');
    }
  };

  return (
    <div className="item-container">
      <div className="item-header">
        <h2 className="item-title">Available Items</h2>
        <button className="add-btn" onClick={() => setShowForm(true)}>Add New Item</button>
      </div>

      {loading && <p>Loading items...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="item-grid">
        {items.map((item) => (
          <div key={item.id} className="item-card">
            <h3 className="item-name">{item.name}</h3>
            <p className="item-model">Model: {item.model}</p>
            <p className="item-price">${item.price}</p>
            <p className="item-stock">In Stock: {item.quantity}</p>

            <div className="quantity-controls">
              <button onClick={() => handleDecrement(item.id)} className="qty-btn">−</button>
              <span className="qty-value">{quantities[item.id]}</span>
              <button onClick={() => handleIncrement(item.id, item.quantity)} className="qty-btn" disabled={quantities[item.id] >= item.quantity}>+</button>
            </div>

            <button onClick={() => addToCart(item)} className="cart-btn">Add to Cart</button>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title">Add New Item</h3>
            <form onSubmit={submitNewItem} className="form">
              <input name="name" placeholder="Item Name" value={formData.name} onChange={handleFormChange} required className="form-input" />
              <input name="model" placeholder="Model" value={formData.model} onChange={handleFormChange} required className="form-input" />
              <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleFormChange} required className="form-input" />
              <input type="number" name="quantity" placeholder="Quantity" value={formData.quantity} onChange={handleFormChange} required className="form-input" />
              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">Cancel</button>
                <button type="submit" className="save-btn">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemPage;
