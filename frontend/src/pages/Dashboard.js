import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom'; 
import './css/Dashboard.css'; 

function Dashboard() {
    const [orders, setOrders] = useState([]);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

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

        // ✅ Standardized to yuqh
        axios.get(`https://techstore-backend-yuqh.onrender.com/api/orders/${loggedInUser.name}`)
            .then(res => {
                const sortedOrders = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setOrders(sortedOrders);
            })
            .catch(err => console.error("Error fetching orders:", err));
            
    }, [navigate, location.search]);

    const getStatusStyle = (status) => {
        if (status === 'Delivered') return { background: '#d4edda', color: '#155724' };
        if (status === 'Shipped') return { background: '#cce5ff', color: '#004085' };
        if (status === 'Pending Payment') return { background: '#fdf2f2', color: '#e74c3c' }; 
        return { background: '#fff3cd', color: '#856404' }; 
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