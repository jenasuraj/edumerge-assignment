# Backend Implementation Spec

## Scope

Implement the backend for the Admission Lead Management System using Next.js Route Handlers.

Backend location:

```text
/app/api
```

Tech:

```text
Next.js
TypeScript
PostgreSQL
Neon DB
pg driver
JWT
HTTP-only cookie
```

Use normal readable code:

```ts
try {
  const result = await db.query(...);
  return Response.json(...);
} catch (error) {
  return Response.json(..., { status: 500 });
}
```

Do not over-engineer route handlers or introduce unnecessary abstractions.

Database connection must come from:

```text
/lib/db.ts
```

---

# Authentication

Authentication is shared between Admin and Counsellor.

JWT must be stored inside an HTTP-only cookie.

JWT payload:

```ts
{
  id: number;
  email: string;
  role: "ADMIN" | "COUNSELLOR";
}
```

Every protected API must:

```text
1. Read JWT from cookie
2. Verify JWT
3. Extract id, email and role
4. Check whether the role is allowed to perform the operation
5. Execute the database query
```

Never trust a role or user ID coming from the request body when the same information is available from the JWT.

---

# API Structure

Use:

```text
/app/api
  /auth
    /login
      route.ts

  /admin
    /counsellors
      route.ts

    /leads
      route.ts

    /leads/action
      route.ts

    /leads/reassign
      route.ts

    /admissions
      route.ts

  /counsellor
    /leads
      route.ts

    /leads/action
      route.ts

    /admissions
      route.ts
```

Keep related HTTP operations inside the same `route.ts`.

---

# Auth API

## POST `/api/auth/login`

Used by both Admin and Counsellor.

Payload:

```json
{
  "email": "admin@gmail.com",
  "password": "password"
}
```

Flow:

```text
Find user by email
→ compare password hash
→ generate JWT
→ store JWT in HTTP-only cookie
→ return user information
```

Response:

```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@gmail.com",
    "role": "ADMIN"
  }
}
```

---

# ADMIN APIs

All routes under:

```text
/api/admin
```

must require:

```text
role === "ADMIN"
```

---

## 1. Register Counsellor

### POST `/api/admin/counsellors`

Create a new Counsellor account.

Payload:

```json
{
  "name": "Rahul",
  "email": "rahul@college.com",
  "password": "password",
  "phone": "9876543210"
}
```

Backend must automatically set:

```text
role = COUNSELLOR
is_active = true
```

Password must be hashed before storing.

Do not accept the role from the frontend.

---

## 2. List Counsellors

### GET `/api/admin/counsellors`

Return users where:

```sql
role = 'COUNSELLOR'
```

Useful for:

```text
Counsellor management
Lead assignment dropdown
Lead reassignment
```

---

# Admin Lead APIs

## 3. Create Lead

### POST `/api/admin/leads`

Payload:

```json
{
  "name": "Rahul Das",
  "phone": "9876543210",
  "email": "rahul@gmail.com",
  "courseInterest": "B.Tech CSE",
  "query": "I want to know about fees",
  "source": "PHONE",
  "assignedTo": 2
}
```

`assignedTo` is optional.

Example:

```json
{
  "name": "Rahul Das",
  "phone": "9876543210",
  "courseInterest": "B.Tech CSE",
  "source": "WALK_IN",
  "assignedTo": null
}
```

Default values:

```text
status = NEW
priority = NORMAL
reachout = false
assessment = null
```

Do not require a Counsellor when creating a lead.

---

## 4. View All Leads

### GET `/api/admin/leads`

Admin can view every lead.

Prefer returning the assigned Counsellor name along with the lead using a JOIN.

Expected response structure:

```json
[
  {
    "id": 12,
    "name": "Rahul Das",
    "phone": "9876543210",
    "email": "rahul@gmail.com",
    "courseInterest": "B.Tech CSE",
    "source": "WEBSITE",
    "status": "NEW",
    "priority": "NORMAL",
    "reachout": false,
    "assessment": null,
    "assignedTo": 3,
    "assignedCounsellor": "Suraj",
    "createdAt": "..."
  }
]
```

---

# Lead Actions

Avoid creating one route for every column.

Use a common action API for normal lead updates.

## 5. Update Lead Action

### PATCH `/api/admin/leads/action`

Payload examples:

### Reachout

```json
{
  "leadId": 12,
  "reachout": true
}
```

### Assessment

```json
{
  "leadId": 12,
  "assessment": "Candidate is interested and asked about fees."
}
```

### Status

```json
{
  "leadId": 12,
  "status": "INTERESTED"
}
```

### Priority

```json
{
  "leadId": 12,
  "priority": "HIGH"
}
```

The API may accept multiple allowed fields together:

```json
{
  "leadId": 12,
  "reachout": true,
  "assessment": "Discussed fees and course details.",
  "status": "INTERESTED",
  "priority": "HIGH"
}
```

Only update explicitly allowed lead fields.

Never dynamically allow arbitrary database column names from the frontend.

---

# Lead Reassignment

## 6. Reassign Lead

### PATCH `/api/admin/leads/reassign`

Payload:

```json
{
  "leadId": 12,
  "assignedTo": 5
}
```

Admin can assign or reassign any lead.

To unassign:

```json
{
  "leadId": 12,
  "assignedTo": null
}
```

If a Counsellor ID is provided, verify that:

```text
user exists
AND
role = COUNSELLOR
AND
is_active = true
```

before assigning.

---

# Admission APIs

## 7. Admit Lead

### POST `/api/admin/admissions`

Payload:

```json
{
  "leadId": 12,
  "course": "B.Tech CSE"
}
```

`admitted_by` must come from the authenticated JWT.

Do not send `admittedBy` from the frontend.

Flow:

```text
Validate lead
→ verify it is not already admitted
→ create admissions record
→ admitted_by = JWT user id
→ update leads.status = ADMITTED
```

Admission is the final conversion step for this project.

---

## 8. List Admissions

### GET `/api/admin/admissions`

Admin can view all admitted candidates.

Join:

```text
admissions
+
leads
+
users
```

Example response:

```json
[
  {
    "id": 1,
    "leadId": 12,
    "name": "Rahul Das",
    "phone": "9876543210",
    "email": "rahul@gmail.com",
    "source": "WEBSITE",
    "course": "B.Tech CSE",
    "admittedBy": "Suraj",
    "admissionDate": "..."
  }
]
```

---

# COUNSELLOR APIs

All routes under:

```text
/api/counsellor
```

must require:

```text
role === "COUNSELLOR"
```

Counsellors can perform similar lead operations but must only work with leads they are allowed to manage.

---

## 1. Create Lead

### POST `/api/counsellor/leads`

Payload:

```json
{
  "name": "Rahul Das",
  "phone": "9876543210",
  "email": "rahul@gmail.com",
  "courseInterest": "B.Tech CSE",
  "query": "Interested in admission",
  "source": "WALK_IN"
}
```

For a lead manually created by a Counsellor:

```text
assigned_to = JWT.id
```

Do not allow the Counsellor to assign the new lead to another Counsellor.

---

## 2. View Own Leads

### GET `/api/counsellor/leads`

Return only:

```sql
WHERE assigned_to = JWT.id
```

A Counsellor must not receive another Counsellor's leads.

---

## 3. Update Own Lead

### PATCH `/api/counsellor/leads/action`

Same supported fields as Admin:

```json
{
  "leadId": 12,
  "reachout": true,
  "assessment": "Candidate wants to visit the campus.",
  "status": "INTERESTED",
  "priority": "HIGH"
}
```

Before updating:

```text
Verify lead.assigned_to === JWT.id
```

Otherwise return:

```text
403 Forbidden
```

---

## 4. Admit Own Lead

### POST `/api/counsellor/admissions`

Payload:

```json
{
  "leadId": 12,
  "course": "B.Tech CSE"
}
```

Before admission verify:

```text
lead exists
lead.assigned_to === JWT.id
lead is not already admitted
```

Then:

```text
create admission
admitted_by = JWT.id
lead.status = ADMITTED
```

---

# Public Website Lead API

Website enquiry does not require authentication.

Use:

```text
/api/leads
```

## POST `/api/leads`

Payload:

```json
{
  "name": "Rahul Das",
  "phone": "9876543210",
  "email": "rahul@gmail.com",
  "courseInterest": "B.Tech CSE",
  "query": "I want to know about fees"
}
```

Backend automatically sets:

```text
source = WEBSITE
status = NEW
priority = NORMAL
reachout = false
assessment = null
assigned_to = null
```

Do not accept these system-controlled values from the public frontend.

---

# Database Query Style

Use parameterized PostgreSQL queries.

Correct:

```ts
const result = await db.query(
  `SELECT * FROM leads WHERE assigned_to = $1`,
  [user.id]
);
```

Never:

```ts
db.query(`SELECT * FROM leads WHERE assigned_to = ${user.id}`);
```

Use PostgreSQL parameter placeholders:

```text
$1
$2
$3
```

---

# Response Convention

Successful:

```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": {}
}
```

Validation or permission failure:

```json
{
  "success": false,
  "message": "You are not allowed to modify this lead"
}
```

Use suitable HTTP status codes:

```text
200 → successful fetch/update
201 → created
400 → invalid payload
401 → unauthenticated
403 → authenticated but unauthorized
404 → resource not found
409 → duplicate/conflict
500 → unexpected server error
```

---

# Implementation Rules

* Use `pg` for all PostgreSQL operations.
* Use Neon PostgreSQL.
* Use parameterized queries.
* Use `try/catch`.
* Keep route code human-readable.
* Avoid unnecessary helper layers.
* Do not create an API file for every tiny field.
* Keep related operations grouped by module.
* Extract reusable auth/JWT logic into `/lib` when repeated.
* Never trust role/user identity from request bodies.
* Use JWT identity for authorization.
* Admin can access all leads.
* Counsellor can access only permitted/assigned leads.
* Public users can only create website enquiries.
* Do not add unrelated ERP functionality.