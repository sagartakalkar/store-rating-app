# StoreRate - Full-Stack Store Rating Web Application

A complete, production-ready full-stack web application for discovering stores and submitting ratings, featuring dedicated role-based authorization for **Administrators**, **Store Owners**, and **Normal Users**.

Built with a **React (Material UI)** frontend and an **Express.js (Node.js)** backend powered by a **PostgreSQL** relational database with strict validation, foreign key constraints, indexes, and parameterized SQL queries.

---

## Table of Contents

1. [Features Overview](#features-overview)
2. [Technology Stack](#technology-stack)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Input Validation Rules](#input-validation-rules)
5. [Database Schema & Design](#database-schema--design)
6. [Project Structure](#project-structure)
7. [Demo Accounts & Credentials](#demo-accounts--credentials)
8. [Installation & Setup](#installation--setup)
9. [Running the Application](#running-the-application)
10. [REST API Documentation](#rest-api-documentation)
11. [Screenshots Placeholder](#screenshots)

---

## Features Overview

### Authentication & Authorization
- **Unified Login**: A common, intuitive sign-in screen for all three roles (`ADMIN`, `USER`, `OWNER`).
- **Role-Based Redirection**: Users are automatically redirected to their specific portal upon login.
- **JWT Security**: Access tokens are generated upon login/registration and securely stored client-side.
- **Axios Interceptors**: Automatically injects `Authorization: Bearer <token>` into all outgoing API requests and intercepts unauthorized responses.
- **Password Security**: Strong hashing with `bcryptjs` (salt rounds: 10).
- **Change Password**: Self-service password change with strict validation and old-password verification.

### Administrator Features
- **Interactive Dashboard**:
  - Live counts for **Total Users**, **Total Stores**, and **Total Ratings**.
  - Role distribution breakdown chart/metrics.
  - Top 5 highest-rated stores leaderboard.
- **User Management**:
  - Add normal users, admin users, and store owners.
  - View all registered users with ID, Name, Email, Address, and Role.
  - **Store Owner Rating Integration**: If the user is a Store Owner, dynamically displays the average rating and review count of their store.
  - Filter users by Role (`ADMIN`, `USER`, `OWNER`, `ALL`).
  - Search users by Name, Email, or Address.
  - Sort users ascending/descending by predefined safe columns.
  - View detailed user profile (`/admin/users/:id`), including their owned stores or rating history.
- **Store Management**:
  - Register new stores (Name, Contact Email, Physical Address, Assigned Owner).
  - Search stores by Name, Email, or Address.
  - Sort stores by Name, Overall Rating, Date Added, etc.
  - Dynamic store average rating calculated via SQL `AVG()`.

### Normal User Features
- **User Registration**:
  - Form fields: Name (20-60 characters), Email, Address (up to 400 characters), Password, and Confirm Password.
  - Live requirement checklist (length, uppercase, special character, match).
- **Store Discovery**:
  - Search stores simultaneously by **Name** and **Address**.
  - Sort stores by name, average rating, popularity, and creation date.
- **Rating & Reviews**:
  - Interactive 5-star rating interface (1 = Poor, 2 = Fair, 3 = Good, 4 = Very Good, 5 = Excellent).
  - Single-rating constraint per store per user.
  - If a user has already rated a store, they can seamlessly **Modify** their rating.
- **Personal Dashboard**:
  - Overview of all stores rated by the user with their submitted score vs. community average.
  - Personal stats: total stores reviewed and average score awarded.

### Store Owner Features
- **Store Owner Dashboard**:
  - Primary store name, location, and contact information.
  - Live average rating calculated across customer reviews.
  - Total number of customer ratings received.
  - Detailed table of all customer ratings: Customer Name, Customer Email, Rating Score (Stars), and Review Date.
  - Polished empty-state messaging if no ratings or stores are yet attached.

---

## Technology Stack

### Frontend
- **React 19** & **Vite**: Ultra-fast build and reactive user experience.
- **Material UI (MUI v7)** & **Emotion**: Cohesive, responsive enterprise design system.
- **React Router DOM v7**: Client-side routing with role-based route guards (`RoleProtectedRoute`, `ProtectedRoute`).
- **Axios**: HTTP client configured with request & response interceptors.
- **Lucide Icons & MUI Icons**: Visual iconography.

### Backend
- **Node.js** & **Express.js**: Clean RESTful architecture.
- **JWT (JSON Web Tokens)**: Stateless token authentication.
- **bcryptjs**: Secure one-way cryptographic password hashing.
- **Express-Validator**: Dual-layer input validation and sanitization.
- **CORS**: Cross-origin request control.

### Database
- **PostgreSQL**: Relational storage with relational integrity.
- **Parameterized SQL Queries**: Complete protection against SQL injection (`$1, $2, ...`).
- **Relational Constraints**: `UNIQUE(user_id, store_id)` for ratings, `CHECK(rating >= 1 AND rating <= 5)`, foreign key cascades.
- **Performance Indexes**: B-tree indexes on `email`, `role`, `name`, `owner_id`, `store_id`, `user_id`.
- **In-Memory PostgreSQL Fallback**: Integrated `pg-mem` engine for seamless local previewing and zero-configuration testing.

---

## User Roles & Permissions

| Role | Permitted Actions | Default Landing Page |
|---|---|---|
| **ADMIN** | View platform analytics, manage/add all users, manage/add stores, inspect user profiles & store metrics | `/admin/dashboard` |
| **USER** | Browse stores, search by name/address, submit 1–5 star ratings, modify existing ratings, view personal review history | `/user/dashboard` |
| **OWNER** | View store analytics, monitor customer reviews & ratings breakdown, change password | `/owner/dashboard` |

---

## Input Validation Rules

Strictly enforced on both the client (MUI form states) and server (`express-validator`):

| Field | Rule | Error Message |
|---|---|---|
| **Name** | Min 20 characters, Max 60 characters | "Name must be between 20 and 60 characters" |
| **Address** | Maximum 400 characters | "Address cannot exceed 400 characters" |
| **Password** | 8 to 16 characters, at least 1 uppercase letter (`A-Z`), at least 1 special character | "Password must be 8-16 chars, contain 1 uppercase letter and 1 special char" |
| **Email** | Valid RFC-compliant email, must be unique across `users` table | "Please provide a valid unique email address" |
| **Rating** | Integer from 1 to 5 only | "Rating must be an integer between 1 and 5" |

---

## Database Schema & Design

```sql
-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(400),
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'USER', 'OWNER')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Stores Table
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address VARCHAR(400) NOT NULL,
    owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Ratings Table
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_store_rating UNIQUE (user_id, store_id)
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_name ON users(name);
CREATE INDEX idx_stores_name ON stores(name);
CREATE INDEX idx_stores_email ON stores(email);
CREATE INDEX idx_stores_owner_id ON stores(owner_id);
CREATE INDEX idx_ratings_store_id ON ratings(store_id);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);
```

> **Calculation Note**: Average store rating is **never** stored directly in the `stores` table. It is dynamically computed using SQL aggregate `ROUND(AVG(rating)::numeric, 1)` and `COUNT(r.id)` on demand.

---

## Project Structure

```
fullstack-rating-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # PostgreSQL connection pool & initialization
│   │   ├── controllers/
│   │   │   ├── authController.js     # Register, Login, Change Password, Me
│   │   │   ├── adminController.js    # Metrics, User & Store CRUD, Store-Owner ratings
│   │   │   ├── storeController.js    # Store listing with search, sort, & rating aggregates
│   │   │   ├── ratingController.js   # Submit rating (UPSERT), Modify rating
│   │   │   └── ownerController.js    # Store Owner dashboard & customer ratings list
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT Bearer token authentication
│   │   │   ├── roleMiddleware.js     # Role verification (ADMIN, USER, OWNER)
│   │   │   └── errorMiddleware.js    # Centralized REST error handler
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   ├── storeRoutes.js
│   │   │   ├── ratingRoutes.js
│   │   │   └── ownerRoutes.js
│   │   ├── utils/
│   │   │   └── validators.js         # Express-validator schemas
│   │   └── server.js                 # Express application entry
│   ├── schema.sql                    # PostgreSQL DDL schema & indexes
│   ├── seed.js                       # Database seeding script with demo records
│   ├── .env.example                  # Environment configuration template
│   └── package.json                  # Backend dependencies & scripts
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConfirmDialog.jsx     # Action confirmation modal
│   │   │   ├── DataTable.jsx         # Sortable, responsive table
│   │   │   ├── ErrorMessage.jsx      # Error alert banner
│   │   │   ├── LoadingSpinner.jsx    # Centered progress indicator
│   │   │   ├── Navbar.jsx            # Responsive navigation & role badge
│   │   │   ├── Pagination.jsx        # Data pagination component
│   │   │   ├── ProtectedRoute.jsx    # Authentication route guard
│   │   │   ├── RatingStars.jsx       # 1-5 Star interactive & read-only rating
│   │   │   ├── RoleProtectedRoute.jsx# Role-based route guard
│   │   │   ├── SearchBar.jsx         # Debounced search input
│   │   │   └── Sidebar.jsx           # Admin navigation sidebar
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Global authentication state & actions
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx    # Admin platform metrics & charts
│   │   │   ├── AdminStores.jsx       # Store management & creation
│   │   │   ├── AdminUserDetails.jsx  # Detailed user inspect view
│   │   │   ├── AdminUsers.jsx        # User management with role & store rating
│   │   │   ├── ChangePassword.jsx    # Password change view
│   │   │   ├── Login.jsx             # Unified sign-in portal + quick login
│   │   │   ├── OwnerDashboard.jsx    # Merchant portal & customer review log
│   │   │   ├── Register.jsx          # User registration view
│   │   │   ├── UserDashboard.jsx     # Normal user review history & metrics
│   │   │   └── UserStores.jsx        # Store directory & rating submission
│   │   ├── services/
│   │   │   └── api.js                # Axios instance with interceptors
│   │   ├── App.jsx                   # React Router routing tree & MUI theme
│   │   ├── main.jsx                  # React DOM root entry
│   │   └── index.css                 # Base styling
│   ├── index.html                    # HTML entry template
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## Demo Accounts & Credentials

The seed script pre-populates demo accounts conforming to all validation rules:

| Role | Email Address | Password | Character Count Verification |
|---|---|---|---|
| **ADMIN** | `admin@example.com` | `Admin@123` | Name: *Alexander Michael Davis* (23 chars) |
| **STORE OWNER** | `owner@example.com` | `Owner@123` | Name: *Sarah Jessica Montgomery* (24 chars) |
| **NORMAL USER** | `user@example.com` | `User@123` | Name: *Robert Jonathan Sterling* (24 chars) |
| **NORMAL USER 2** | `user2@example.com` | `User2@123` | Name: *Eleanor Beatrice Vance* (22 chars) |
| **STORE OWNER 2** | `owner2@example.com` | `Owner2@123` | Name: *Christopher Daniel Hayes* (24 chars) |

---

## Installation & Setup

### Prerequisites
- **Node.js** (v18.0 or higher)
- **PostgreSQL** (v14 or higher) - *optional: in-memory PostgreSQL emulator is automatically used if no database URL is set*

### 1. Database Creation (PostgreSQL)

If using a local or Cloud PostgreSQL instance:

```bash
# Connect to your PostgreSQL server
psql -U postgres

# Create the database
CREATE DATABASE storeratedb;

# Exit psql
\q
```

Initialize the database schema:

```bash
psql -U postgres -d storeratedb -f backend/schema.sql
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your PostgreSQL credentials (optional)
# DATABASE_URL="postgresql://postgres:password@localhost:5432/storeratedb"

# Seed initial demo accounts, stores, and ratings
npm run seed
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

---

## Running the Application

### Option A: Running in AI Studio / Unified Full-Stack Mode
In this workspace, the backend and frontend are pre-configured to run together on port 3000:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the application.

### Option B: Running Standalone Backend & Frontend Separately

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
# Server will run on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# Client will run on http://localhost:5173
```

---

## REST API Documentation

All responses follow a consistent format:
```json
{
  "success": true,
  "message": "Operation description",
  "data": {}
}
```

### Authentication Endpoints
- `POST /api/auth/register` — Register a normal user account.
- `POST /api/auth/login` — Login with email and password, receives JWT token.
- `PUT /api/auth/change-password` *(Protected)* — Change current password.
- `GET /api/auth/me` *(Protected)* — Retrieve currently authenticated user profile.

### Admin Endpoints *(Requires ADMIN role)*
- `GET /api/admin/dashboard` — Platform totals (users, stores, ratings) and top stores.
- `GET /api/admin/users` — Paginated, searchable user listing with owner ratings.
  - Query params: `?name=...&role=USER&sortBy=name&order=asc&page=1&limit=15`
- `POST /api/admin/users` — Create any user (`USER`, `ADMIN`, `OWNER`).
- `GET /api/admin/users/:id` — Detailed user inspect (owned stores or submitted ratings).
- `GET /api/admin/stores` — Paginated, searchable store listing.
- `POST /api/admin/stores` — Create a new store and assign owner.

### Store Discovery Endpoints
- `GET /api/stores` — Public/authenticated store listing.
  - Query params: `?name=apex&address=san+jose&sortBy=average_rating&order=desc`
- `GET /api/stores/:id` — Store details with rating score breakdown.

### Ratings Endpoints *(Requires authentication)*
- `POST /api/ratings` — Submit a rating (1 to 5 stars). Automatically updates if rating already exists.
- `PUT /api/ratings/:id` — Modify an existing rating.
- `GET /api/ratings/store/:storeId` — Public view of reviews for a store.

### Store Owner Endpoints *(Requires OWNER role)*
- `GET /api/owner/dashboard` — Store metrics, overall rating, and review log.
- `GET /api/owner/ratings` — Filterable customer rating submissions.

---

## Screenshots

*(Place application preview screenshots here)*

- **Login Screen**: Unified portal with quick-login buttons for Admin, User, and Owner.
- **Admin Dashboard**: Analytics cards, user distribution, and store ratings.
- **Store Directory**: Interactive 1–5 star rating submission and search by Name and Address.
- **Owner Dashboard**: Store review telemetry and customer feedback records.

---

## License

This project is licensed under the Apache-2.0 License.
