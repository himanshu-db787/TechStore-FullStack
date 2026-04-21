import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './css/Signup.css'; // 🌟 Import the new CSS file

function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // ✅ Updated to live Render URL
            await axios.post('https://techstore-api-cp6o.onrender.com/api/register', { name, email, password });
            alert("Registration Successful! Please Login.");
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="signup-page-wrapper">
            <div className="form-container">
                <h2>Create Account</h2>
                {error && <div className="error-message">⚠️ {error}</div>}
                <form onSubmit={handleSignup}>
                    <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="submit">Sign Up</button>
                </form>
                <p>Already have an account? <Link to="/login">Login here</Link></p>
            </div>
        </div>
    );
}

export default Signup;