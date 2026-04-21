import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Home() { 
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    
    // ✅ NEW: State to track the active category filter
    const [selectedCategory, setSelectedCategory] = useState("All");

    // ✅ NEW: Array of categories
    const categories = ["All", "Phone", "Laptop", "Audio", "Watch"];

    useEffect(() => { 
        axios.get('https://techstore-backend-yuqh.onrender.com/api/products') 
            .then(res => setProducts(res.data))
            .catch(err => console.log(err));
    }, []);

    // ✅ UPDATED: Filter checks both the search query AND the category
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });

    return (
        <div>
            {/* 🌟 BANNER */}
            <div style={{ background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)', color: 'white', padding: '60px 20px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0', fontWeight: '700' }}>Welcome to TechStore</h1>
                <p style={{ fontSize: '1.2rem', margin: '0 0 30px 0', opacity: '0.9' }}>Discover the latest gadgets and next-gen tech.</p>
                
                {/* SEARCH BAR */}
                <input 
                    type="text" 
                    placeholder="Search for gadgets (e.g. iPhone)..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', maxWidth: '600px', padding: '15px 25px', borderRadius: '30px', border: 'none', fontSize: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
                />
            </div>

            <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
                
                {/* ✅ NEW: CATEGORY BUTTONS */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '30px' }}>
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '25px',
                                // Dynamic styling: changes colors if it is the active category
                                border: selectedCategory === category ? 'none' : '2px solid #3498db',
                                backgroundColor: selectedCategory === category ? '#3498db' : 'transparent',
                                color: selectedCategory === category ? 'white' : '#3498db',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out'
                            }}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* PRODUCT GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '35px', marginTop: '20px' }}>
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map(product => (
                            <div key={product._id} className="product-card" style={{ border: '1px solid #eaeaea', borderRadius: '15px', padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                
                                <div>
                                    {/* Note: Added referrerPolicy to prevent broken images from external sources */}
                                    <img src={product.image} alt={product.name} referrerPolicy="no-referrer" style={{ width: '100%', height: '220px', objectFit: 'contain', marginBottom: '15px' }} />
                                    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem', color: '#2c3e50' }}>{product.name}</h3>
                                </div>

                                <div style={{ marginTop: '20px' }}>
                                    <p style={{ color: '#27ae60', fontWeight: '700', fontSize: '22px', margin: '0 0 15px 0' }}>${product.price}</p>
                                    <Link to={`/product/${product._id}`} className="btn" style={{ display: 'block', padding: '12px 20px', backgroundColor: '#3498db', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: '600', width: '100%' }}>
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '50px 0' }}>
                            <p style={{ fontSize: '20px', color: '#7f8c8d' }}>No gadgets found matching "{searchQuery}" in {selectedCategory}.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Home;