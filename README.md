# 🚀 Sasi Auth: Identity & Access Engine

An enterprise-grade, high-performance Identity and Access Management (IAM) framework built natively with Next.js and Supabase. Engineered specifically for complex multi-modal authentication edge cases, this engine delivers bank-grade security layers atop a sleek, consumer-ready interface.

---

## 🛡️ Security Architecture

### **Stateless Session Management**
Exal Auth abandons legacy server-side session pinging in favor of high-velocity **Stateless Session Management**. By leaning natively on Supabase-issued JSON Web Tokens (JWTs), we guarantee that horizontally scaled server components can instantly and cryptographically verify active identities without executing expensive database latency round-trips.

### **Multi-Factor Orchestration**
Instead of static and unyielding login forms, the system features dynamic **Multi-Factor Orchestration**. Users are granted absolute sovereignty over their security vectors, seamlessly toggling their gateway routing between:
* **Strict MFA (Password + Secure OTP):** Demands a mathematically exact bcrypt-validated password match *before* natively trapping the route to force a secondary SMS cryptographic verification.
* **Passwordless Speed Routing (OTP-Only):** Instantly suppresses generic password requirements entirely to deploy an exclusive 6-digit SMS code to their registered device.

### **Relational Data Integrity**
User metadata isn't just loosely typed JSON. We enforce strict **Relational Data Integrity** via a hardened PostgreSQL architecture. The operational `profiles` table is inextricably linked via robust `UUID` foreign-keys back to the underlying, isolated GoTrue `auth.users` metadata engine—preventing any possibility of orphan rows or fractured identities.

### **Zero-Trust UI**
Our frontend interface refuses to naively trust cookies or local storage. The internal user dashboard is aggressively guarded by a strict **Zero-Trust UI** policy. Any unauthenticated vector attempting to bypass the gateway is instantaneously intercepted and forcefully bounced back out to the `/login` perimeter before rendering a single secure DOM element.

---

## 🛠 Tech Stack

*   **Framework**: Next.js 16 (App Router) mapping SSR configurations for isolated Auth Guarding.
*   **IAS Provider**: Supabase (Open-source PostgREST + GoTrue Auth) handling headless identity linkage and raw Twilio SMS OTPs.
*   **Database**: PostgreSQL equipped deeply with Row Level Security (RLS) constraints.
*   **Frontend Ecosystem**: React 18, Tailwind CSS compilation, and Lucide vector iconography.

---

## 🚀 Getting Started

1. **Clone & Install**
   ```bash
   git clone <your-repo-url>
   cd exal-auth-app
   npm install
   ```

2. **Environment Hydration**
   Declare your Supabase instance endpoints securely inside a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Ignite the Engine**
   ```bash
   npm run dev
   ```
   *The local development server will spin up on port `:3000`.*
