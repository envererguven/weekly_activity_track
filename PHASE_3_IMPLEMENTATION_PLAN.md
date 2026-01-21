# Implementation Plan - Phase 3: Authentication & Security

## Goal Description
Implement a secure authentication system using JWT (JSON Web Tokens) to restrict access. Add Role-Based Access Control (RBAC) to distinguish between 'Admin' and 'Standard' users.

## Proposed Changes

### Database
#### [MODIFY] [schema.sql](file:///c:/Users/PCUser/.gemini/antigravity/scratch/activity_weekly3/database/init.sql)
- Add `password_hash` column to `users` table.
- Add `role` column to `users` table (Default: 'USER', Options: 'ADMIN', 'USER').

### Backend
#### [NEW] [controllers/authController.js](file:///c:/Users/PCUser/.gemini/antigravity/scratch/activity_weekly3/backend/src/controllers/authController.js)
- `login`: Validate credentials, issue JWT.
- `register`: (Optional for MVP, admin creates users) - or update `userController.createUser`.

#### [NEW] [middleware/authMiddleware.js](file:///c:/Users/PCUser/.gemini/antigravity/scratch/activity_weekly3/backend/src/middleware/authMiddleware.js)
- `verifyToken`: Check JWT in header.
- `requireAdmin`: Check if user role is ADMIN.

#### [MODIFY] [routes/api.js](file:///c:/Users/PCUser/.gemini/antigravity/scratch/activity_weekly3/backend/src/routes/api.js)
- Unprotected: `POST /auth/login`.
- Protected: All other routes.
- Admin Only: `/users`, `/products`, `/admin/import`.

### Frontend
#### [NEW] [pages/Login.jsx](file:///c:/Users/PCUser/.gemini/antigravity/scratch/activity_weekly3/frontend/src/pages/Login.jsx)
- Simple Login form (Username/Password).
- On success: Save JWT to localStorage, redirect to Dashboard.

#### [MODIFY] [App.js](file:///c:/Users/PCUser/.gemini/antigravity/scratch/activity_weekly3/frontend/src/App.js)
- Add `<Login>` route.
- Implement `ProtectedRoute` wrapper component.
- Redirect unauthenticated users to `/login`.

#### [MODIFY] [Layout.jsx](file:///c:/Users/PCUser/.gemini/antigravity/scratch/activity_weekly3/frontend/src/components/Layout.jsx)
- Hide "Admin Panel" link for non-admin users.
- Add "Logout" button.

## Verification Plan
### Automated Tests
- Test Login Endpoint (Valid/Invalid credentials).
- Test Protected Route (Access with/without Token).
- Test Admin Route (Access as User/Admin).

### Manual Verification
1. Open App -> Should see Login.
2. Login as Admin -> Access Admin Panel.
3. Login as User -> Admin Panel should be inaccessible/hidden.



Backend: Adding secure password storage (bcrypt), JWT generation, and Auth Middleware.
Database: Updating the users table to support passwords and roles (Admin/User).
Frontend: Creating a Login page and protecting routes so only logged-in users can access the app.
RBAC: Hiding the "Admin Panel" from non-admin users.
Please review the plan below. If it looks good, I'll start by updating the database schema.
