import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom'; 
import './css/Dashboard.css'; 

function Dashboard() {
    const [orders, setOrders] = useState([]);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Initial Load & URL Parameter Check
    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        if (!loggedInUser) {
            navigate('/login');
            return;
        }
        setUser(loggedInUser);

        const query = new URLSearchParams(location.search);
        if (query.get('success') === 'true') {
            alert("🎉 Order placed successfully! Our team will review the payment and process it shortly.");
            navigate('/dashboard', { replace: true }); 
        }

        axios.get(`https://techstore-backend-yuqh.onrender.com/api/orders/${loggedInUser.name}`)
            .then(res => {
                const sortedOrders = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setOrders(sortedOrders);
            })
            .catch(err => console.error("Error fetching orders:", err));
            
    }, [navigate, location.search]);

    // ✅ ADDED: Smart Polling for Payment Verification
    useEffect(() => {
        // Check if any order is currently waiting for the webhook
        const hasPendingOrders = orders.some(o => o.status === 'Pending Payment');
        
        if (hasPendingOrders && user) {
            console.log("Checking for payment verification...");
            const interval = setInterval(() => {
                axios.get(`https://techstore-backend-yuqh.onrender.com/api/orders/${user.name}`)
                    .then(res => {
                        const sortedOrders = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                        setOrders(sortedOrders); // Instantly updates UI when status changes to 'Paid & Processing'
                    })
                    .catch(err => console.error("Polling error:", err));
            }, 3000); // Check every 3 seconds

            // Cleanup the interval to prevent memory leaks
            return () => clearInterval(interval);
        }
    }, [orders, user]); // Re-run whenever orders or user changes

    const getStatusStyle = (status) => {
        if (status === 'Delivered') return { background: '#d4edda', color: '#155724' };
        if (status === 'Shipped') return { background: '#cce5ff', color: '#004085' };
        if (status === 'Pending Payment') return { background: '#fdf2f2', color: '#e74c3c' }; 
        if (status === 'Paid & Processing' || status === 'Processing') return { background: '#e1f5fe', color: '#0277bd' }; 
        return { background: '#fff3cd', color: '#856404' }; 
    };

    const handleRefundRequest = async (orderId) => {
        if (!window.confirm("Are you sure you want to request a refund for this order?")) return;
        try {
            await axios.put(`https://techstore-backend-yuqh.onrender.com/api/orders/${orderId}/request-refund`);
            alert("Refund request submitted! An admin will review it.");
            window.location.reload(); 
        } catch (err) { alert("Failed to send refund request."); }
    };

    if (!user) return null;

    return (
        <div className="dashboard-page-wrapper">
            <div className="dashboard-container">
                <div className="user-profile-header">
                    <h1>Welcome back, {user.name}! 👋</h1>
                    <p>Email: {user.email}</p>
                </div>
                <h2 className="order-history-title">Your Order History 📦</h2>
                {orders.length === 0 ? (
                    <div className="empty-orders">
                        <p style={{ fontSize: '18px', color: '#7f8c8d' }}>You haven't placed any orders yet.</p>
                        <Link to="/" style={{ color: '#3498db', textDecoration: 'none', fontWeight: 'bold' }}>Start Shopping ➔</Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {orders.map((order) => (
                            <div key={order._id} className="order-card">
                                <div className="order-meta">
                                    <div className="order-id-info">
                                        <p><strong>Order ID:</strong> {order._id}</p>
                                        <p><strong>Date:</strong> {new Date(order.date).toLocaleDateString()}</p>
                                    </div>
                                    <span className="status-badge" style={getStatusStyle(order.status)}>
                                        {order.status === 'Pending Payment' && '💳 '}
                                        {order.status === 'Paid & Processing' && '✅ '}
                                        {order.status === 'Processing' && '⏳ '}
                                        {order.status === 'Shipped' && '🚚 '}
                                        {order.status === 'Delivered' && '✅ '}
                                        {order.status} 
                                    </span>
                                </div>
                                <p className="address-line">
                                    <strong>📍 Delivery Address:</strong> {order.address || "No address provided"}
                                </p>
                                <div className="order-items-list">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="item-thumbnail">
                                            <img src={item.image} alt={item.name} referrerPolicy="no-referrer" />
                                            <span>{item.quantity || 1}x {item.name}</span>  
                                        </div>
                                    ))}
                                    
                                    {order.status === 'Delivered' && (
                                        <button 
                                            onClick={() => handleRefundRequest(order._id)} 
                                            style={{ marginTop: '15px', padding: '10px 15px', background: '#e67e22', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            Request Refund ↩️
                                        </button>
                                    )}
                                </div>
                                <h3 className="order-total">Total Paid: ${order.totalPrice.toFixed(2)}</h3>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;