# Job Board Web App – Frontend (Next.js)

This is the frontend of a full-stack Job Board platform where employers can post jobs and employees can browse and apply.

The frontend is built with `Next.js` and consumes a `Django REST` API backend.

## Overview

The platform supports two types of users:

- **Employees** – Browse jobs and apply
- **Employers** – Post, update, and manage jobs

All users interact through a clean, responsive interface powered by `Next.js` App Router, with Role-Based Access Control (RBAC) controlling what each user can see and do.

## Project Structure
```
app/
  (public)/
    jobs/
      page.tsx                # Job listings page
      [jobId]/
        page.tsx              # Job detail page

  (auth)/
    auth/
      login/page.tsx
      register/page.tsx

  (dashboard)/
    dashboard/
      layout.tsx              # Dashboard layout + auth guard
      page.tsx                # Role-based dashboard home
      jobs/
        new/page.tsx          # Employer: Create job
        [jobId]/edit/page.tsx # Employer: Edit job

components/
  jobs/
  dashboard/
  ui/

context/
  AuthContext.tsx             # Authentication & user state
  RoleGate.tsx                # Role-based access wrapper

lib/
  api/
    client.ts                 # Base API config
    jobs.ts                   # Job endpoints
    auth.ts                   # Auth endpoints

hooks/
types/
```


## Tech Stack

| Layer              | Technology                                               |
| ------------------ | -------------------------------------------------------- |
| Framework          | **Next.js (App Router)**                                 |
| Language           | TypeScript                                               |
| Styling            | TailwindCSS                                              |
| State Management   | React Context API                                        |
| Authentication     | JWT                                                      |
| API Communication  | Axios                                                    |
| Backend (external) | Django REST Framework                                    |


## Core Features

### 1. Public Features

- View all available jobs
- View detailed job descriptions
- SEO-friendly server-rendered job pages

### Authentication

- User registration
- User login
- Persistent session handling
- Redirect to login when required

### Employee Features

- Apply for jobs
- View personal dashboard content

### Employer Features

- Create new job listings
- Edit existing job posts
- Delete job posts
- View employer dashboard tools


## Rendering Strategy

| Page         | Type             | Reason                |
| ------------ | ---------------- | --------------------- |
| Job Listings | Server Component | SEO + performance     |
| Job Details  | Server Component | SEO                   |
| Dashboard    | Client Component | Needs user state      |
| Auth Pages   | Client Component | Forms & interactivity |


# Getting Started
### 1. Clone the repository
```
git clone https://github.com/yourusername/job-board-frontend.git

cd job-board-frontend
```

### 2. Install dependencies
```
pnpm install
```

### 3. Set environment variables

Create `.env.local` file:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

### 4. Run the development server

```
pnpm dev
````

App will run on:

http://localhost:3000

## Future Improvements

- Saved jobs feature
- Job search & filtering
- Pagination / infinite scroll
- Email notifications
- Employer analytics dashboard
- Admin moderation panel

## Key Architectural Decisions

- **App Router** for scalable routing and layouts
- **Context API** instead of Redux for lightweight global state
- **Centralized API layer** for clean UI components
- **Role-based UI rendering** instead of separate dashboards
- **Server-rendered public pages** for SEO and performance

## License

This project is licensed under the MIT License.