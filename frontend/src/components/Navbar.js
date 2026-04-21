import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('token'); 
  const user = JSON.parse(localStorage.getItem('user')); 

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload(); 
  };

  return (
    <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '15px 50px', 
        background: '#ffffff', // Changed to clean white
        boxShadow: '0 4px 10px rgba(0,0,0,0.05)', // Soft premium shadow
        position: 'sticky', // ✅ Keeps it at the top when scrolling
        top: 0,
        zIndex: 1000
    }}>
      
      {/* 🌟 PREMIUM LOGO */}
      <h1 style={{ margin: 0 }}>
        <Link to="/" style={{ 
            color: '#2c3e50', 
            textDecoration: 'none', 
            fontSize: '26px', 
            fontWeight: '800',
            letterSpacing: '-1px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        }}>
          <span style={{ fontSize: '30px' }}>⚡</span> TechStore
        </Link>
      </h1>
      
      <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
        <Link to="/" style={linkStyle}>Home</Link>
        <Link to="/cart" style={linkStyle}>Cart 🛒</Link>
        
        {isLoggedIn ? (
          <>
            <Link to="/dashboard" style={{ ...linkStyle, color: '#2ecc71' }}>
              Dashboard 👤
            </Link>

            {user && user.isAdmin && (
              <Link to="/admin" style={{ ...linkStyle, color: '#e74c3c' }}>
                Admin ⚙️
              </Link>
            )}

            {/* ✅ Added className="btn" for hover animations */}
            <button 
                onClick={handleLogout} 
                className="btn"
                style={{ 
                    background: '#e74c3c', 
                    color: 'white', 
                    border: 'none', 
                    padding: '10px 20px', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    fontSize: '15px', 
                    fontWeight: '700' 
                }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>Login</Link>
            
            {/* ✅ Added className="btn" for hover animations */}
            <Link to="/signup" className="btn" style={{ 
                background: '#3498db', 
                color: 'white', 
                textDecoration: 'none', 
                padding: '10px 20px', 
                borderRadius: '8px', 
                fontSize: '15px', 
                fontWeight: '700' 
            }}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

// Reusable text link style to keep code clean
const linkStyle = {
    color: '#34495e', 
    textDecoration: 'none', 
    fontSize: '16px',
    fontWeight: '600',
    transition: 'color 0.2s ease'
};

export default Navbar;