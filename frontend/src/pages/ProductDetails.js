import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function ProductDetails() {
    const { id } = useParams(); // Grabs the product ID from the URL
    const [product, setProduct] = useState(null);
    
    // ✅ NEW: State to track how many items the user wants to buy
    const [qty, setQty] = useState(1);

    useEffect(() => {
        // Fetch specific product using the backend route
        axios.get(`https://techstore-api-cp6o.onrender.com/api/products/${id}`)
            .then(res => setProduct(res.data))
            .catch(err => console.log("Error:", err));
    }, [id]);

    const addToCart = () => { 
        // local storage only stores data in the form of strings !!
        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // ✅ NEW: Check if the product is already in the cart
        const existingItemIndex = currentCart.findIndex(item => item._id === product._id);

        if (existingItemIndex !== -1) {
            // If it's already in the cart, calculate the total they are trying to buy
            const newTotalQty = currentCart[existingItemIndex].quantity + qty;
            
            // 🛑 INVENTORY PROTECTION: Block them if they exceed stock
            if (newTotalQty > product.stock) {
                return alert(`We only have ${product.stock} in stock! You already have ${currentCart[existingItemIndex].quantity} in your cart.`);
            }
            
            // Update the quantity of the existing item
            currentCart[existingItemIndex].quantity = newTotalQty;
        } else {
            // 🛑 INVENTORY PROTECTION: Block on the first try if they exceed stock
            if (qty > product.stock) {
                return alert(`We only have ${product.stock} in stock!`);
            }
            // ✅ NEW: Push the product PLUS the quantity property
            currentCart.push({ ...product, quantity: qty });
        }

        localStorage.setItem('cart', JSON.stringify(currentCart));
        alert(`${qty} x ${product.name} added to Cart!`);
    };

    if (!product) return <h2 style={{ textAlign: 'center', padding: '50px' }}>Loading Product...</h2>;

    return (
        <div style={{ padding: '50px', maxWidth: '900px', margin: '0 auto' }}>
            <Link to="/" style={{ textDecoration: 'none', color: '#2c3e50', fontSize: '18px', fontWeight: 'bold' }}>
                &larr; Back to Store
            </Link>
            
            <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap',
                gap: '40px', 
                marginTop: '30px', 
                background: '#fff', 
                padding: '40px', 
                borderRadius: '12px', 
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)' 
            }}>
                <img 
                    src={product.image} 
                    alt={product.name} 
                    referrerPolicy="no-referrer" // ✅ FIXED: Prevents Unsplash images from breaking
                    style={{ width: '100%', maxWidth: '400px', borderRadius: '10px', objectFit: 'cover' }} 
                />
                
                <div style={{ flex: '1', minWidth: '300px' }}>
                    <h1 style={{ fontSize: '40px', marginBottom: '15px', color: '#333' }}>{product.name}</h1>
                    <h2 style={{ color: '#e74c3c', fontSize: '32px', marginBottom: '20px' }}>${product.price}</h2>
                    
                    {/* ✅ NEW: Display Stock Status dynamically */}
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: product.stock > 0 ? '#27ae60' : '#e74c3c', marginBottom: '20px' }}>
                        {product.stock > 0 ? `📦 In Stock: ${product.stock} available` : '❌ Sold Out'}
                    </p>

                    <p style={{ color: '#555', lineHeight: '1.8', fontSize: '16px', marginBottom: '30px' }}>
                        Experience the next generation of technology with the {product.name}. 
                        Designed with premium materials and cutting-edge features, this product 
                        delivers unparalleled performance and reliability for your everyday needs.
                    </p>
                    
                    {/* ✅ NEW: Quantity Selector (Only shows if item is in stock) */}
                    {product.stock > 0 && (
                        <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <label style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>Quantity:</label>
                            <input 
                                type="number" 
                                min="1" 
                                max={product.stock} 
                                value={qty} 
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    // Prevent user from manually typing a number higher than stock
                                    if (val > product.stock) setQty(product.stock);
                                    else if (val < 1) setQty(1);
                                    else setQty(val);
                                }}
                                style={{ width: '70px', padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc', textAlign: 'center' }} 
                            />
                        </div>
                    )}
                    
                    {/* ✅ UPDATED: Dynamic Button (Turns gray and disables if Out of Stock) */}
                    <button 
                        onClick={addToCart} 
                        disabled={product.stock <= 0}
                        style={{ 
                            background: product.stock > 0 ? '#2ecc71' : '#bdc3c7', 
                            color: 'white', 
                            padding: '15px 40px', 
                            border: 'none', 
                            borderRadius: '8px', 
                            fontSize: '20px', 
                            cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                            fontWeight: 'bold',
                            boxShadow: product.stock > 0 ? '0 4px 6px rgba(46, 204, 113, 0.3)' : 'none'
                        }}
                    >
                        {product.stock > 0 ? 'Add to Cart 🛒' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductDetails;