import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/AdminPanel.css'; 

function AdminPanel() {
    const [view, setView] = useState('inventory'); 
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    
    // ✅ ADDED STOCK TO STATE
    const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', image: '', category: 'Tech' });
    const navigate = useNavigate();

    const fetchProducts = () => {
        axios.get('https://techstore-api-cp6o.onrender.com/api/products').then(res => setProducts(res.data)).catch(err => console.log(err));
    };

    const fetchOrders = () => {
        axios.get('https://techstore-api-cp6o.onrender.com/api/admin/orders').then(res => setOrders(res.data)).catch(err => console.log(err));
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.isAdmin) {
            alert("⛔ Access Denied! Admins only.");
            navigate('/');
            return;
        }
        fetchProducts();
        fetchOrders();
    }, [navigate]);

    // --- PRODUCT LOGIC ---
    const handleAddProduct = async (e) => {
        e.preventDefault();
        await axios.post('https://techstore-api-cp6o.onrender.com/api/products', newProduct);
        alert("✅ Product Added!");
        // ✅ RESET INCLUDES STOCK
        setNewProduct({ name: '', price: '', stock: '', image: '', category: 'Tech' });
        fetchProducts(); 
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        await axios.delete(`https://techstore-api-cp6o.onrender.com/api/products/${id}`);
        fetchProducts(); 
    };

    // ✅ NEW: FUNCTION FOR ADMIN TO EDIT STOCK MANUALLY
    const handleUpdateStock = async (id, currentStock) => {
        const newStock = window.prompt(`Enter the new stock quantity:`, currentStock);
        if (newStock === null || newStock === "") return; 
        
        const stockNum = parseInt(newStock, 10);
        if (isNaN(stockNum) || stockNum < 0) return alert("⚠️ Please enter a valid number.");

        try {
            await axios.put(`https://techstore-api-cp6o.onrender.com/api/products/${id}/stock`, { stock: stockNum });
            fetchProducts(); 
        } catch (err) { alert("Failed to update stock."); }
    };

    // --- ORDER LOGIC ---
    const handleStatusChange = async (orderId, newStatus) => {
        await axios.put(`https://techstore-api-cp6o.onrender.com/api/orders/${orderId}/status`, { status: newStatus });
        fetchOrders(); 
    };

    return (
        <div className="admin-page-wrapper">
            <div className="admin-container">
                <h1>⚙️ Admin Dashboard</h1>
                
                <div className="admin-tabs">
                    <button onClick={() => setView('inventory')} className={`tab-btn ${view === 'inventory' ? 'active' : 'inactive'}`}>Manage Inventory</button>
                    <button onClick={() => setView('orders')} className={`tab-btn ${view === 'orders' ? 'active' : 'inactive'}`}>Manage Orders</button>
                </div>

                {view === 'inventory' && (
                    <>
                        <div className="add-product-box">
                            <h2>Add New Product</h2>
                            <form onSubmit={handleAddProduct} className="add-product-form">
                                <input type="text" placeholder="Name" required value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} style={{ flex: '1' }} />
                                <input type="number" placeholder="Price" required value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} style={{ width: '80px' }} />
                                {/* ✅ NEW: STOCK INPUT */}
                                <input type="number" placeholder="Stock" required value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} style={{ width: '80px' }} />
                                
                                <input type="text" placeholder="Image URL" required value={newProduct.image} onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} style={{ flex: '2' }} />
                                <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}>
                                    <option value="Laptop">Laptop</option>
                                    <option value="Phone">Phone</option>
                                    <option value="Watch">Watch</option>
                                    <option value="Audio">Audio</option>
                                </select>
                                <button type="submit">+ Add</button>
                            </form>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {products.map(p => (
                                <div key={p._id} className="inventory-item">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <img src={p.image} alt={p.name} referrerPolicy="no-referrer" style={{ width: '50px', height: '50px', objectFit: 'contain' }}/>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{p.name}</h3>
                                            {/* ✅ NEW: DISPLAY CURRENT STOCK */}
                                            <span style={{ fontSize: '13px', color: p.stock > 0 ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>
                                                {p.stock > 0 ? `In Stock: ${p.stock}` : 'Out of Stock'}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {/* ✅ NEW: EDIT STOCK BUTTON */}
                                        <button onClick={() => handleUpdateStock(p._id, p.stock)} style={{ background: '#f39c12', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Edit Stock</button>
                                        <button onClick={() => handleDelete(p._id)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {view === 'orders' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {orders.map(order => (
                            <div key={order._id} className="admin-order-card">
                                <div className="order-header">
                                    <h3 style={{ margin: 0 }}>👤 {order.customerName}</h3>
                                    <h3 style={{ margin: 0, color: '#27ae60' }}>${order.totalPrice}</h3>
                                </div>
                                <p style={{ color: '#4a5568' }}><strong>📍 Address:</strong> {order.address}</p>
                                <p style={{ color: '#4a5568' }}><strong>📦 Items:</strong> {order.items.map(i => i.name).join(', ')}</p>
                                
                                <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <strong>Status:</strong>
                                    <select 
                                        value={order.status} 
                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                        className="status-select"
                                        style={{ background: order.status === 'Delivered' ? '#d4edda' : order.status === 'Shipped' ? '#cce5ff' : '#fff3cd' }}
                                    >
                                        <option value="Pending Payment">Pending Payment (Unpaid)</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped 🚚</option>
                                        <option value="Delivered">Delivered ✅</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminPanel;