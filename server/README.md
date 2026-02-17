# ShopSphere Backend

This is the secure backend for ShopSphere Hub, implemented with Node.js, Express, MongoDB, and JWT.

## Setup

1. Navigate to the `server` directory:

   ```sh
   cd server
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Configure environment variables in `.env`:
   - `PORT=5000`
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Secret key for JWT signing
   - `RAZORPAY_KEY_ID`: Your Razorpay Key ID
   - `RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret

4. Start the server:
   ```sh
   npm run dev
   ```

## Admin Access

- The Admin Console is located at `/admin`.
- Non-admin users are automatically blocked and redirected to the home page.
- Admin APIs are protected by JWT and role-based access control (RBAC).

## Features

- **Auth**: JWT based register/login with hashed passwords.
- **Admin**: Dashboard stats, order tracking, product management, and banner updates.
- **Payments**: Razorpay integration (order creation and verification).
- **Notifications**: Backend-triggered order confirmations.
