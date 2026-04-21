import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './css/Login.css'; // 🌟 Import the new CSS file

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // ✅ Updated to live Render URL
            const res = await axios.post('https://techstore-api-cp6o.onrender.com/api/login', { email, password });

            //Email id pass already present in backend after signup ,,during login backened server matches the email and pass and provides a pass (token) to acccess data 

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            alert("Login Successful!");
            navigate('/'); 
            window.location.reload(); 
        } catch (err) {
            setError(err.response?.data?.message || "Login Failed");
        }   // ? checks after ecah step does err.response exists iff yes then moves forward .
    };

    return (
        <div className="login-page-wrapper">
            <div className="form-container">
                <h2>Login</h2>
                {error && <div className="error-message">⚠️ {error}</div>}
                <form onSubmit={handleSubmit}>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="submit">Login</button>
                </form>
                <p>Don't have an account? <Link to="/signup">Signup here</Link></p>
            </div>
        </div>
    );
}

export default Login;