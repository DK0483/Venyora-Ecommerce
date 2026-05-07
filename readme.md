# 🛍️ VENYORA — Fashion E-Commerce Platform

> A full-stack fashion e-commerce web application built with Node.js, Express and vanilla JavaScript.

![VENYORA Banner](./banner.png)

---

## 🌐 Live Demo

🔗 **Frontend:** []()  
🔗 **Backend API:** _(Render deployment URL)_

---

## ✨ Features

### 🛒 Shopping

- Browse full product catalogue with **search, filters & sorting**
- Filter by category, price range (min/max), newest first
- Paginated product listing (12 per page)
- Detailed product pages with size selection

### 👤 User Authentication

- Secure signup & login with **JWT tokens**
- Role-based access (User / Admin)
- Profile management (name, email, gender, mobile, age)

### 🛍️ Cart & Orders

- Add to cart, update quantities, remove items
- Save multiple shipping addresses
- Place orders with real-time **stock validation**
- Order history & status tracking
- Cancel orders (auto-restocks inventory)

### 💳 Payments

- **Cash on Delivery**
- **Online Payment via Razorpay** (Credit/Debit Card, UPI, Netbanking, Wallets)
- Secure payment signature verification
- Auto order confirmation after successful payment

### ❤️ Wishlist

- Add/remove products from wishlist
- Persistent wishlist saved to database per user

### ⭐ Reviews & Ratings

- Submit star ratings and written reviews
- Average rating displayed on product pages
- Delete your own reviews
- Only verified purchasers can review

### 🔧 Admin Panel

- Manage products (add, edit, delete)
- View and update order statuses
- Manage users
- Dashboard with key metrics

### 📬 Contact

- Contact form with subject categories
- Messages saved to database

---

## 🏗️ Tech Stack

### Frontend

| Technology           | Usage                  |
| -------------------- | ---------------------- |
| HTML5 / CSS3         | Structure & styling    |
| Vanilla JavaScript   | Dynamic UI & API calls |
| Remix Icons          | Icon library           |
| Google Fonts         | Typography             |
| Razorpay Checkout.js | Payment UI             |

### Backend

| Technology    | Usage                 |
| ------------- | --------------------- |
| Node.js       | Runtime environment   |
| Express.js    | Web framework         |
| MongoDB Atlas | Cloud database        |
| Mongoose      | ODM for MongoDB       |
| JWT           | Authentication        |
| bcryptjs      | Password hashing      |
| Razorpay SDK  | Payment gateway       |
| CORS          | Cross-origin requests |
| dotenv        | Environment variables |

---

## 📁 Project Structure

```
Venyora-Ecommerce/
├── backend/
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verification
│   │   └── adminMiddleware.js     # Admin role check
│   ├── models/
│   │   ├── user.js                # User schema
│   │   ├── product.js             # Product schema
│   │   ├── cart.js                # Cart schema
│   │   ├── order.js               # Order schema
│   │   ├── wishlist.js            # Wishlist schema
│   │   ├── review.js              # Review schema
│   │   ├── address.js             # Address schema
│   │   └── message.js             # Contact message schema
│   ├── routes/
│   │   ├── auth.js                # Signup, login
│   │   ├── productRoutes.js       # Products CRUD + search
│   │   ├── cartRoutes.js          # Cart management
│   │   ├── orderRoutes.js         # Orders (COD)
│   │   ├── paymentRoutes.js       # Razorpay integration
│   │   ├── wishlistRoutes.js      # Wishlist toggle
│   │   ├── reviewRoutes.js        # Product reviews
│   │   ├── addressRoutes.js       # Saved addresses
│   │   ├── messageRoutes.js       # Contact form
│   │   ├── adminProductRoutes.js  # Admin product mgmt
│   │   ├── adminOrderRoutes.js    # Admin order mgmt
│   │   ├── adminDashboardRoutes.js# Admin dashboard
│   │   └── adminUserRoutes.js     # Admin user mgmt
│   ├── .env                       # ⚠️ Not committed
│   ├── .gitignore
│   ├── package.json
│   └── server.js                  # Entry point
│
└── Frontend/
    ├── admin/                     # Admin panel pages
    ├── index.html                 # Home page
    ├── catalogue.html             # Product listing
    ├── product-cora.html          # Product detail
    ├── cart.html                  # Shopping cart
    ├── checkout.html              # Checkout + payment
    ├── confirmation.html          # Order confirmation
    ├── profile.html               # User profile
    ├── signup.html                # Auth page
    ├── contact.html               # Contact form
    ├── main.js                    # Shared JS logic
    └── style.css                  # Global styles
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- Razorpay account (for payments)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/venyora-Ecommerce.git
cd VENYORA-ECOMMERCE-MAIN
```

**2. Install backend dependencies**

```bash
cd backend
npm install
```

**3. Create `.env` file in `/backend`**

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5500
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

**4. Start the backend server**

```bash
npm start
# or with nodemon
nodemon server.js
```

**5. Open the frontend**

- Open `Frontend/index.html` with **Live Server** in VS Code
- Or visit `http://127.0.0.1:5500/Frontend/index.html`

---

## 🔑 Environment Variables

| Variable              | Description                         |
| --------------------- | ----------------------------------- |
| `PORT`                | Backend server port (default: 5000) |
| `MONGO_URI`           | MongoDB Atlas connection string     |
| `JWT_SECRET`          | Secret key for JWT signing          |
| `FRONTEND_URL`        | Frontend URL for CORS (production)  |
| `RAZORPAY_KEY_ID`     | Razorpay API Key ID                 |
| `RAZORPAY_KEY_SECRET` | Razorpay API Key Secret             |

---

## 📡 API Endpoints

### Auth

| Method | Endpoint           | Description        |
| ------ | ------------------ | ------------------ |
| POST   | `/api/auth/signup` | Register new user  |
| POST   | `/api/auth/login`  | Login user         |
| GET    | `/api/auth/user`   | Get logged-in user |

### Products

| Method | Endpoint            | Description                                       |
| ------ | ------------------- | ------------------------------------------------- |
| GET    | `/api/products`     | Get all products (search, filter, sort, paginate) |
| GET    | `/api/products/:id` | Get single product                                |
| POST   | `/api/products`     | Create product (Admin)                            |
| PUT    | `/api/products/:id` | Update product (Admin)                            |
| DELETE | `/api/products/:id` | Delete product (Admin)                            |

### Orders & Payment

| Method | Endpoint                    | Description               |
| ------ | --------------------------- | ------------------------- |
| POST   | `/api/orders`               | Place COD order           |
| GET    | `/api/orders/my-orders`     | Get user orders           |
| PUT    | `/api/orders/cancel/:id`    | Cancel order              |
| POST   | `/api/payment/create-order` | Create Razorpay order     |
| POST   | `/api/payment/verify`       | Verify & place paid order |

### Wishlist & Reviews

| Method | Endpoint                  | Description              |
| ------ | ------------------------- | ------------------------ |
| GET    | `/api/wishlist`           | Get user wishlist        |
| POST   | `/api/wishlist/toggle`    | Add/remove from wishlist |
| GET    | `/api/reviews/:productId` | Get product reviews      |
| POST   | `/api/reviews/:productId` | Submit review            |
| DELETE | `/api/reviews/:reviewId`  | Delete own review        |

---

## 🔒 Security

- Passwords hashed with **bcryptjs**
- Auth protected with **JWT Bearer tokens**
- Razorpay payments verified with **HMAC SHA256 signature**
- Admin routes protected with role middleware
- `.env` excluded from version control

---

## 🛣️ Roadmap

- [x] Product search & filters
- [x] Wishlist
- [x] Reviews & ratings
- [x] Razorpay payment integration
- [x] Stock management
- [ ] Email notifications (Nodemailer)
- [ ] Coupon / discount codes
- [ ] Image upload (Cloudinary)
- [ ] Order tracking timeline
- [ ] PWA support

---
