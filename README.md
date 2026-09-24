# EduMerge - Admission Lead Management System

EduMerge is made for a simple admission office flow. Suppose one student is interested in a course and contacts the institute from website, WhatsApp, phone call, walk-in, fair or campaign. That person becomes a lead in this system. After that admin or counsellor can follow up, update the lead status, check assessment and finally convert that lead into admission.

This project is not a full college ERP. I have only kept the admission lead part here. So there is no attendance, marks, timetable, payroll etc.

## Basic Story Of The App

First, a student opens the public website. On home page there are two options. One is for admission enquiry and one is for login.

If student clicks enquiry, he goes to `/contact`. There he fills name, phone, email, course interest, source and query. This form does not ask internal fields like assigned counsellor, status, priority or assessment. Those are handled inside the system only.

When the form is submitted, frontend calls:

```text
POST /api/leads
```

Backend creates a lead like this:

```text
source = WEBSITE
status = NEW
priority = NORMAL
reachout = false
assessment = null
assigned_to = null
```

So public user can only create enquiry. They cannot assign lead or change status.

## Login Flow

Admin and counsellor both use same login page:

```text
/login
```

The user only enters email and password. There is no role dropdown, because role should not come from frontend.

When login happens:

```text
POST /api/auth/login
```

Backend finds the user by email, compares password using bcrypt, then creates JWT. Password is stored as bcrypt hash with 12 rounds.

JWT contains:

```ts
{
  id: number;
  email: string;
  role: "ADMIN" | "COUNSELLOR";
}
```

This JWT is stored in HTTP-only cookie. So frontend cannot directly read the token, but browser sends it automatically to backend APIs.

## How Dashboard Knows Admin Or Counsellor

After login, both admin and counsellor go to same route:

```text
/dashboard
```

When dashboard opens, frontend calls:

```text
GET /api/auth/me
```

This API reads JWT from cookie and returns the logged in user.

Example admin response:

```json
{
  "id": 1,
  "name": "Admin",
  "email": "admin@gmail.com",
  "role": "ADMIN"
}
```

Example counsellor response:

```json
{
  "id": 2,
  "name": "Rahul",
  "email": "rahul@college.com",
  "role": "COUNSELLOR"
}
```

Based on this `role`, frontend decides what to show.

If role is admin, frontend shows:

- Add Counsellor button
- Add Lead button
- counsellor assignment dropdown
- all leads
- all admissions

If role is counsellor, frontend shows:

- Add Lead button
- only assigned leads
- own admissions
- no counsellor creation
- no lead reassignment

But this is only for UI. Real safety is still on backend.

## Admin Scenario

Suppose admin logs in.

Dashboard calls:

```text
GET /api/admin/leads
GET /api/admin/admissions
GET /api/admin/counsellors
```

Admin can see every lead in the system. If a website lead came unassigned, admin can open Manage Lead modal and assign it to one counsellor.

Admin can update:

- reachout
- assessment
- priority
- status
- assigned counsellor

If assessment is `PASS`, Admit Candidate button becomes useful. If assessment is `FAILED`, frontend disables admission button. Backend also checks this condition again.

When admin admits a lead:

```text
POST /api/admin/admissions
```

Backend creates one admission record and updates lead status to:

```text
ADMITTED
```

## Counsellor Scenario

Suppose counsellor Rahul logs in.

Dashboard calls:

```text
GET /api/counsellor/leads
GET /api/counsellor/admissions
```

Backend does not return all leads. It returns only:

```sql
WHERE assigned_to = Rahul's user id
```

So even if another counsellor has leads, Rahul cannot see them.

If counsellor creates a new lead, frontend does not send `assignedTo`. Backend automatically sets:

```text
assigned_to = logged in counsellor id
```

Counsellor can update own lead status, priority, reachout and assessment. But before update, backend checks that the lead is actually assigned to that counsellor.

If counsellor tries to update other counsellor lead by changing API request manually, backend returns forbidden.

## Why There Are Admin And Counsellor APIs Separately

I kept APIs separate because permissions are different.

Admin APIs:

```text
/api/admin/leads
/api/admin/admissions
/api/admin/counsellors
```

Counsellor APIs:

```text
/api/counsellor/leads
/api/counsellor/admissions
```

This makes the code easy to understand. Admin routes always require admin role. Counsellor routes always require counsellor role and also check ownership of leads.

## Frontend To Backend Flow

The route files in `app/` are kept small. Main UI is inside `features/`.

Example:

```text
app/dashboard/page.tsx
  -> features/dashboard/DashboardPage.tsx
```

Dashboard component first gets logged in user, then decides API path.

```ts
const scope = user.role === "ADMIN" ? "admin" : "counsellor";
```

Then it calls:

```text
/api/admin/leads
```

or:

```text
/api/counsellor/leads
```

So frontend is not having two dashboards. Same dashboard changes itself based on role.

## Backend To DB Flow

Backend route handlers use `pg` driver. Connection is created in:

```text
lib/db.ts
```

All SQL queries use parameterized query style, for example:

```ts
db.query("SELECT * FROM leads WHERE assigned_to = $1", [user.id])
```

This avoids direct string injection in SQL.

## Database Tables

There are mainly three tables.

### users

Admin and counsellor both are stored here.

Important columns:

```text
id
name
email
password
role
phone
is_active
created_at
```

The `password` column stores bcrypt hash, not plain password.

### leads

All enquiries are stored here.

Important columns:

```text
id
name
phone
email
course_interest
query
source
status
priority
reachout
assessment
assigned_to
created_by
created_at
updated_at
```

### admissions

When a lead is converted, admission record is created here.

Important columns:

```text
id
lead_id
course
admitted_by
admission_date
```

Full schema is in:

```text
db/schema.sql
```