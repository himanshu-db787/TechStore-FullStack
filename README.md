# 🛒 TechStore: Full-Stack E-Commerce Platform

**Developer:** Himanshu Das Biswas
**Roll Number:** 23052394
**Section:** CSE-9
**Course:** Software Engineering (CS31001)
**Institution:** KIIT Deemed to be University

---

## 📝 Project Overview
TechStore is a professional **Decoupled MERN Stack** application designed for a high-performance retail experience. By separating the React.js frontend from the Node.js/Express backend, the application ensures superior scalability and a smooth Single Page Application (SPA) experience. The platform handles dynamic product listings, secure user sessions, and inventory-protected shopping cart logic.

## 🛠️ Technology Stack
* **Frontend:** React.js (Hooks, Functional Components, React Router)
* **Backend:** Node.js & Express.js (REST API Architecture)
* **Database:** MongoDB Atlas (NoSQL Cloud Storage)
* **Payment Gateway:** Stripe API (Secure Checkout Integration)
* **State Management:** HTML5 Local Storage & React State Hooks
* **Deployment:** Vercel (Frontend) & Render (Backend)

## 📁 Project Structure (Monorepo)
This repository follows a centralized **Monorepo** structure for efficient version control:
```text
ecommerce-final/
├── backend/            # Express API, Mongoose Models, & Seed Scripts
│   ├── models/         # Database Schemas (Users, Products)
│   ├── seed.js         # Script to populate 50+ products
│   └── server.js       # Main entry point for the Node server
├── frontend/           # React.js Application
│   ├── src/            # UI Components (Home, Cart, ProductDetails, etc.)
│   └── public/         # Static Assets
├── .gitignore          # Root-level ignore rules for node_modules and .env
└── README.md           # Master Documentation