require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 1. INITIALIZE STRIPE 
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// 2. CONNECT TO DATABASE
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log(">>> MongoDB Connected! <<<"))
    .catch(err => console.log("DB Error:", err));

// 3. MODELS
const User = mongoose.model('User', new mongoose.Schema({ 
    name: String,
    email: { type: String, unique: true },
    password: String,
    isAdmin: { type: Boolean, default: false } 
}));

const Product = mongoose.model('Product', new mongoose.Schema({ 
    name: String,
    price: Number,
    image: String,
    category: { type: String, default: "Tech" },
    stock: { type: Number, default: 10 } 
}));

const Order = mongoose.model('Order', new mongoose.Schema({ 
    customerName: String, 
    items: Array, 
    totalPrice: Number, 
    address: { type: String, required: true }, 
    status: { type: String, default: "Pending Payment" }, // Starts as pending for manual review
    date: { type: Date, default: Date.now } 
}));

// 4. ROUTES

// --- ADMIN ORDER MANAGEMENT ---
app.get('/api/admin/orders', async (req, res) => {
    try {
        const allOrders = await Order.find({}).sort({ date: -1 }); 
        res.json(allOrders);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin manually updates order status (e.g., Pending -> Processing -> Shipped)
app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(updatedOrder);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- OTHER ROUTES ---
app.get('/api/products', async (req, res) => { res.json(await Product.find({})); });
app.post('/api/products', async (req, res) => { const p = new Product(req.body); await p.save(); res.json(p); });
app.delete('/api/products/:id', async (req, res) => { await Product.findByIdAndDelete(req.params.id); res.json({msg: "Deleted"}); });

app.get('/api/products/:id', async (req, res) => { 
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.json(product);
    } catch (err) {
        res.status(400).json({ error: "Invalid ID format" });
    }
});

app.get('/api/orders/:userName', async (req, res) => { res.json(await Order.find({ customerName: req.params.userName })); });

// ADMIN ROUTE TO MANUALLY EDIT STOCK
app.put('/api/products/:id/stock', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, { stock: req.body.stock }, { new: true });
        res.json(updatedProduct);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return res.status(400).json({ message: "Invalid email format!" });
        if (password.length < 6) return res.status(400).json({ message: "Password too weak!" });
        if (await User.findOne({ email })) return res.status(400).json({ message: "User exists" });
        await new User({ name, email, password }).save();
        res.json({ message: "Registered" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user && user.password === req.body.password) res.json({ user: { name: user.name, email: user.email, isAdmin: user.isAdmin } });
    else res.status(401).json({ message: "Invalid credentials" });
});

// --- STRIPE CHECKOUT ---
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { items, customerName, address } = req.body; 

        // PRE-CHECKOUT STOCK GATE: Prevent checkout if stock is too low
        for (const item of items) {
            const dbProduct = await Product.findById(item._id);
            if (!dbProduct || dbProduct.stock < (item.quantity || 1)) {
                return res.status(400).json({ error: `Not enough stock for ${item.name}` });
            }
        }

        const lineItems = items.map((item) => ({
            price_data: {
                currency: 'usd',
                product_data: { name: item.name, images: [item.image] },
                unit_amount: item.price * 100, 
            },
            quantity: item.quantity || 1, 
        }));

        const totalPrice = items.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
        
        // Save order as pending
        const newOrder = new Order({ customerName, items, totalPrice, address, status: "Pending Payment" });
        await newOrder.save();

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            // ✅ THESE TWO LINES ARE NOW POINTING TO YOUR VERCEL SITE!
            success_url: `https://techstore-frontend-one.vercel.app/dashboard?success=true`,
            cancel_url: `https://techstore-frontend-one.vercel.app/cart?canceled=true`,
        });

        res.json({ url: session.url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ THE PORT IS SET CORRECTLY HERE TOO
const PORT = process.env.PORT || 5006;
app.listen(PORT, () => console.log(`>>> SERVER RUNNING ON PORT ${PORT} <<<`));