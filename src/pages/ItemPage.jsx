import React, { useEffect, useState } from 'react';

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
      const itemsRes = await fetch('http://localhost:5000/api/items', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const itemsData = await itemsRes.json();

      const cartRes = await fetch('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cartData = await cartRes.json();

      const cartMap = {};
      cartData.forEach((entry) => {
        cartMap[entry.item_id] = entry.quantity;
      });

      const initialQuantities = {};
      itemsData.forEach((item) => {
        initialQuantities[item.id] = cartMap[item.id] || 1;
      });

      setItems(itemsData);
      setQuantities(initialQuantities);
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
      const res = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemId: item.id,
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
      const res = await fetch('http://localhost:5000/api/items', {
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Available Items</h2>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => setShowForm(true)}
        >
          Add New Item
        </button>
      </div>

      {loading && <p>Loading items...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-4">
  {items.map((item) => (
    <div key={item.id} className="p-4 bg-white shadow rounded space-y-2">
      {/* Image container */}
      {/* <div className="w-full h-40 rounded overflow-hidden">
        <img
          src="https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-14-model-unselect-gallery-1-202209?wid=2560&hei=1440&fmt=jpeg&qlt=95&.v=1660689596976"
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div> */}

      <h3 className="text-lg font-semibold">{item.name}</h3>
      <p className="text-sm text-gray-600">Model: {item.model}</p>
      <p className="text-gray-800 font-bold">${item.price}</p>
      <p className="text-sm text-gray-500">In Stock: {item.quantity}</p>

      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={() => handleDecrement(item.id)}
          className="px-2 py-1 bg-gray-300 text-black rounded"
        >
          −
        </button>
        <span className="w-8 text-center">{quantities[item.id]}</span>
        <button
          onClick={() => handleIncrement(item.id, item.quantity)}
          className="px-2 py-1 bg-gray-300 text-black rounded"
          disabled={quantities[item.id] >= item.quantity}
        >
          +
        </button>
      </div>

      <button
        onClick={() => addToCart(item)}
        className="w-full mt-3 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
      >
        Add to Cart
      </button>
    </div>
  ))}
</div>


      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow">
            <h3 className="text-xl font-semibold mb-4">Add New Item</h3>
            <form onSubmit={submitNewItem} className="space-y-3">
              <input
                name="name"
                placeholder="Item Name"
                value={formData.name}
                onChange={handleFormChange}
                required
                className="w-full p-2 border rounded"
              />
              <input
                name="model"
                placeholder="Model"
                value={formData.model}
                onChange={handleFormChange}
                required
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleFormChange}
                required
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={handleFormChange}
                required
                className="w-full p-2 border rounded"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemPage;
