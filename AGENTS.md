## Project

This is an **Admission Lead Management System** for educational institutions.
The app manages potential students from enquiry → counsellor handling → follow-up → admission.
This is not a full college ERP. Do not add unrelated modules such as attendance, marks, teachers, timetable, payroll, etc.



## Tech Stack

* Next.js
* TypeScript
* Tailwind CSS
* ESLint
* PostgreSQL
* Neon DB
* `pg` driver
Frontend and backend are inside the same Next.js application.



## Roles

There are currently two roles:

* `admin`
* `counsellor`
Both are stored in the same `users` table and use the same login flow.



### Admin

Can:

* View all leads
* Create/manage counsellors
* Add leads
* Assign/reassign leads
* Contact leads
* Admit leads
* View admissions



### Counsellor

Can:

* Create leads
* View their permitted/assigned leads
* Contact leads
* Update status, priority and assessment
* Mark `reachout`
* Admit their permitted leads

Authorization must always be enforced by backend APIs.



## Lead Flow

Lead sources include:

* Website
* WhatsApp
* Phone
* Walk-in
* Education Fair
* Campaign

Website enquiry automatically creates a lead with:

```text
source = WEBSITE
status = NEW
priority = NORMAL
reachout = false
assigned_to = null
.
.
.
etc
```
Other sources can be manually added by Admin or Counsellors.



## App Structure

All routes belong inside `/app`.

Example:

```text
/app
  /dashboard
    page.tsx

  /leads
    page.tsx

  /admissions
    page.tsx
```

Route files should stay lightweight.

Actual page logic should live inside `/features`.

Example:

```text
/app/dashboard/page.tsx
/features/dashboard/DashboardPage.tsx
```

`page.tsx` should mainly import and render the feature component.

Example:

```tsx
import DashboardPage from "@/features/dashboard/DashboardPage";

export default function Page() {
  return <DashboardPage />;
}
```

Feature structure:

```text
/features
  /dashboard
  /leads
  /admissions
  /auth
  /counsellors
```

Keep functionality related to the same feature together.

---

## API Structure

All backend APIs must live inside:

```text
/app/api
```

Use one folder per module.

Example:

```text
/app/api
  /auth
    /login
      route.ts

  /leads
    route.ts

  /admissions
    route.ts

  /counsellors
    route.ts
```

A module-level `route.ts` should handle operations related to that module.

Example:

```text
/app/api/leads/route.ts
```

can handle:

```text
GET  → fetch leads
POST → create lead
PUT  → update lead
DELETE → delete lead when required
```

Do not unnecessarily create many API files when the operations belong to the same module.

If an operation genuinely needs an identifier-specific route, use:

```text
/app/api/leads/[id]/route.ts
```

Keep API responsibilities grouped and predictable.

---

## Root Folders

Use these conventions:

```text
/app
/features
/components
/types
/lib
```

### `/components`

Reusable UI components shared across features.

Example:

```text
/components/ConfirmModal.tsx
/components/DataTable.tsx
/components/StatusBadge.tsx
```

Do not move feature-specific UI here unless it is genuinely reusable.

### `/types`

Store TypeScript interfaces/types.

Organize by feature when needed.

Example:

```text
/types
  /leads
    index.ts

  /auth
    index.ts
```

### `/lib`

Utilities and shared infrastructure.

Example:

```text
/lib/db.ts
/lib/auth.ts
```

Database connection logic should live here.

---




## Code Style

Keep code **compact, readable and practical**.
Do not over-engineer simple logic.
Do not turn 5–10 lines of understandable logic into unnecessary abstractions or 30+ lines of boilerplate.
Separate functions/components with a clean gap, but do not add excessive blank lines inside related logic.

Prefer:

```tsx
function Example() {
  const value = getValue();
  const result = transform(value);
  return result;
}
```

Avoid spreading tightly related statements across unnecessary whitespace.

For JSX props:

```tsx
<Modal open={open} title="Delete Lead" onClose={handleClose} />
```

Keep them on one line when reasonably short.
For long JSX, format across lines for readability.
Do not force everything onto one line.
Choose readability over artificial compactness.
Prefer simple understandable code over clever compressed code.
If complex logic is unavoidable, add a short useful comment explaining **why** it exists.
Avoid comments that merely repeat what obvious code already says.

---



## Engineering Rules

* Reuse existing components before creating duplicates.
* Reuse existing types where possible.
* Do not introduce new libraries without a real need.
* Do not change architecture unnecessarily.
* Do not create separate backend services.
* Keep DB utilities in `/lib`.
* Keep route files thin.
* Keep feature logic inside `/features`.
* Keep authorization checks on the backend.
* Avoid unnecessary abstractions.
* Follow existing project conventions before inventing new ones.