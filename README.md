# Skye - POS & Order Management

Skye is a point-of-sale and order-management app built around one workflow:
cashier creates an order → payment is confirmed → order enters the To-Do
List → an employee prepares and completes it → it appears in Sales History.

## Stack

Next.js (App Router) · TypeScript · React · Tailwind CSS · Firebase
Authentication · Cloud Firestore.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in your Firebase Web SDK config
npm run dev
```

Open http://localhost:3000.

### Firebase project setup

1. Create a Firebase project and register a Web App; copy the config values
   into `.env.local`.
2. Enable **Authentication → Email/Password**.
3. Enable **Cloud Firestore**.
4. Deploy the security rules and indexes in this repo:
   ```bash
   npm install -g firebase-tools   # if you don't have it
   firebase login
   firebase use --add               # select your project
   firebase deploy --only firestore
   ```
5. Create your first account by signing up through the app, then manually
   promote that user's `role` field to `ADMIN` directly in the Firestore
   console (self-signup always defaults to `CASHIER` - see
   `firestore.rules`). From there, use the Users screen to manage everyone
   else.
6. Add products from the Products screen before using the Cashier screen.

## Architecture

```
src/
├── app/            # Next.js routes (one folder per screen)
├── components/     # Presentational + screen-specific UI, grouped by module
├── features/       # React hooks that wire a screen to a service (state only)
├── services/       # All Firestore/Auth reads & writes; no UI code here
├── lib/
│   ├── firebase/   # Client SDK init + collection name constants
│   └── utils/      # Currency/time/order-number helpers (pure functions)
├── types/          # Shared Order / Product / User types and role constants
└── context/        # AuthContext (Firebase Auth + Firestore role profile)
```

### Data model

There is a single `orders` collection. The To-Do List and Sales History are
both **filtered views** over it (`status in [PENDING, PREPARING]` vs.
`status == COMPLETED`) - an order is never duplicated across collections.
See `firestore.rules` for the full data-integrity and authorization
contract enforced at the database layer (not just in the UI).

Order items store a snapshot of `productId / name / unitPrice / quantity /
subtotal` at the time of purchase, so historical sales are unaffected by
later product-price changes.

### Roles

`CASHIER` creates orders · `EMPLOYEE` starts/completes them ·
`MANAGER`/`ADMIN` additionally manage products, users, and view Sales
History. Frontend checks (`ProtectedRoute`, nav visibility) are for UX only;
the actual boundary is `firestore.rules`.

### Order urgency

Urgency (`Normal` → `Attention` → `Urgent` → `Critical`) is computed on the
client from the stored `createdAt` timestamp on every render/tick - it is
never persisted as a string, and Firestore is never rewritten just to keep
a displayed duration current.
