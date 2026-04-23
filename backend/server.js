require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// ✅ 1. ADDED SECURITY IMPORTS
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ✅ 2. DEFINED JWT SECRET KEY
const JWT_SECRET = process.env.JWT_SECRET || "kiit_techstore_secret_2026";

app.post('/api/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) { return res.status(400).send(`Webhook Error: ${err.message}`); }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const items = JSON.parse(session.metadata.items);

        try {
            for (const item of items) {
                const updatedProduct = await Product.findOneAndUpdate(
                    { _id: item._id, stock: { $gte: item.quantity } }, 
                    { $inc: { stock: -item.quantity } }, 
                    { new: true }
                );

                if (!updatedProduct) {
                    await stripe.refunds.create({ payment_intent: session.payment_intent });
                    await Order.findByIdAndUpdate(session.metadata.orderId, { status: "Refunded - Stock Out" });
                    return res.json({ received: true });
                }
            }
            await Order.findByIdAndUpdate(session.metadata.orderId, { 
                status: "Paid & Processing",
                paymentIntentId: session.payment_intent 
            });
        } catch (err) { console.error("Automation Error", err); }
    }
    res.json({ received: true });
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log(">>> MongoDB Connected! <<<"))
    .catch(err => console.log("DB Error:", err));

const User = mongoose.model('User', new mongoose.Schema({ 
    name: String,
    email: { type: String, unique: true },
    password: { type: String, required: true }, // Updated to strictly require password
    isAdmin: { type: Boolean, default: false } 
}));

const Product = mongoose.model('Product', new mongoose.Schema({ 
    name: String, price: Number, image: String,
    category: { type: String, default: "Tech" }, 
    stock: { type: Number, default: 10 } 
}));

const Order = mongoose.model('Order', new mongoose.Schema({ 
    customerName: String, items: Array, totalPrice: Number, 
    address: { type: String, required: true }, 
    status: { type: String, default: "Pending Payment" },
    paymentIntentId: String, 
    date: { type: Date, default: Date.now } 
}));

app.get('/api/admin/orders', async (req, res) => {
    try {
        const allOrders = await Order.find({}).sort({ date: -1 }); 
        res.json(allOrders);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(updatedOrder);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/orders/:id/request-refund', async (req, res) => {
    try {
        await Order.findByIdAndUpdate(req.params.id, { status: "Refund Requested" });
        res.json({ message: "Refund request sent to admin" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/orders/:id/approve-refund', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order.paymentIntentId) return res.status(400).json({ error: "No payment record found." });

        await stripe.refunds.create({ payment_intent: order.paymentIntentId });
        
        order.status = "Refunded ✅";
        await order.save();
        res.json({ message: "Refund processed successfully via Stripe!" });
    } catch (err) { res.status(500).json({ error: "Stripe Refund Failed: " + err.message }); }
});

app.get('/api/products', async (req, res) => { res.json(await Product.find({})); });
app.post('/api/products', async (req, res) => { const p = new Product(req.body); await p.save(); res.json(p); });
app.delete('/api/products/:id', async (req, res) => { await Product.findByIdAndDelete(req.params.id); res.json({msg: "Deleted"}); });
app.get('/api/products/:id', async (req, res) => { 
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: "Product not found" });
        res.json(product);
    } catch (err) { res.status(400).json({ error: "Invalid ID format" }); }
});
app.get('/api/orders/:userName', async (req, res) => { res.json(await Order.find({ customerName: req.params.userName })); });
app.put('/api/products/:id/stock', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, { stock: req.body.stock }, { new: true });
        res.json(updatedProduct);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ✅ 3. SECURE REGISTER (BCRYPT HASHING)
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return res.status(400).json({ message: "Invalid email format!" });
        if (password.length < 6) return res.status(400).json({ message: "Password too weak!" });
        if (await User.findOne({ email })) return res.status(400).json({ message: "User exists" });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await new User({ name, email, password: hashedPassword }).save();
        res.json({ message: "Registered Successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ✅ 4. SECURE LOGIN (BCRYPT COMPARE & JWT)
app.post('/api/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        
        if (user && await bcrypt.compare(req.body.password, user.password)) {
            const token = jwt.sign(
                { id: user._id, isAdmin: user.isAdmin }, 
                JWT_SECRET, 
                { expiresIn: '1d' }
            );
            res.json({ token, user: { name: user.name, email: user.email, isAdmin: user.isAdmin } });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { items, customerName, address } = req.body; 
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
        const newOrder = new Order({ customerName, items, totalPrice, address, status: "Pending Payment" });
        await newOrder.save();

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            metadata: { 
                orderId: newOrder._id.toString(),
                items: JSON.stringify(items.map(i => ({ _id: i._id, quantity: i.quantity || 1, name: i.name })))
            },
            success_url: `https://tech-store-full-stack.vercel.app/dashboard?success=true`,
            cancel_url: `https://tech-store-full-stack.vercel.app/cart?canceled=true`,
        });
        res.json({ url: session.url });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5006;
app.listen(PORT, () => console.log(`>>> SERVER RUNNING ON PORT ${PORT} <<<`));