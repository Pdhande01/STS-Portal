# Smart Tech Service Portal - Presentation Guide

Use this guide to present the **Smart Tech Service Portal (STS)**. It breaks down the application's architecture, key features, technical highlights, and outlines a step-by-step live demo script to wow your audience.

---

## 1. Project Overview & Business Value
* **What is it?** A comprehensive, multi-role digital hub managing tech repair services and hardware inventory.
* **Problem Solved**: Bridge the communication gap between customers seeking repairs, technicians performing work, and administrators overseeing business operations and stock levels.
* **Target Roles**:
  1. **Customers (Users)**: Book and track repairs, view transparent pricing, purchase hardware.
  2. **Technicians**: Manage assigned jobs, submit status logs, and update clients in real-time.
  3. **Administrators**: Control user access, dispatch technicians, manage products, view order updates, and inspect system audit logs.

---

## 2. Technical Stack & Architecture
* **Frontend UI**: Built with React 18, utilizing TypeScript for type safety, React Router v7 for nested client routing, and styled using Tailwind CSS v4.
* **State & Authorization**: Controlled via custom React contexts like [AuthContext.tsx](file:///c:/Users/parth/Desktop/STS-Portal/Website/src/contexts/AuthContext.tsx) and guarded using role-based routing wrapper [ProtectedRoute.tsx](file:///c:/Users/parth/Desktop/STS-Portal/Website/src/app/components/ProtectedRoute.tsx) in [routes.tsx](file:///c:/Users/parth/Desktop/STS-Portal/Website/src/app/routes.tsx).
* **AI Engine**: A conversational floating assistant component [AIChatBot.tsx](file:///c:/Users/parth/Desktop/STS-Portal/Website/src/app/components/AIChatBot.tsx) powered by the Google Gemma 3 model (`google/gemma-3-27b-it:free`) via the OpenRouter API.

---

## 3. Core Architectural Highlights (Talking Points)

### 🔌 Dual-Mode Database Wrapper (Offline-First)
A key highlight in [supabase.ts](file:///c:/Users/parth/Desktop/STS-Portal/Website/src/supabase.ts) is the seamless fallback mechanism:
* **Production mode**: Connects directly to a cloud **Supabase PostgreSQL database** using the official client library.
* **Mock mode (Offline demo)**: If credentials are missing or set to dummy placeholders, it shifts to a simulated, local-first client-side database written in [mockSupabase.ts](file:///c:/Users/parth/Desktop/STS-Portal/Website/src/mockSupabase.ts).
* **How the Mock DB works**:
  * It intercepts database actions (like `.select()`, `.insert()`, `.update()`, `.delete()`, `.eq()`, `.order()`) and auth functions, executing them locally against the browser's `localStorage`.
  * Allows a full, persistent presentation to run completely offline on any browser.
  * **Self-Healing Admin Logins**: Elevates specific emails (like `parthdhande7894@gmail.com` or `admin@smarttech.com`) to the `'admin'` role upon registration/login automatically to prevent getting locked out of administrative screens.
  * **Reset Utility**: Includes a global browser console utility `window.resetMockDB()` that cleans local state and re-seeds it with default entities instantly.

### 🛡️ Secure Admin Audit Trail
Located in [audit.ts](file:///c:/Users/parth/Desktop/STS-Portal/Website/src/lib/audit.ts), this mechanism tracks sensitive operations:
* Logs actions such as deleting user profiles, suspending/activating accounts, editing hardware pricing or stock, assigning technicians, and updating orders.
* Automatically records the administrator's email, name, action type, target item, and precise timestamp.
* Renders an interactive feed for compliance audits on [AdminAuditLogs.tsx](file:///c:/Users/parth/Desktop/STS-Portal/Website/src/app/pages/admin/AdminAuditLogs.tsx).

---

## 4. Feature Set by User Role

### 👤 Customer (User)
* **Dashboard**: Clear interface showing open tickets, active orders, and quick access.
* **Repair Booking**: Choice of **Home Service** or **In-Shop Drop-off**, scheduling timeslots, and submitting descriptions.
* **Real-time Timeline**: A progress bar showing updates directly fed by the technician or admin.
* **Cost Estimator**: Interactive calculator that aggregates base diagnostic labor and required replacement parts.
* **Hardware E-Commerce**: Shop interface with search, categories, stock limits, customer rating reviews, and checkout.

### 📋 Technician
* **Assigned Requests Feed**: List of active repairs with client contact numbers and addresses.
* **Job Progression**: Interactive status adjustments (Pending, In Progress, Completed, Cancelled) and progress slider (0% to 100%).
* **Timeline Commentary**: Submitting field notes that instantly display on the customer's tracking timeline.

### 🔑 Administrator
* **Executive Summary**: Real-time stats showing active users, technicians, open tickets, and total revenue.
* **Access Controller**: Suspend or activate profiles, and delete accounts if required.
* **Technician Registry**: Register new technicians or promote standard users directly.
* **Work Order Dispatcher**: Review incoming service requests and assign them to technicians.
* **Inventory Control**: Add, modify, or delete hardware offerings (price, category, initial stock).
* **Order Management**: Oversee shop orders and dispatch statuses.

---

## 5. Live Demo Script (Step-by-Step Presenter Script)

Impress your audience by walking through this end-to-end user lifecycle:

### Step 1: Customer Booking & Estimator
1. Open the website, click on **Cost Estimator** under user options.
2. Select a device type (e.g., **Laptop**) and select **Screen Replacement**. Show the dynamically updated estimation price.
3. Click **Book Service**. Fill out the device details (e.g., *Dell XPS 15*), choose **Shop drop-off**, pick a time, and submit.
4. Go to **Track Service** to show the live timeline displaying: *"Service request received. Awaiting technician assignment."*

### Step 2: AI Techsathi Bot
1. Click the floating AI Chat icon in the bottom right.
2. Ask: *"My laptop is running very slow, what should I do?"*
3. Show the instant, custom answer generated by the integrated Gemma 3 model.

### Step 3: Hardware Purchase
1. Go to the **Shop**. Filter by **Storage**.
2. Click on the *Samsung 980 Pro 1TB SSD*.
3. Add a review: Rate it *5 stars* and say *"Super fast!"*. Show how the product rating recalculates immediately.
4. Add it to the cart and click checkout. Fill out the delivery address and submit the order.

### Step 4: Admin Dispatches Technician
1. Log out, or log back in as `admin@smarttech.com` (verification code: `123456`).
2. Show the **Overview Dashboard** updates (Revenue and active repairs count).
3. Navigate to **Service Requests** and find the Dell XPS ticket. Assign it to **Jane Smith** (Technician).
4. Navigate to **Audit Logs** and show how the system automatically registered:
   `Assign Technician - Request ID: [ID] - Assigned technician Jane Smith to the request.`

### Step 5: Technician Progress Updates
1. Log out and log in as `tech@smarttech.com` (verification code: `123456`).
2. Open the **Technician Dashboard**. Locate the Dell XPS 15 repair job.
3. Drag the progress bar to **50%**, type a comment: *"Screen disassembled. Waiting for replacement panel arrival."*, and submit.

### Step 6: Customer Tracking Validation
1. Log out, and log in back as `user@smarttech.com` (verification code: `123456`).
2. Navigate to **Track Service** and view the XPS 15 ticket.
3. Show the progress bar now at **50%** and the new timeline event showing Jane's comment with the exact timestamp.
