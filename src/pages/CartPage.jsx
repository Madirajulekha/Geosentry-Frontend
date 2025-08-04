import React, { useEffect, useState } from 'react';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [modifiedItems, setModifiedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [totalCost, setTotalCost] = useState(0);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('authToken');

      const cartRes = await fetch('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!cartRes.ok) throw new Error('Failed to fetch cart');
      const cartData = await cartRes.json();

      if (cartData.length === 0) {
        setCartItems([]);
        setTotalCost(0);
        return;
      }

      const itemIds = cartData.map((item) => item.item_id).join(',');
      const itemRes = await fetch(`http://localhost:5000/api/items?ids=${itemIds}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!itemRes.ok) throw new Error('Failed to fetch items');
      const itemDetails = await itemRes.json();

      let total = 0;
      const merged = cartData.map((cartItem) => {
        const item = itemDetails.find((i) => i.id === cartItem.item_id);
        const availableQty = item?.quantity || 0;
        const orderedQty = cartItem.quantity;
        const price = item?.price || 0;
        const outOfStockQty = Math.max(orderedQty - availableQty, 0);
        const totalPrice = orderedQty * price;

        total += Math.min(orderedQty, availableQty) * price;

        return {
          ...cartItem,
          name: item?.name,
          model: item?.model,
          price,
          availableQuantity: availableQty,
          quantity: orderedQty, // preserve actual ordered quantity
          outOfStockQty,
          totalPrice,
        };
      });

      setCartItems(merged);
      setTotalCost(total);
    } catch (err) {
      console.error(err);
      setCartItems([]);
      setTotalCost(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantityChange = (item_id, newQuantity) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.item_id === item_id) {
          const outOfStockQty = Math.max(newQuantity - item.availableQuantity, 0);
          const totalPrice = newQuantity * item.price;
          return { ...item, quantity: newQuantity, outOfStockQty, totalPrice };
        }
        return item;
      })
    );

    setModifiedItems((prev) => ({
      ...prev,
      [item_id]: newQuantity,
    }));

    const newTotal = cartItems.reduce((acc, item) => {
      const updatedQty =
        item.item_id === item_id ? newQuantity : item.quantity;
      return acc + Math.min(updatedQty, item.availableQuantity) * item.price;
    }, 0);
    setTotalCost(newTotal);
  };

  const updateCart = async () => {
    const token = localStorage.getItem('authToken');
    try {
      await Promise.all(
        Object.entries(modifiedItems).map(async ([item_id, quantity]) => {
          const res = await fetch(`http://localhost:5000/api/cart/${item_id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ quantity }),
          });
          if (!res.ok) throw new Error(`Failed to update item ${item_id}`);
        })
      );
      alert('Cart updated successfully!');
      setModifiedItems({});
      fetchCart();
    } catch (err) {
      console.error(err);
      alert('Failed to update cart');
    }
  };

  const removeItem = async (item_id) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://localhost:5000/api/cart/${item_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete item');

      const updatedCart = cartItems.filter((item) => item.item_id !== item_id);
      setCartItems(updatedCart);
      setModifiedItems((prev) => {
        const copy = { ...prev };
        delete copy[item_id];
        return copy;
      });

      const newTotal = updatedCart.reduce(
        (sum, item) =>
          sum + Math.min(item.quantity, item.availableQuantity) * item.price,
        0
      );
      setTotalCost(newTotal);
    } catch (err) {
      console.error(err);
      alert('Error removing item from cart');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>

      {loading ? (
        <p>Loading cart...</p>
      ) : cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {cartItems.map((item) => (
              <li
                key={item.item_id}
                className={`flex justify-between items-center bg-white p-4 rounded shadow ${
                  item.availableQuantity === 0 ? 'opacity-50' : ''
                }`}
              >
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-600">Model: {item.model}</div>
                  <div className="text-sm text-gray-700">
                    Price: ${item.price} <br />
                    Quantity:
                    <button
                      onClick={() =>
                        handleQuantityChange(item.item_id, item.quantity - 1)
                      }
                      className="ml-2 px-2 py-1 bg-gray-300 rounded"
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <span className="mx-2">{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item.item_id, item.quantity + 1)
                      }
                      className="px-2 py-1 bg-gray-300 rounded"
                      disabled={item.quantity >= item.availableQuantity}
                    >
                      +
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    In Stock: {item.availableQuantity}
                  </div>
                  {item.outOfStockQty > 0 && (
                    <div className="text-red-500 font-semibold">
                      ⚠ {item.outOfStockQty} item(s) out of stock
                    </div>
                  )}
                  <div className="text-sm font-semibold mt-1">
                    Total: ${item.totalPrice.toFixed(2)}
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.item_id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 text-right">
            <div className="text-xl font-bold mb-4">
              Grand Total: ${totalCost.toFixed(2)}
            </div>

            {Object.keys(modifiedItems).length > 0 &&
              !cartItems.some((item) => item.outOfStockQty > 0) && (
                <button
                  onClick={updateCart}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Update Cart
                </button>
              )}
            {cartItems.some((item) => item.outOfStockQty > 0) && (
              <p className="text-red-500 mt-2">
                Please adjust your cart — some items exceed current stock.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
