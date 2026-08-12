# Skye Application - Claude Code Instructions

## 1. Project Overview

You are developing **Skye**, a Point-of-Sale (POS) and order management application.

Skye is designed around the following workflow:

1. A cashier creates an order.
2. The cashier adds all requested products/items.
3. The system calculates the total amount.
4. The cashier enters the amount received from the customer.
5. The system automatically calculates the customer's change.
6. After payment is confirmed, the order is placed into the To-Do List.
7. The To-Do List displays orders that still need to be prepared/served.
8. Orders become increasingly urgent based on how long they have been waiting.
9. Once an order has been prepared and served, an authorized user can mark the order as completed.
10. Completed orders appear in Sales History.
11. Sales History contains the order timeline and all items purchased.

The application must prioritize correctness, maintainability, simplicity, security, and a clean user experience.

---

# 2. Core Technology

Use the project's existing technology stack.

Primary technologies:

- Next.js
- TypeScript
- React
- Tailwind CSS
- Firebase
- Cloud Firestore
- Firebase Authentication

Do not introduce another major framework, database, authentication system, or state-management library unless there is a clear technical reason and it is discussed first.

Before adding dependencies, check whether the existing project already provides an appropriate solution.

---

# 3. Core Application Modules

The application should be organized around these primary modules:

- Dashboard
- Cashier / POS
- To-Do List
- Sales History
- Products
- Users / Employees

Future functionality may be added, but do not implement features that have not been requested.

---

# 4. Core Business Workflow

The primary workflow is:

CASHIER
    ↓
CREATE ORDER
    ↓
ADD ITEMS
    ↓
CALCULATE TOTAL
    ↓
ENTER CUSTOMER PAYMENT
    ↓
CALCULATE CHANGE
    ↓
CONFIRM PAYMENT
    ↓
ORDER STATUS = PENDING
    ↓
TO-DO LIST
    ↓
PREPARING
    ↓
ORDER SERVED
    ↓
COMPLETE ORDER
    ↓
ORDER STATUS = COMPLETED
    ↓
SALES HISTORY

The implementation must preserve this workflow.

---

# 5. Cashier / POS Requirements

The cashier interface must allow the cashier to:

- Browse/select products.
- Add products to an order.
- Increase or decrease quantities.
- Remove items.
- View the current order/cart.
- View item prices.
- View item quantities.
- View item subtotals.
- View the total order amount.
- Enter the amount received from the customer.
- Automatically calculate the change.
- Confirm the transaction.

Example:

    Cheese Burger × 2
    ₱85 × 2 = ₱170

    French Fries × 1
    ₱50 × 1 = ₱50

    --------------------
    TOTAL       ₱220

    CASH        ₱500

    CHANGE      ₱280

The cashier must not be able to confirm a cash transaction when:

    amountReceived < total

Display an appropriate insufficient-payment message.

Do not allow invalid quantities, negative prices, negative payment values, or other invalid monetary values.

---

# 6. Order Creation

When the cashier confirms a valid transaction:

1. Create an order record.
2. Store the purchased items.
3. Store the calculated totals.
4. Store the payment information.
5. Store the cashier who created the order.
6. Store the creation timestamp.
7. Set the initial order status to `PENDING`.

The order must then become visible in the To-Do List.

---

# 7. Order Status

Use explicit order statuses.

The primary lifecycle is:

    PENDING → PREPARING → COMPLETED

### PENDING

The order has been paid for and is waiting to be prepared.

### PREPARING

An employee has started preparing the order.

### COMPLETED

The order has been prepared and served to the customer.

Do not use arbitrary strings throughout the application.

Centralize order statuses using TypeScript types/constants/enums where appropriate.

Example:

    type OrderStatus =
      | "PENDING"
      | "PREPARING"
      | "COMPLETED";

Do not introduce additional statuses unless the application requirements require them.

---

# 8. To-Do List

The To-Do List is the operational queue for unfinished orders.

It should display orders that have not yet been completed.

The To-Do List should provide enough information for an employee to understand what needs to be prepared.

An order card should be able to display:

- Order number
- Items
- Quantity
- Status
- Order creation time
- How long the order has been waiting
- Appropriate urgency indication
- Relevant actions

Example:

    ORDER #001

    2 × Cheese Burger
    1 × French Fries

    Total: ₱220

    Waiting: 4 minutes

    Status: PREPARING

    [Complete Order]

---

# 9. Order Urgency

Order urgency is based on how long the order has been waiting.

Do NOT store values such as:

    "3 minutes ago"
    "8 minutes ago"
    "10 minutes ago"

as permanent database values.

Instead, store the actual order creation timestamp:

    createdAt

The application should calculate the elapsed time dynamically:

    currentTime - createdAt

Use the following initial urgency rules:

- 0–3 minutes: Normal
- 3–5 minutes: Attention
- 5–10 minutes: Urgent
- 10+ minutes: Critical

The exact visual treatment should be clear and easy to understand.

The database should not be continuously updated every minute simply to change the displayed elapsed time.

The frontend should calculate/display elapsed time from the stored timestamp.

---

# 10. Order Timestamps

Orders should support these timestamps:

- `createdAt`
- `startedAt`
- `completedAt`

Use Firebase/Firestore timestamps where appropriate.

### createdAt

Set when the order is created and payment is confirmed.

### startedAt

Set when an employee begins preparing the order.

### completedAt

Set when the order is served and marked completed.

Do not overwrite timestamps unnecessarily.

These timestamps will also allow the system to calculate:

- Waiting time
- Preparation time
- Total fulfillment time

---

# 11. Completing an Order

When the employee finishes preparing and serves the customer, provide an obvious action such as:

    Complete Order

When clicked:

1. Validate that the user is authorized to complete the order.
2. Update the order status to `COMPLETED`.
3. Set `completedAt`.
4. Set `completedBy`.
5. Remove it from the active To-Do List view.
6. Make it available in Sales History.

Do not create a second copy of the order when completing it.

---

# 12. Sales History

Sales History must show completed orders.

Each sales record should be based on the original order.

Sales History should contain:

- Order number
- Date
- Time
- Items purchased
- Quantity
- Unit price
- Item subtotal
- Total
- Payment method
- Amount received
- Change
- Cashier
- Completion time
- Employee who completed the order

Sales History should support a timeline-oriented presentation.

Example:

    ORDER #001
    10:32 AM

    2 × Cheese Burger       ₱170
    1 × French Fries         ₱50

    TOTAL                   ₱220

    Cash                    ₱500
    Change                  ₱280

Do not modify historical item prices when the current product price changes.

---

# 13. Critical Data Architecture Rule

Do NOT create duplicate records for the To-Do List and Sales History.

Do NOT create:

    orders/
    todo/
    salesHistory/

where the same order is duplicated in all three locations.

Instead, maintain a single source of truth:

    orders/

The To-Do List is a filtered view of orders.

Sales History is another filtered view of orders.

Conceptually:

    orders
       │
       ├── status = PENDING
       │       ↓
       │   To-Do List
       │
       ├── status = PREPARING
       │       ↓
       │   To-Do List
       │
       └── status = COMPLETED
               ↓
          Sales History

This prevents synchronization problems and duplicated business data.

---

# 14. Firestore Database

Use Cloud Firestore as the document database.

Recommended primary collections:

    users
    products
    orders

Do not create unnecessary collections.

---

# 15. Products

Products represent currently available items that can be sold.

Conceptually:

    products/{productId}

Example:

    {
      name: "Cheese Burger",
      price: 85,
      category: "Burger",
      isAvailable: true
    }

Products should have stable IDs.

Use the product ID when referencing a product from an order.

---

# 16. Orders

Conceptually:

    orders/{orderId}

An order should contain information similar to:

    {
      orderNumber: "001",

      items: [
        {
          productId: "burger001",
          name: "Cheese Burger",
          unitPrice: 85,
          quantity: 2,
          subtotal: 170
        }
      ],

      subtotal: 170,
      total: 170,

      payment: {
        method: "cash",
        amountReceived: 500,
        change: 330
      },

      status: "PENDING",

      createdAt: Timestamp,
      startedAt: null,
      completedAt: null,

      cashierId: "user123",
      completedBy: null
    }

The exact implementation may differ based on the existing codebase.

Do not blindly copy this example if the project already has an established schema.

---

# 17. Historical Order Data

When an order is created, store a snapshot of the purchased item's relevant information.

For example:

    productId
    name
    unitPrice
    quantity
    subtotal

This is important because product information can change later.

If:

    Cheese Burger = ₱85

when Order #001 is purchased, and later the product price becomes:

    Cheese Burger = ₱95

Order #001 must continue showing:

    Cheese Burger = ₱85

Historical sales must not change because of current product data.

---

# 18. Database Design Principles

Follow these principles:

- Keep one source of truth.
- Avoid unnecessary duplication.
- Avoid unnecessary writes.
- Store timestamps as timestamps.
- Store immutable historical transaction information.
- Use stable document IDs.
- Validate data before writing.
- Validate permissions before sensitive operations.
- Do not trust client-provided totals blindly.
- Recalculate/validate important financial values.
- Keep database access code separated from UI code.

---

# 19. Financial Data Integrity

Money calculations are critical.

Never assume that values coming from the client are trustworthy.

The application should validate:

    quantity > 0

    price >= 0

    total >= 0

    amountReceived >= 0

    change >= 0

For cash:

    change = amountReceived - total

The system must not allow:

    change < 0

A completed transaction should not be silently modified.

If transaction correction/voiding is implemented later, it must be explicitly designed with proper authorization and auditing.

---

# 20. Authentication

Use Firebase Authentication for user authentication.

Users should be authenticated before accessing protected application functionality.

Do not rely solely on frontend checks.

Authentication and authorization must also be enforced through appropriate backend/database security rules.

Never expose sensitive credentials in client-side code.

Never place Firebase Admin credentials or service account private keys in the frontend.

---

# 21. Authorization

Different users may have different permissions.

At minimum, design with roles in mind:

    CASHIER
    EMPLOYEE
    MANAGER
    ADMIN

Do not assume every authenticated user has permission to perform every action.

For example:

Cashier:

- Create orders
- View relevant orders
- Process customer payment

Employee:

- View active orders
- Start orders
- Complete orders

Manager/Admin:

- View sales history
- Manage products
- Manage users
- Access administrative functions

The exact permission model can be implemented according to future requirements.

Do not invent complex role behavior without being asked.

---

# 22. Security Rules

Firestore security rules are part of the application's security architecture.

Never depend exclusively on:

    if (user.role === "ADMIN")

in frontend React code.

Frontend checks are for user experience.

Actual authorization must be enforced at the appropriate security boundary.

Before implementing database functionality, consider:

- Authentication
- Authorization
- Data validation
- Ownership
- Allowed status transitions
- Immutable historical data
- Protection against unauthorized writes

---

# 23. Architecture

Use clear separation of responsibilities.

Prefer:

    UI
      ↓
    Application / Business Logic
      ↓
    Data Access
      ↓
    Firebase / Firestore

Avoid placing large amounts of Firestore logic directly inside visual components.

For example, avoid putting all of this into one React component:

- UI rendering
- Cart calculations
- Firestore writes
- Authentication logic
- Permission checking
- Order status management

Separate responsibilities into maintainable modules.

---

# 24. Suggested Project Organization

Follow the existing project's structure if one already exists.

If creating the structure from scratch, use a maintainable organization similar to:

    src/
    ├── app/
    │
    ├── components/
    │   ├── ui/
    │   ├── cashier/
    │   ├── todo/
    │   └── sales/
    │
    ├── features/
    │   ├── orders/
    │   ├── products/
    │   ├── sales/
    │   └── users/
    │
    ├── lib/
    │   ├── firebase/
    │   └── utils/
    │
    ├── services/
    │   ├── orderService.ts
    │   ├── productService.ts
    │   └── salesService.ts
    │
    ├── types/
    │   ├── order.ts
    │   ├── product.ts
    │   └── user.ts
    │
    └── hooks/

Do not force this structure onto an existing project if doing so would cause unnecessary refactoring.

---

# 25. TypeScript

Use strong TypeScript types for important application models.

Create shared types for:

- Order
- OrderItem
- Product
- Payment
- User
- OrderStatus

Avoid unnecessary use of:

    any

Prefer explicit types.

Do not duplicate the same interface in multiple files.

---

# 26. UI / UX

The application is an operational POS system.

The interface must prioritize:

- Speed
- Clarity
- Readability
- Low cognitive load
- Clear actions
- Responsive design
- Accessibility
- Consistent interaction patterns

Cashiers and employees should be able to operate the application quickly.

Important actions should be visually obvious.

Examples:

    Add to Cart
    Confirm Payment
    Start Order
    Complete Order

Do not hide critical operational actions behind unnecessary menus.

Use consistent buttons, spacing, typography, icons, and interaction states.

Avoid excessive animations.

Animations must never interfere with fast order processing.

---

# 27. To-Do List UX

The To-Do List should make urgent orders easy to identify.

An employee should be able to immediately understand:

1. Which order is oldest.
2. Which order is urgent.
3. What items need to be prepared.
4. Whether an order is pending or preparing.
5. What action should be taken.

Sort active orders in a useful way, with older/urgent orders receiving appropriate priority.

Do not rely solely on color to communicate urgency.

Provide text/status indicators as well.

---

# 28. Sales History UX

Sales History should support:

- Chronological viewing
- Order details
- Item details
- Search
- Filtering
- Date-based filtering when appropriate

Do not overload the initial screen with unnecessary information.

Show summary information first, with detailed order information available when selected.

---

# 29. Performance

Do not continuously poll Firestore unnecessarily.

Prefer appropriate Firestore realtime listeners where live order updates are required.

For the To-Do List:

- Listen to relevant active orders.
- Avoid retrieving completed historical sales unnecessarily.
- Query only required fields/data where possible.
- Avoid unnecessary component rerenders.
- Avoid unnecessary database writes.

The elapsed timer must update locally rather than writing to Firestore every minute.

---

# 30. Firestore Query Design

Before creating a query, consider:

- What data is actually required?
- What filters are required?
- What ordering is required?
- Whether a Firestore index will be necessary.
- How the query behaves as the number of orders grows.

Do not retrieve the entire sales history when only today's orders are needed.

Do not retrieve every order if the screen only requires active orders.

---

# 31. Real-Time To-Do List

The To-Do List should reflect order changes quickly.

For example:

Cashier:

    Create Order #001

Then:

    To-Do List
       ↓
    Order #001 appears

Employee:

    Start Order

Then:

    Order #001
    status = PREPARING

Employee:

    Complete Order

Then:

    Order #001 disappears from active To-Do List

And:

    Sales History
       ↓
    Order #001 appears

Avoid requiring users to manually refresh the browser for normal order-state changes.

---

# 32. Error Handling

Always handle:

- Firebase errors
- Authentication errors
- Network failures
- Invalid forms
- Insufficient payment
- Missing products
- Unauthorized actions
- Failed order creation
- Failed order completion

Do not silently ignore errors.

Provide useful user-facing feedback without exposing sensitive technical details.

Example:

Bad:

    FirebaseError: PERMISSION_DENIED at /orders/...

Better:

    Unable to complete the order.
    Please try again or contact a manager.

Log appropriate technical details for developers where appropriate.

---

# 33. Loading States

Every asynchronous operation should have an appropriate loading state.

Examples:

    Loading products...

    Processing payment...

    Creating order...

    Completing order...

Avoid allowing users to accidentally submit the same order multiple times.

Disable or protect actions while a critical transaction is being processed.

---

# 34. Duplicate Transaction Prevention

Payment confirmation is a critical action.

Prevent accidental double submission.

For example, if the cashier clicks:

    Confirm Payment

the application should immediately prevent duplicate submission while the transaction is being processed.

Do not accidentally create:

    ORDER #001
    ORDER #002

from one customer transaction because the button was clicked twice.

---

# 35. Existing Code

Before modifying an existing feature:

1. Inspect the relevant files.
2. Understand the current implementation.
3. Identify existing reusable components.
4. Identify existing services/utilities.
5. Avoid unnecessary rewrites.
6. Preserve existing working functionality.

Do not replace a working implementation simply because you prefer a different coding style.

---

# 36. Dependencies

Before installing a dependency:

1. Check package.json.
2. Determine whether an existing dependency already solves the problem.
3. Prefer the smallest appropriate solution.
4. Avoid unnecessary dependencies.
5. Explain why a new dependency is needed when it introduces significant complexity.

Do not install packages automatically for simple functionality that can reasonably be implemented using the existing stack.

---

# 37. Development Process

For significant changes, follow this process:

### Step 1 - Understand

Inspect the existing project before making changes.

### Step 2 - Plan

Explain:

- What will be changed.
- Which files will be created/modified.
- What database changes are required.
- What user workflow is affected.

### Step 3 - Implement

Implement the smallest maintainable solution.

### Step 4 - Validate

Check:

- TypeScript
- Lint
- Build
- Relevant functionality
- Firebase behavior
- Authentication/authorization

### Step 5 - Review

Look for:

- Duplicate logic
- Security problems
- Unnecessary Firebase writes
- Race conditions
- Poor error handling
- Unnecessary complexity

---

# 38. Architecture References

When making architectural decisions, consult the available architecture reference material when appropriate.

Relevant references include:

    .claude/skills/senior-architect/references/architecture_patterns.md

    .claude/skills/senior-architect/references/system_design_workflows.md

    .claude/skills/senior-architect/references/tech_decision_guide.md

Use these references to help make architectural decisions.

However, project-specific requirements in this CLAUDE.md take priority over generic examples in reference documentation.

Do not blindly implement example patterns from reference documents when they do not fit Skye.

---

# 39. Do Not Overengineer

Skye should be maintainable, but do not introduce unnecessary enterprise architecture.

Do not add:

- Microservices
- Kubernetes
- Complex event buses
- Unnecessary abstraction layers
- Excessive design patterns
- Multiple databases
- Unnecessary state-management systems

unless the project requirements genuinely justify them.

Prefer simple, clear, maintainable solutions.

---

# 40. Important Business Rules

The following rules are fundamental to Skye:

1. An order is created by the cashier.
2. Payment must be validated before confirming the order.
3. Change must be calculated automatically.
4. A confirmed order enters the To-Do List.
5. The order's actual creation timestamp determines its waiting time.
6. Waiting time must not be stored as "minutes ago."
7. The order moves through the defined status lifecycle.
8. Completing an order updates the existing order.
9. Completed orders appear in Sales History.
10. To-Do List and Sales History must not contain duplicate copies of the same order.
11. Historical transaction prices must remain unchanged.
12. Important financial information must be validated.
13. Unauthorized users must not be able to perform restricted operations.
14. Firebase credentials and secrets must never be exposed.
15. The application should use Firestore efficiently and avoid unnecessary writes.

---

# 41. Do Not Invent Requirements

Do not assume functionality that has not been requested.

If an architectural decision significantly affects:

- Database structure
- Payment behavior
- User permissions
- Order lifecycle
- Financial records
- Security
- Data deletion
- Transaction correction

and the requirements are unclear, stop and ask for clarification before implementing the behavior.

For minor implementation details, use reasonable engineering judgment without unnecessarily interrupting development.

---

# 42. Before Completing a Task

Before declaring a feature complete, verify:

- [ ] The feature follows the Skye workflow.
- [ ] TypeScript has no relevant errors.
- [ ] Linting passes where applicable.
- [ ] The application builds successfully.
- [ ] Firebase operations are handled correctly.
- [ ] Authentication is respected.
- [ ] Authorization is respected.
- [ ] Errors are handled.
- [ ] Loading states exist where necessary.
- [ ] Duplicate submissions are prevented for critical operations.
- [ ] No unnecessary database writes were introduced.
- [ ] No duplicate order records were created.
- [ ] Historical sales information remains accurate.
- [ ] Existing functionality was not unnecessarily broken.
- [ ] The implementation is understandable and maintainable.

---

# 43. Priority

When making decisions, prioritize in this order:

1. Correctness
2. Financial/data integrity
3. Security
4. User workflow
5. Maintainability
6. Performance
7. Visual polish

Do not sacrifice correctness or security for visual appearance.

---

# 44. Final Principle

Build Skye as a practical POS and order-management system.

Keep the architecture clear.

Keep the data model reliable.

Keep the cashier workflow fast.

Keep the To-Do List easy to understand.

Keep Sales History accurate.

Avoid duplicated data.

Avoid unnecessary complexity.

Do not implement features merely because they are technically interesting.

Build what the business workflow actually requires.