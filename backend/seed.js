require('dotenv').config(); // 🌟 ADDED: This lets us use your live database link!
const mongoose = require('mongoose');

// 1. Connect to your LIVE database
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log(">>> Connected to LIVE MongoDB..."))
    .catch(err => console.log("DB Error:", err));

// 2. Define the exact same Product Model from your server.js
const Product = mongoose.model('Product', new mongoose.Schema({ 
    name: String,
    price: Number,
    image: String,
    category: { type: String, default: "Tech" },
    stock: { type: Number, default: 10 }
}));

// 3. The Full 50-Item Database (No _ids included)
const productsData = [
  // --- PHONES ---
  { name: "iPhone 15 Pro Titanium", price: 999, stock: 45, category: "Phone", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=500&q=80" },
  { name: "Google Pixel 8 Pro", price: 999, stock: 0, category: "Phone", image: "https://placehold.co/500x500/2c3e50/ffffff?text=Google+Pixel+8+Pro" },
  { name: "Samsung Galaxy S24 Ultra", price: 1299, stock: 30, category: "Phone", image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=500&q=80" },
  { name: "OnePlus 12 5G", price: 799, stock: 25, category: "Phone", image: "https://placehold.co/500x500/3498db/ffffff?text=OnePlus+12+5G" },
  { name: "Nothing Phone (2)", price: 599, stock: 50, category: "Phone", image: "https://placehold.co/500x500/2c3e50/ffffff?text=Nothing+Phone+(2)" },
  { name: "iPhone 14 Plus", price: 799, stock: 18, category: "Phone", image: "https://images.unsplash.com/photo-1533228100845-08145b01de14?auto=format&fit=crop&w=500&q=80" },
  { name: "Samsung Galaxy Z Fold 5", price: 1799, stock: 5, category: "Phone", image: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=500&q=80" },
  { name: "Motorola Razr+", price: 999, stock: 12, category: "Phone", image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=500&q=80" },
  { name: "Sony Xperia 1 V", price: 1399, stock: 0, category: "Phone", image: "https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=500&q=80" },
  { name: "Asus ROG Phone 8", price: 1099, stock: 10, category: "Phone", image: "https://placehold.co/500x500/3498db/ffffff?text=Asus+ROG+Phone+8" },
  { name: "Google Pixel 7a", price: 499, stock: 60, category: "Phone", image: "https://placehold.co/500x500/2c3e50/ffffff?text=Google+Pixel+7a" },
  { name: "iPhone 13 Mini", price: 599, stock: 4, category: "Phone", image: "https://placehold.co/500x500/3498db/ffffff?text=iPhone+13+Mini" },

  // --- LAPTOPS ---
  { name: "MacBook Pro M3 Max", price: 3199, stock: 8, category: "Laptop", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80" },
  { name: "Dell XPS 15 OLED", price: 1899, stock: 14, category: "Laptop", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&q=80" },
  { name: "Lenovo ThinkPad X1", price: 1699, stock: 40, category: "Laptop", image: "https://placehold.co/500x500/2c3e50/ffffff?text=Lenovo+ThinkPad+X1" },
  { name: "HP Spectre x360", price: 1399, stock: 20, category: "Laptop", image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=500&q=80" },
  { name: "Asus ROG Zephyrus G14", price: 1599, stock: 0, category: "Laptop", image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=500&q=80" },
  { name: "MacBook Air M2", price: 1099, stock: 25, category: "Laptop", image: "https://placehold.co/500x500/3498db/ffffff?text=MacBook+Air+M2" },
  { name: "Razer Blade 15", price: 2499, stock: 6, category: "Laptop", image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=500&q=80" },
  { name: "Acer Swift 3", price: 699, stock: 0, category: "Laptop", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=500&q=80" },
  { name: "Surface Laptop 5", price: 999, stock: 22, category: "Laptop", image: "https://placehold.co/500x500/2c3e50/ffffff?text=Surface+Laptop+5" },
  { name: "LG Gram 17", price: 1599, stock: 12, category: "Laptop", image: "https://placehold.co/500x500/3498db/ffffff?text=LG+Gram+17" },
  { name: "MSI Stealth 16 Studio", price: 1899, stock: 8, category: "Laptop", image: "https://placehold.co/500x500/2c3e50/ffffff?text=MSI+Stealth+16+Studio" },
  { name: "Alienware m18", price: 2899, stock: 3, category: "Laptop", image: "https://images.unsplash.com/photo-1504707748692-419802cf939d?auto=format&fit=crop&w=500&q=80" },
  { name: "Framework 13", price: 1049, stock: 15, category: "Laptop", image: "https://placehold.co/500x500/3498db/ffffff?text=Framework+13" },

  // --- AUDIO ---
  { name: "Sony WH-1000XM5", price: 398, stock: 30, category: "Audio", image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=500&q=80" },
  { name: "Beats Studio Pro", price: 349, stock: 25, category: "Audio", image: "https://placehold.co/500x500/2c3e50/ffffff?text=Beats+Studio+Pro" },
  { name: "Apple AirPods Pro 2", price: 249, stock: 100, category: "Audio", image: "https://placehold.co/500x500/3498db/ffffff?text=Apple+AirPods+Pro+2" },
  { name: "Marshall Stanmore II", price: 379, stock: 10, category: "Audio", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80" },
  { name: "Google Pixel Buds Pro", price: 199, stock: 22, category: "Audio", image: "https://placehold.co/500x500/2c3e50/ffffff?text=Google+Pixel+Buds+Pro" },
  { name: "JBL Flip 6 Portable", price: 129, stock: 60, category: "Audio", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=500&q=80" },
  { name: "Sennheiser Momentum 4", price: 349, stock: 18, category: "Audio", image: "https://placehold.co/500x500/3498db/ffffff?text=Sennheiser+Momentum+4" },
  { name: "Bose QuietComfort 45", price: 329, stock: 0, category: "Audio", image: "https://placehold.co/500x500/2c3e50/ffffff?text=Bose+QuietComfort+45" },
  { name: "Samsung Galaxy Buds 2 Pro", price: 229, stock: 35, category: "Audio", image: "https://placehold.co/500x500/3498db/ffffff?text=Samsung+Galaxy+Buds+2+Pro" },
  { name: "Apple AirPods Max", price: 549, stock: 0, category: "Audio", image: "https://placehold.co/500x500/2c3e50/ffffff?text=Apple+AirPods+Max" },
  { name: "Jabra Elite 85t", price: 229, stock: 40, category: "Audio", image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=500&q=80" },
  { name: "Sonos Roam Smart Speaker", price: 179, stock: 15, category: "Audio", image: "https://placehold.co/500x500/3498db/ffffff?text=Sonos+Roam+Smart+Speaker" },

  // --- WATCHES ---
  { name: "Apple Watch Ultra 2", price: 799, stock: 15, category: "Watch", image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=500&q=80" },
  { name: "Samsung Galaxy Watch 6", price: 399, stock: 20, category: "Watch", image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=500&q=80" },
  { name: "Garmin Fenix 7 Pro", price: 799, stock: 0, category: "Watch", image: "https://placehold.co/500x500/2c3e50/ffffff?text=Garmin+Fenix+7+Pro" },
  { name: "Apple Watch Series 9", price: 399, stock: 45, category: "Watch", image: "https://placehold.co/500x500/3498db/ffffff?text=Apple+Watch+Series+9" },
  { name: "Fitbit Sense 2", price: 299, stock: 30, category: "Watch", image: "https://images.unsplash.com/photo-1576502200916-3808e07386a5?auto=format&fit=crop&w=500&q=80" },
  { name: "Google Pixel Watch 2", price: 349, stock: 22, category: "Watch", image: "https://placehold.co/500x500/2c3e50/ffffff?text=Google+Pixel+Watch+2" },
  { name: "Garmin Forerunner 965", price: 599, stock: 18, category: "Watch", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80" },
  { name: "Apple Watch SE", price: 249, stock: 55, category: "Watch", image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=500&q=80" },
  { name: "Amazfit GTR 4", price: 199, stock: 40, category: "Watch", image: "https://placehold.co/500x500/3498db/ffffff?text=Amazfit+GTR+4" },
  { name: "Galaxy Watch 5 Pro", price: 299, stock: 0, category: "Watch", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=500&q=80" },
  { name: "Fitbit Charge 6", price: 159, stock: 60, category: "Watch", image: "https://placehold.co/500x500/2c3e50/ffffff?text=Fitbit+Charge+6" },
  { name: "Garmin Venu 3", price: 449, stock: 25, category: "Watch", image: "https://placehold.co/500x500/3498db/ffffff?text=Garmin+Venu+3" },
  { name: "Casio G-Shock Smart", price: 299, stock: 12, category: "Watch", image: "https://placehold.co/500x500/2c3e50/ffffff?text=Casio+G-Shock+Smart" }
];

// 4. Run the injection
const seedDatabase = async () => {
    try {
        console.log("🧹 Clearing out old test products...");
        await Product.deleteMany({}); 

        console.log("🌱 Planting 50 new categorized products...");
        await Product.insertMany(productsData); 

        console.log("✅ All 50 Products Added Successfully!");
        process.exit(); 
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    }
};

seedDatabase();