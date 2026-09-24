# Assignment 5 – Admission Lead Management.


The focus is mainly on below things : 

- admission enquiries
- lead assignment
- counsellor follow-up
- assessment
- admissions

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- PostgreSQL / Neon DB
- `pg` driver
- JWT auth
- HTTP-only cookie session
- bcrypt password hashing with 12 rounds

## High Level Architecture

The project is built as one Next.js application. Frontend and backend both live in the same repo.

```text
Browser
  |
  | renders pages and submits forms
  v
Next.js App Routes
  |
  | thin page files import feature components
  v
Feature Components
  |
  | fetch / mutate data through API routes
  v
Next.js Route Handlers
  |
  | validate request, verify JWT, check role
  v
PostgreSQL / Neon DB
```

## Frontend Architecture

All page routes are inside `app/`, but the real UI logic is kept inside `features/`.

Example:

```text
app/dashboard/page.tsx
  -> features/dashboard/DashboardPage.tsx
```

This keeps route files small and makes the feature code easier to maintain.

Main frontend areas:

```text
features/home
features/contact
features/auth
features/dashboard
features/leads
features/admissions
features/counsellors
```

Shared UI and small reusable components live in:

```text
components/
components/ui/
```

`components/ui/` contains shadcn components like Button, Dialog, Table, Tabs, Select etc.

## Pages

### Public Pages

- `/` - landing page
- `/contact` - public admission enquiry form
- `/login` - common login for admin and counsellor

### Protected Page

- `/dashboard` - common dashboard for both roles

The dashboard UI changes based on the logged-in user role.

## Backend Architecture

Backend APIs are implemented using Next.js Route Handlers under `app/api`.

```text
app/api/auth/login
app/api/auth/me
app/api/auth/logout

app/api/leads

app/api/admin/leads
app/api/admin/leads/action
app/api/admin/leads/reassign
app/api/admin/admissions
app/api/admin/counsellors

app/api/counsellor/leads
app/api/counsellor/leads/action
app/api/counsellor/admissions
```

The backend is responsible for authorization. The frontend may hide buttons, but the API still checks the user role and ownership of data.

## Authentication Flow

Login is shared for both admin and counsellor.

```text
POST /api/auth/login
  -> find user by email
  -> compare bcrypt password hash
  -> create JWT
  -> store JWT in HTTP-only cookie
  -> return logged-in user
```

JWT payload:

```ts
{
  id: number;
  email: string;
  role: "ADMIN" | "COUNSELLOR";
}
```

Route protection is handled in `proxy.ts`.

- If `/dashboard` is opened without cookie, user is redirected to `/login`
- If `/login` is opened with valid cookie, user is redirected to `/dashboard`

## Role Access

### Admin

Admin can:

- view all leads
- add leads
- add counsellors
- assign or reassign leads
- update status, priority, reachout and assessment
- admit candidates
- view all admissions

### Counsellor

Counsellor can:

- view only assigned leads
- add lead, which is automatically assigned to that counsellor
- update own leads
- admit own passed leads
- view related admissions

Counsellor cannot:

- see other counsellor leads
- reassign leads
- create counsellor accounts

## Database Architecture

Database schema is kept in:

```text
db/schema.sql
```

Main tables:

### `users`

Stores both admin and counsellor accounts.

Important columns:

- `id`
- `name`
- `email`
- `password`
- `role`
- `phone`
- `is_active`
- `created_at`

The `password` column stores bcrypt hashed password, not plain text.

### `leads`

Stores admission leads.

Important columns:

- `id`
- `name`
- `phone`
- `email`
- `course_interest`
- `query`
- `source`
- `status`
- `priority`
- `reachout`
- `assessment`
- `assigned_to`
- `created_by`
- `created_at`
- `updated_at`

### `admissions`

Stores final admission records.

Important columns:

- `id`
- `lead_id`
- `course`
- `admitted_by`
- `admission_date`

## Data Flow Example

### Public Enquiry

```text
/contact form
  -> POST /api/leads
  -> creates lead with source WEBSITE
  -> assigned_to is null
  -> status is NEW
```

### Admin Lead Management

```text
Admin dashboard
  -> GET /api/admin/leads
  -> admin receives all leads
  -> admin can update lead or assign counsellor
```

### Counsellor Lead Management

```text
Counsellor dashboard
  -> GET /api/counsellor/leads
  -> API filters by assigned_to = logged in counsellor id
```

### Admission

```text
Lead assessment must be PASS
  -> POST /api/admin/admissions or /api/counsellor/admissions
  -> create admission record
  -> update lead status to ADMITTED
```

## Important Lib Files

```text
lib/db.ts
```

Creates PostgreSQL connection pool using `pg`.

```text
lib/auth.ts
```

JWT signing, verification and cookie config.

```text
lib/server-auth.ts
```

Backend helper for checking logged-in user and allowed roles.

```text
lib/password.ts
```

bcrypt hash and verify helpers. Current hash round is 12.

```text
lib/lead-validation.ts
```

Validation helpers for lead source, status, priority and assessment.

## Environment Variables

Create `.env` file:

```env
DATABASE_URL="your_neon_postgres_url"
JWT_SECRET="your_secret_key"
```

`POSTGRES_URL` can also be used instead of `DATABASE_URL`.

## Setup

Install dependencies:

```bash
npm install
```

Run the DB schema in Neon or any PostgreSQL client:

```text
db/schema.sql
```

Create the first admin:

```bash
npm run create-admin -- "Admin" admin@gmail.com 123456
```

Run local server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Useful Commands

```bash
npm run dev
npm run lint
npm run build
npm run create-admin -- "Admin" admin@gmail.com 123456
```

## Notes

- Passwords are hashed using bcrypt with 12 rounds.
- JWT is stored in HTTP-only cookie.
- Backend authorization is mandatory for every protected API.
- Public users can only create website enquiries.
- Admin can see all leads.
- Counsellor can only see and update assigned leads.