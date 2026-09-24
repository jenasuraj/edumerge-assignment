# Frontend Implementation Spec

## Scope

Build the frontend for the Admission Lead Management System using:

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui

Keep UI clean, modern, responsive and practical.

Do not over-engineer the frontend.

---

# Public Website

## `/`

Create a simple hero section.

Center the main content.

Show:

```text
Admission Lead Management
Manage enquiries, counselling and admissions efficiently.
```

Primary actions:

```text
[ Contact / Admission Enquiry ]
[ Admin / Counsellor Login ]
```

`Contact / Admission Enquiry`:

```text
→ /contact
```

`Admin / Counsellor Login`:

```text
→ /login
```

---

# Contact Page

## `/contact`

This page is public.

Show an admission enquiry form.

Fields:

```text
Name *
Phone *
Email
Course Interest *
Query
Source *
```

Source dropdown:

```text
WEBSITE
WHATSAPP
PHONE
WALK_IN
FAIR
CAMPAIGN
OTHER
```

Submit payload:

```json
{
  "name": "Rahul Das",
  "phone": "9876543210",
  "email": "rahul@gmail.com",
  "courseInterest": "B.Tech CSE",
  "query": "I want to know about fees",
  "source": "WEBSITE"
}
```

Do NOT expose:

```text
assignedTo
status
priority
reachout
assessment
```

These are internal fields.

After successful submission show a success message/toast.

---

# Login

## `/login`

Single login form for both:

```text
ADMIN
COUNSELLOR
```

Fields:

```text
Email
Password
```

Do not ask the user to select their role.

Backend determines the role from the authenticated user.

After login:

```text
ADMIN       → /dashboard
COUNSELLOR  → /dashboard
```

The dashboard UI changes according to the authenticated role.

---

# Route Protection

Use root-level:

```text
/proxy.ts
```

Do not use the old `middleware.ts` convention.

Protect:

```text
/dashboard
```

If JWT cookie is missing:

```text
/dashboard → /login
```

If authenticated:

```text
/login → /dashboard
```

`proxy.ts` should only handle lightweight route protection.

Backend APIs remain responsible for actual authorization.

---

# Dashboard

## `/dashboard`

Use one dashboard route for Admin and Counsellor.

Render content based on authenticated role.

Suggested structure:

```text
Dashboard
│
├── Overview Cards
├── Leads
└── Admissions
```

Keep Leads and Admissions on the same dashboard page.

Tabs are preferred:

```text
[ Leads ] [ Admissions ]
```

Use shadcn/ui components wherever suitable.

---

# Admin Dashboard

Admin can see ALL leads.

Top cards can show:

```text
Total Leads
Reached Out
Passed Assessment
Failed Assessment
Admissions
```

Keep statistics simple.

---

# Admin Leads Table

Use a shadcn table.

Suggested columns:

```text
Name
Phone
Course
Source
Counsellor
Reachout
Assessment
Priority
Status
Created At
Actions
```

Example:

```text
Rahul Das
9876543210
B.Tech CSE
WEBSITE
Suraj
YES
PASS
HIGH
INTERESTED
24 Sep 2026
[ Manage ]
```

Avoid putting too many buttons directly inside the table.

Use one:

```text
[ Manage ]
```

button per row.

Clicking it should open a modal/drawer.

---

# Manage Lead Modal

Show candidate information at the top.

Example:

```text
Rahul Das
B.Tech CSE
Website
```

Then allow actions.

---

## Reachout

Allow:

```text
Interacted / Reached Out
Not Reached Out
```

Internally:

```text
true
false
```

Example control:

```text
Reachout
[ Yes ▼ ]
```

---

## Assessment

Assessment has:

```text
PASS
FAILED
```

Use a select or two clear buttons.

Example:

```text
Assessment

[ PASS ] [ FAILED ]
```

If:

```text
assessment = FAILED
```

disable the Admit button.

If:

```text
assessment = PASS
```

enable:

```text
[ Admit Candidate ]
```

Do not allow admission from the UI when assessment is failed.

---

# Lead Assignment

Admin can assign or reassign leads.

Inside Manage Lead modal:

```text
Assigned Counsellor

[ Suraj ▼ ]

[ Reassign ]
```

Counsellor dropdown should be loaded from the counsellor API.

Allow:

```text
assignedTo = counsellor ID
```

or:

```text
assignedTo = null
```

when unassigning.

---

# Priority

Allow Admin to change:

```text
LOW
NORMAL
HIGH
```

Use a dropdown or simple select.

---

# Status

Allow statuses such as:

```text
NEW
CONTACTED
INTERESTED
FOLLOW_UP
ADMITTED
LOST
```

Keep status handling simple.

Do not introduce unnecessary workflow complexity.

---

# Admission

If:

```text
assessment === "PASS"
```

show enabled:

```text
[ Admit Candidate ]
```

If:

```text
assessment === "FAILED"
```

show disabled:

```text
[ Admit Candidate ]
```

On click open confirmation modal:

```text
Admit Rahul Das?

Course:
B.Tech CSE

[ Cancel ] [ Confirm Admission ]
```

After successful API response:

```text
refresh leads
refresh admissions
close modal
show success toast
```

Lead should then show:

```text
status = ADMITTED
```

---

# Admissions Tab

Use another shadcn table.

Columns:

```text
Candidate
Phone
Email
Course
Source
Admitted By
Admission Date
```

Example:

```text
Rahul Das
9876543210
rahul@gmail.com
B.Tech CSE
WEBSITE
Suraj
24 Sep 2026
```

Keep this view read-only unless later requirements change.

---

# Create Counsellor

Admin should have:

```text
[ Add Counsellor ]
```

button.

Open a modal.

Fields:

```text
Name
Email
Phone
Password
```

Submit to:

```text
POST /api/admin/counsellors
```

Do not expose role input.

Backend automatically creates:

```text
role = COUNSELLOR
```

---

# Add Lead

Admin should have:

```text
[ Add Lead ]
```

button.

Open modal.

Fields:

```text
Name
Phone
Email
Course Interest
Query
Source
Assigned Counsellor
```

Assigned Counsellor is optional.

Payload example:

```json
{
  "name": "Rahul Das",
  "phone": "9876543210",
  "email": "rahul@gmail.com",
  "courseInterest": "B.Tech CSE",
  "query": "Asked about fees",
  "source": "PHONE",
  "assignedTo": 3
}
```

---

# Counsellor Dashboard

Counsellor uses the same:

```text
/dashboard
```

but sees restricted information.

A counsellor must only see leads returned for their authenticated account.

Example:

```text
Harry
JWT id = 1
```

Harry should only receive:

```text
assigned_to = 1
```

leads.

Harry must never see or modify leads where:

```text
assigned_to != 1
```

Do not perform this filtering only on the frontend.

The backend is the source of truth.

---

# Counsellor Leads

Use the same table/component where possible.

Counsellor can:

```text
View own leads
Add lead
Set reachout
Set assessment
Set priority
Set status
Admit passed lead
```

Counsellor cannot:

```text
Reassign lead to another counsellor
View other counsellors' leads
Manage counsellor accounts
```

When a Counsellor manually creates a lead, backend should assign it automatically to that Counsellor.

Do not show `assignedTo` in the Counsellor creation form.

---

# Counsellor Admissions

Counsellor can see admissions relevant to their own work.

Show Admissions in the same dashboard using:

```text
[ Leads ] [ Admissions ]
```

Use the same admissions table component where practical.

Do not duplicate UI unnecessarily.

---

# Suggested Frontend Structure

```text
/app
  /page.tsx

  /contact
    page.tsx

  /login
    page.tsx

  /dashboard
    page.tsx


/features
  /home
    HomePage.tsx

  /contact
    ContactPage.tsx
    ContactForm.tsx

  /auth
    LoginPage.tsx
    LoginForm.tsx

  /dashboard
    DashboardPage.tsx
    DashboardStats.tsx

  /leads
    LeadsTable.tsx
    ManageLeadModal.tsx
    AddLeadModal.tsx

  /admissions
    AdmissionsTable.tsx
    AdmitLeadModal.tsx

  /counsellors
    AddCounsellorModal.tsx


/components
  reusable shared UI only


/types
  /auth
  /leads
  /admissions
  /counsellors


/lib
  API utilities and shared helpers


/proxy.ts
```

---

# Component Rules

Reuse components when Admin and Counsellor share the same visual behavior.

Example:

```text
LeadsTable
ManageLeadModal
AdmissionsTable
AdmitLeadModal
```

Do not create:

```text
AdminLeadsTable
CounsellorLeadsTable
```

if both can be handled through props and returned data.

Example:

```tsx
<LeadsTable leads={leads} role={user.role} />
```

Use role only to control UI capabilities.

Backend authorization must still exist.

---

# Data Loading

Keep API calls straightforward.

Example flow:

```text
Dashboard mounts
      ↓
Get authenticated user
      ↓
Role known
      ↓
ADMIN
→ /api/admin/leads
→ /api/admin/admissions

COUNSELLOR
→ /api/counsellor/leads
→ /api/counsellor/admissions
```

Show loading states while requests are running.

Show empty states such as:

```text
No leads found.
No admissions yet.
```

Show toast messages for successful and failed mutations.

---

# UI Direction

Use:

* shadcn Table
* Dialog
* Sheet where appropriate
* Select
* Badge
* Button
* Card
* Input
* Textarea
* Tabs
* Sonner/toast

Keep styling professional and restrained.

Avoid unnecessary animations.

Use clear status badges for:

```text
NEW
CONTACTED
INTERESTED
ADMITTED
FAILED
HIGH
NORMAL
LOW
```

Keep mobile responsiveness reasonable, but prioritize a strong desktop dashboard experience.

---

# Code Quality

Keep feature code compact and readable.

Do not split basic functionality into unnecessary abstractions.

Keep related state and handlers close together.

Short JSX props can remain on one line:

```tsx
<Button disabled={!canAdmit} onClick={handleAdmit}>Admit Candidate</Button>
```

Long JSX should be formatted naturally.

Do not create excessive blank lines inside functions.

Do not turn simple 5–10 line logic into large abstractions.

Prefer understandable code over clever code.

Add comments only when logic is genuinely non-obvious.

Follow existing project conventions before creating new patterns.
