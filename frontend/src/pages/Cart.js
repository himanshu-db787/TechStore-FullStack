import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/Cart.css'; 

function Cart() {
    const [cart, setCart] = useState([]);
    const [address, setAddress] = useState(""); 
    const navigate = useNavigate();

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Safety check: ensure all items have a quantity of at least 1
        const formattedCart = savedCart.map(item => ({
            ...item,
            quantity: item.quantity || 1
        }));
        
        setCart(formattedCart);
    }, []);

    // ✅ NEW: Function to increase or decrease item quantity safely
    const updateQuantity = (index, delta) => {
        const newCart = [...cart];
        const item = newCart[index];
        const newQty = item.quantity + delta;

        // If they decrease below 1, remove the item entirely
        if (newQty <= 0) {
            removeFromCart(index);
            return;
        }

        // 🛑 INVENTORY PROTECTION: Block them from adding more than exists
        if (newQty > item.stock) {
            alert(`Sorry! We only have ${item.stock} units of ${item.name} in stock.`);
            return;
        }

        // Update the specific item's quantity
        item.quantity = newQty;
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    const removeFromCart = (index) => {
        const newCart = cart.filter((_, i) => i !== index);  
        setCart(newCart); 
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    // ✅ UPDATED: Math now multiplies Price by Quantity!
    let runningTotal = 0; 
    for (const item of cart) {
        runningTotal += (item.price * item.quantity);
    }
    const totalPrice = runningTotal.toFixed(2);


    const handleCheckout = async () => {
        if (cart.length === 0) return alert("Your cart is empty!");
        if (!address.trim()) return alert("📍 Please enter a delivery address!"); 

        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        if (!loggedInUser) {
            alert("🔒 Please log in to place your order!");
            navigate('/login'); 
            return;
        }

        try {
            const orderData = {
                customerName: loggedInUser.name,
                items: cart, // This array now correctly contains { ...product, quantity: X }
                address: address 
            };

            const response = await axios.post('https://techstore-api-cp6o.onrender.com/api/create-checkout-session', orderData);
            setCart([]);
            localStorage.removeItem('cart');
            window.location.href = response.data.url; 

        } catch (error) {
            console.error("Checkout failed:", error);
            alert(error.response?.data?.error || "Something went wrong connecting to Stripe.");
        }
    };

    return (
        <div className="cart-page-wrapper">
            <div className="cart-container">
                <h2>Your Shopping Cart</h2>
                {cart.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '20px' }}>Your cart is empty.</p>
                ) : (
                    <div>
                        {cart.map((item, index) => (
                            <div key={index} className="cart-item" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
                                <img src={item.image} alt={item.name} referrerPolicy="no-referrer" style={{ width: '80px', borderRadius: '10px', objectFit: 'cover' }} />
                                
                                <div style={{ flex: '1' }}>
                                    <h3 style={{ margin: '0 0 5px 0' }}>{item.name}</h3>
                                    <p style={{ margin: 0, color: '#7f8c8d' }}>${item.price} each</p>
                                </div>
                                
                                {/* ✅ NEW: QUANTITY CONTROLS */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8f9fa', padding: '5px 10px', borderRadius: '8px' }}>
                                    <button 
                                        onClick={() => updateQuantity(index, -1)}
                                        style={{ border: 'none', background: '#e74c3c', color: 'white', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        -
                                    </button>
                                    <span style={{ fontSize: '18px', fontWeight: 'bold', width: '20px', textAlign: 'center' }}>
                                        {item.quantity}
                                    </span>
                                    <button 
                                        onClick={() => updateQuantity(index, 1)}
                                        style={{ border: 'none', background: '#2ecc71', color: 'white', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        +
                                    </button>
                                </div>

                                <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#2c3e50', width: '80px', textAlign: 'right' }}>
                                    ${(item.price * item.quantity).toFixed(2)}
                                </div>

                                <button onClick={() => removeFromCart(index)} className="remove-btn" style={{ marginLeft: '10px' }}>Remove</button>
                            </div>
                        ))}
                        
                        <div className="total-display" style={{ marginTop: '30px', fontSize: '24px', textAlign: 'right', fontWeight: 'bold', color: '#e74c3c' }}>
                            Total: ${totalPrice}
                        </div>
                        
                        <textarea 
                            className="address-textarea"
                            placeholder="Enter your full shipping address (Street, City, Zip)..." 
                            value={address} 
                            onChange={(e) => setAddress(e.target.value)}
                            required
                            style={{ width: '100%', padding: '15px', marginTop: '20px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '80px' }}
                        />

                        <button 
                            onClick={handleCheckout}
                            className="checkout-btn"
                            style={{ width: '100%', padding: '15px', marginTop: '20px', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            Pay with Stripe 💳
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Cart;