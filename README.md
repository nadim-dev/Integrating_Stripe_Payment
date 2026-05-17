# Course Checkout Platform With Stripe

A full-stack course purchase application built with React, Express, MongoDB, and Stripe Checkout. The app provides a complete checkout flow: users can browse available courses, submit buyer details, complete payment through Stripe Embedded Checkout, and return to a dedicated payment result page where the purchase is verified and recorded.

This project demonstrates a real payment integration pattern with a separated frontend and backend, secure Stripe session creation on the server, MongoDB-backed course/session storage, and client-side routing for checkout and payment confirmation.

## Highlights

- Full-stack React and Node.js payment integration
- Stripe Embedded Checkout powered by server-created checkout sessions
- MongoDB persistence for courses, checkout sessions, and successful purchases
- Payment verification after Stripe redirects back to the application
- Dedicated success/error result page after purchase completion

## Features

- **Course Catalog:** Fetches course data from the backend and displays it in a responsive card grid.
- **Checkout Modal:** Collects the buyer's name and Indian mobile number before starting payment.
- **Input Validation:** Prevents checkout until required buyer details are valid.
- **Stripe Session Creation:** Creates checkout sessions from the Express backend using the Stripe Node SDK.
- **Embedded Payment Page:** Renders Stripe Embedded Checkout inside the React checkout route.
- **Payment Return Flow:** Redirects users back to `/payment-success` after payment completion.
- **Payment Verification:** Confirms payment status by retrieving the Stripe Checkout Session on the backend.
- **Purchase Storage:** Saves successful purchases in MongoDB with course ID, session ID, amount paid, and access expiry.
- **Routing:** Uses React Router for home, checkout, and payment result pages.

## Tech Stack

**Frontend**

- React 19
- Vite
- React Router
- Tailwind CSS
- Stripe React SDK

**Backend**

- Node.js
- Express
- MongoDB with Mongoose
- Stripe Node SDK
- CORS

## Project Structure

```txt
.
|-- backend
|   |-- app.js
|   |-- config
|   |   `-- mongoose.js
|   |-- models
|   |   |-- coursesModal.js
|   |   |-- purchasedCourseModal.js
|   |   `-- sessionModel.js
|   `-- package.json
|-- frontend
|   |-- src
|   |   |-- App.jsx
|   |   |-- home.jsx
|   |   |-- CourseCard.jsx
|   |   |-- CheckoutModal.jsx
|   |   |-- checkoutPage.jsx
|   |   `-- payment_success.jsx
|   `-- package.json
`-- README.md
```

## Environment Variables

Create `backend/.env`:

```env
DB_URL=your_mongodb_connection_string
stripe_secret_key=sk_test_your_stripe_secret_key
```

Create `frontend/.env`:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

Do not commit `.env` files to Git.

## Installation

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

## Running The App

Start the backend:

```bash
cd backend
npm run dev
```

The backend runs on:

```txt
http://localhost:4000
```

Start the frontend:

```bash
cd frontend
npm run dev
```

The frontend runs on:

```txt
http://localhost:5173
```

## Main Routes

Frontend routes:

```txt
/                 Course listing page
/checkout          Stripe Embedded Checkout page
/payment-success   Payment verification/result page
```

Backend routes:

```txt
GET  /                         Fetch all courses
POST /create-checkout-session  Create Stripe Checkout Session
POST /verify-payment           Verify Stripe payment after redirect
```

## Payment Flow

1. User opens the course listing page.
2. User clicks **Buy Now** on a course.
3. Checkout modal opens and asks for name and mobile number.
4. After validation, the app navigates to `/checkout`.
5. Frontend calls `POST /create-checkout-session`.
6. Backend creates a Stripe Checkout Session and returns `clientSecret`.
7. React renders Stripe Embedded Checkout.
8. After payment, Stripe redirects to:

```txt
http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}
```

9. Payment success page calls `POST /verify-payment`.
10. Backend retrieves the Stripe session and checks `payment_status`.
11. If paid, the backend updates the session and creates a purchased course record.
12. Frontend shows the final success page.

## MongoDB Models

### Course

Stores course data:

- `name`
- `price`
- `image`

### Session

Stores checkout session data:

- `sessionId`
- `userName`
- `userMobile`
- `paymentStatus`
- `courseId`
- `expiresAt`
- `client_secret`

### PurchasedCourse

Stores successful purchases:

- `courseId`
- `sessionId`
- `amountPaid`
- `purchasedAt`
- `accessExpiresAt`

## Stripe Notes

The current frontend uses Stripe Embedded Checkout, so the backend should create sessions with embedded checkout mode:

```js
ui_mode: "embedded"
```

and should return:

```js
{ clientSecret: newcheckoutSession.client_secret }
```

If you want Stripe's fully hosted checkout page instead, remove `ui_mode`, use `success_url` and `cancel_url`, return `newcheckoutSession.url`, and redirect the browser to that URL.

## Useful Commands

Frontend lint:

```bash
cd frontend
npm run lint
```

Frontend build:

```bash
cd frontend
npm run build
```

Backend dev:

```bash
cd backend
npm run dev
```

## Important Reminder

In `backend/app.js`, Stripe Embedded Checkout expects:

```js
ui_mode: "embedded"
```

If it is written as `embedded_page`, Stripe checkout may not open correctly.
