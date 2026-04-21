import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Cart from './pages/Cart';
import ProductDetails from './pages/ProductDetails'; 
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel'; // ✅ NEW IMPORT
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/product/:id" element={<ProductDetails />} /> 
        <Route path="/dashboard" element={<Dashboard />} /> 
        {/* ✅ NEW ROUTE FOR ADMIN */}
        <Route path="/admin" element={<AdminPanel />} /> 
      </Routes>
    </Router>
  );
}

export default App;