# Oscorp Quota Portal

Build a ultra-realistic, enterprise-grade B2B web application for "Oscorp Industries Corporation" using React, Tailwind CSS, Lucide React icons, and Shadcn UI components.



DESIGN & THEME SYSTEM:

- Aesthetic: Ultra-clean, classy modern enterprise corporate look.

- Color Palette: Pure White (#FFFFFF) & Crisp Light Slate (#F8FAFC) background, Accent Emerald Green (#00E676 / #059669), Dark Forest Green (#064E3B) for primary headers, and Charcoal (#1E293B) for body text.

- Components: Glassmorphism cards, interactive data tables, status badges, toast notifications, and modal dialogs.



CORE ARCHITECTURE & FEATURES TO IMPLEMENT:



1. ROLE-BASED AUTHENTICATION & LOGIN SYSTEM:

- Hardcoded Admin Credentials: Email "admin@oscorp.com" / Password "Admin2026!". Logging in with these credentials unlocks the "Admin Control Panel".

- Standard User/Vendor Login & Register Modal: Allows new users to create an account or sign in.

- Real-Time Account Status Engine: Include a toggle logic where if a user's status is set to "BLOCKED" by the admin, any attempt to perform actions shows a sticky red banner: "Your account has been suspended by Oscorp Admin."



2. PUBLIC LANDING PAGE & SERVICE HUB:

- High-Tech Hero Banner: "Oscorp Industries — Advanced Enterprise Quotation & Contract Portal".

- Quick Search / Status Tracker: A search bar on the hero section allowing users to enter a Reference ID (e.g., OSC-QT-90821) to check live quotation progress.

- Corporate Divisions: Interactive showcase for Genetics, Advanced Robotics, Aerospace, and Quotation Management.



3. CLIENT QUOTATION SUBMISSION MODULE:

- Drag-and-Drop File Upload Form: Clients can upload proposal documents (PDF, DOCX, ZIP).

- Dynamic Input Fields: Project Title, Estimated Budget, Department (Genetics/Robotics/HR), Target Contact Email (e.g. angeltripathi.2802@gmail.com), and Detailed Work Notes.

- Automatic Ref Generator: Upon submitting, generates a unique ID (e.g., OSC-2026-X8) and shows a success toast notification.



4. ADVANCED ADMIN DASHBOARD & CONTROL CENTER (Accessible via Admin Login):

- Live Analytics Cards: Total Quotations Received, Pending Review, Approved Contracts, Total Blocked Users.

- Interactive Quotation Approval Engine:

  * Table listing all submitted quotations with columns: Ref ID, Client Name, Email, Budget, Date, Status (Submitted / Under Review / Approved / Rejected).

  * Action Buttons: "Approve Quotation" (opens modal to set Final Approved Price & Admin Notes), "Reject Quotation", and "Download File".

  * Status Badge Changes: Updating status immediately reflects across the portal.

- Comprehensive User Management & Killswitch (Block/Unblock System):

  * User list table showing Name, Email, Role, Joined Date, and Account Status (Active/Blocked).

  * One-Click "Block User" Modal: Asks for a mandatory reason (e.g., "Policy Violation", "Unverified Documents") and updates user status to BLOCKED.

  * One-Click "Unblock User" feature to restore access.



5. EMPLOYEE & HR DIRECTORY (Public Verification Hub):

- Searchable Employee List: Search personnel by Reference ID (e.g., Shreya Kumari | Ref: OSC-IN-90821 | Quotation Specialist).

- Official Verification Badges & Document Dispatch Status updates.



6. UTILITIES & UI INTEGRATIONS:

- Top Sticky Header: Oscorp Emerald Logo, Navigation Links, Search, and Login/Admin Portal Switcher button.

- Live Toast Notifications (using Sonner / Shadcn Toast): Trigger realistic alerts when a quotation is submitted, approved, or when a user is blocked.

- Interactive Floating AI Assistant Widget: Answers FAQs about onboarding, email document dispatches, and quotation timelines.



Ensure all interactive states, mock data, filter options, active tabs, and modals work smoothly without any broken screens.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://oscorp-nexus-portal.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b95486be-3e15-4b9a-9b27-fc0a2fbc6f40).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Supabase cloud quotation setup

The quotation workflow can run without Lovable. The app uses the Supabase REST API directly and keeps the existing portal UI/login flow.

1. Create the Supabase project and base tables.
2. Run `supabase/quotation-cloud.sql` once in Supabase SQL Editor.
3. Copy `.env.example` to `.env.local` for local development.
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
5. For Vercel, add the same two variables under Project Settings → Environment Variables and redeploy.

Do not expose a Supabase `service_role`/secret key in `VITE_*` variables or frontend code.

This version uses the existing local role/login UI and cloud-persisted quotation data. The included policies are intentionally permissive for the current prototype. For a production deployment with untrusted users, move authentication to Supabase Auth and restrict RLS policies using `auth.uid()` and `profiles.role`.
