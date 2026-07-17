# Multi-Store SaaS Smart Grocery Store Management System

A production-ready, enterprise-grade multi-tenant Grocery Store Management System built using **Angular 20 Standalone architecture** and **NestJS modular backend** with a **MongoDB database**.

---

## Technical Stack

- **Frontend**: Angular 20, Standalone Components, Angular Signals (state management), Angular Router, ngx-translate (Localization), Tailwind CSS, Angular Material.
- **Backend**: NestJS, Mongoose ODM, Passport JWT Authentication, Roles Guards, Event Emitter, Socket.io (WebSockets), PDFKit (Invoices), ExcelJS (Spreadsheet reports).
- **Database**: MongoDB (Mongoose schemas for tenant separation).
- **Infrastructure**: Docker, Redis (Queue workflows), local static uploads hosting.

---

## Seeding Accounts (Default Credentials)

Upon starting the application, the database is automatically seeded if empty. The following test profiles are created:

1. **Super Admin** (Global Tenant Builder)
   - Email: `admin@saasgrocery.com`
   - Password: `Admin@12345`
   - Role: `super-admin`

2. **Store Manager** (Downtown Supermart)
   - Email: `manager@store1.com`
   - Password: `Manager@12345`
   - Role: `employee` (Store Manager position)

3. **Store Worker / Cashier** (Downtown Supermart)
   - Email: `worker@store1.com`
   - Password: `Worker@12345`
   - Role: `employee` (Worker position)

4. **Registered Online Customer**
   - Email: `customer@gmail.com`
   - Password: `Customer@12345`
   - Role: `customer`

---

## Local System Run Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB & Redis (or use Docker)

### Option 1: Docker Containers (Recommended)
You can boot the database and application services using the configured `docker-compose.yml` file:
```bash
docker-compose up -d --build
```
- Frontend will be accessible at: `http://localhost`
- Backend API will be accessible at: `http://localhost:3000/api`

---

### Option 2: Running Services Separately (Development Mode)

#### 1. Booting Databases (MongoDB & Redis)
Ensure MongoDB (port 27017) and Redis (port 6379) are running on your host machine.

#### 2. Start NestJS Backend API
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the NestJS server in watch mode:
   ```bash
   npm run start:dev
   ```
- API will run at: `http://localhost:3000/api`
- Swagger API Docs: `http://localhost:3000/api/docs`

#### 3. Start Angular 20 Frontend UI
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Angular dev server:
   ```bash
   npm run start
   ```
- Open your browser to: `http://localhost:4200`

---

## Core Operations Walkthrough

### 1. Dynamic UPI QR Payments
The POS billing screen and the online storefront both support dynamic UPI payment triggers.
- In POS: The cashier inputs items, clicks "UPI QR", and submits checkout.
- A dynamic UPI deep link (e.g. `upi://pay?pa=merchant@ybl&pn=SmartGroceryStore&am=240&tr=TXN-1234&cu=INR`) is created.
- An interactive QR screen displays the simulated receipt details. Clicking "Verify Payment" marks the order paid and initiates PDF invoice download.

### 2. PDF & Excel Reports
- In the **Reports** view, managers can request compilation logs.
- Clicking **Excel** exports a sheet with separate tabs for Sales Registers and Stock Counts.
- Clicking **PDF** writes a formatted executive summary using vectors showing profit estimates and stock levels.
