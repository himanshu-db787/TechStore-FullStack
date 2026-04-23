import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // ✅ IMPORTED TOAST
import './css/AdminPanel.css'; 

function AdminPanel() {
    const [view, setView] = useState('inventory'); 
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', image: '', category: 'Tech' });
    const navigate = useNavigate();

    const fetchProducts = () => {
        axios.get('https://techstore-backend-yuqh.onrender.com/api/products')
            .then(res => setProducts(res.data))
            .catch(err => console.log(err));
    };

    const fetchOrders = () => {
        axios.get('https://techstore-backend-yuqh.onrender.com/api/admin/orders')
            .then(res => setOrders(res.data))
            .catch(err => console.log(err));
    };

    // 1. Initial Load & Auth Check
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.isAdmin) {
            toast.error("⛔ Access Denied! Admins only."); // ✅ UPGRADED TO TOAST
            navigate('/');
            return;
        }
        fetchProducts();
        fetchOrders();
    }, [navigate]);

    // ✅ 2. ADDED SMART POLLING FOR AUTOMATIC STATUS UPDATES
    useEffect(() => {
        const hasPendingOrders = orders.some(o => o.status === 'Pending Payment');
        // Only poll if we are looking at the orders tab AND there is a pending order
        if (hasPendingOrders && view === 'orders') {
            const interval = setInterval(() => {
                fetchOrders(); // Silently grab fresh data from the backend
            }, 3000); 
            
            // Cleanup the interval when the component closes or status changes
            return () => clearInterval(interval);
        }
    }, [orders, view]);

    const handleAddProduct = async (e) => {
        e.preventDefault();
        await axios.post('https://techstore-backend-yuqh.onrender.com/api/products', newProduct);
        toast.success("✅ Product Added!"); // ✅ UPGRADED TO TOAST
        setNewProduct({ name: '', price: '', stock: '', image: '', category: 'Tech' });
        fetchProducts(); 
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        await axios.delete(`https://techstore-backend-yuqh.onrender.com/api/products/${id}`);
        toast.success("Product deleted successfully."); // ✅ UPGRADED TO TOAST
        fetchProducts(); 
    };

    const handleUpdateStock = async (id, currentStock) => {
        const newStock = window.prompt(`Enter the new stock quantity:`, currentStock);
        if (newStock === null || newStock === "") return; 
        const stockNum = parseInt(newStock, 10);
        if (isNaN(stockNum) || stockNum < 0) return toast.warning("⚠️ Please enter a valid number."); // ✅ UPGRADED TO TOAST
        try {
            await axios.put(`https://techstore-backend-yuqh.onrender.com/api/products/${id}/stock`, { stock: stockNum });
            toast.success("Stock updated successfully!"); // ✅ UPGRADED TO TOAST
            fetchProducts(); 
        } catch (err) { 
            toast.error("Failed to update stock."); // ✅ UPGRADED TO TOAST
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        await axios.put(`https://techstore-backend-yuqh.onrender.com/api/orders/${orderId}/status`, { status: newStatus });
        toast.success("Order status updated!"); // ✅ UPGRADED TO TOAST
        fetchOrders(); 
    };

    const handleApproveRefund = async (orderId) => {
        if (!window.confirm("Approve this refund? This will immediately return the money via Stripe.")) return;
        try {
            await axios.post(`https://techstore-backend-yuqh.onrender.com/api/admin/orders/${orderId}/approve-refund`);
            toast.success("Refund Successful! Money has been returned."); // ✅ UPGRADED TO TOAST
            fetchOrders(); 
        } catch (err) { 
            toast.error("Refund Failed. Check server logs."); // ✅ UPGRADED TO TOAST
        }
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
                                <input type="number" placeholder="Stock" required value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} style={{ width: '80px' }} />
                                <input type="text" placeholder="Image URL" required value={newProduct.image} onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} style={{ flex: '2' }} />
                                <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}>
                                    <option value="Laptop">Laptop</option>
                                    <option value="Phone">Phone</option>
                                    <option value="Watch">Watch</option>
                                    <option value="Audio">Audio</option>
                                    <option value="Tech">Tech</option>
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
                                            <span style={{ fontSize: '13px', color: p.stock > 0 ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>
                                                {p.stock > 0 ? `In Stock: ${p.stock}` : 'Out of Stock'}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
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
                                        <option value="Paid & Processing">Paid & Processing</option> {/* Added this state! */}
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped 🚚</option>
                                        <option value="Delivered">Delivered ✅</option>
                                        <option value="Refund Requested">Refund Requested</option>
                                        <option value="Refunded ✅">Refunded ✅</option>
                                        <option value="Refunded - Stock Out">Refunded - Stock Out</option>
                                    </select>
                                    
                                    {order.status === 'Refund Requested' && (
                                        <button 
                                            onClick={() => handleApproveRefund(order._id)} 
                                            style={{ marginLeft: '10px', background: '#27ae60', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            Approve Refund ✅
                                        </button>
                                    )}
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