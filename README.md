# AppTracker

A comprehensive job application tracking system that helps users manage their job search journey. Track applications, set reminders, manage contacts, and gain insights into your job search progress.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Status](#project-status)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Security](#security)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Application Management

- Create and track job applications with company details, position, salary, and status
- Track applications through multiple statuses: APPLIED, INTERVIEW, OFFER, ACCEPTED, REJECTED, WITHDRAWN
- Assign priority levels: LOW, MEDIUM, HIGH
- Import applications from CSV/spreadsheet files
- Upload and store job descriptions, offer letters, and resumes via Cloudflare R2

### Application Details

- Add detailed notes and observations for each application
- Manage recruiter and hiring manager contact information
- Track all interactions and updates with activity logs
- Set reminders for follow-ups and interview preparations

### Job Discovery

- Browse and search available job postings
- Quick add discovered jobs to your application list

### Analytics and Insights

- View application statistics and job search trends on dashboard
- Track application distribution by status and priority
- Visualize applications by status in a Kanban board with drag-and-drop

### Authentication and Security

- Register with email/password authentication
- Email verification required on signup
- Password reset functionality with email verification
- OAuth2 integration with Google and GitHub
- JWT token-based API security

### User Management

- Manage account preferences in settings
- Update user profile information
- Securely delete account and all associated data

## Tech Stack

### Backend

- Framework: Spring Boot 3.1.0
- Language: Java 17
- Database: PostgreSQL 15
- ORM: Hibernate/JPA
- Security: Spring Security 6, JWT (jjwt)
- Cloud Storage: Cloudflare R2 (AWS S3 compatible)
- Email: Spring Mail (Gmail SMTP)
- Database Migration: Flyway
- Build Tool: Maven

### Frontend

- Framework: React 18
- Language: TypeScript
- Styling: Tailwind CSS
- Build Tool: Vite
- HTTP Client: Axios
- Routing: React Router v6
- Icons: Lucide React
- Toast Notifications: Sonner

### DevOps

- Version Control: Git
- Package Management: npm (frontend), Maven (backend)

## Project Status

Current Version: 1.0.0
Status: Ready for Production Deployment

### Project Status

This project is mainly completed and is being maintained by me.
Some improvements that are currently being made are rate limiting as well as unit, E2E, and integration testing.

## Getting Started

### Prerequisites

**Backend:**

- Java 17 or higher
- Maven 3.8+
- PostgreSQL 13+

**Frontend:**

- Node.js 16+ and npm 8+

**External Services:**

- Gmail account (for email verification)
- Cloudflare R2 account (for file storage)
- Google OAuth2 credentials (optional)
- GitHub OAuth2 credentials (optional)

### Installation

#### Backend Setup

1. Clone the repository

   ```bash
   git clone https://github.com/abhihari010/AppTracker.git
   cd AppTracker/backend
   ```

2. Create PostgreSQL database:

```sql
CREATE DATABASE apptracker;
```

3. Set environment variables (create `backend/env-dev.ps1`):

```powershell
$env:DATABASE_URL = "jdbc:postgresql://localhost:5432/apptracker"
$env:DATABASE_USER = "postgres"
$env:DATABASE_PASSWORD = "your_password"
$env:JWT_SECRET = "your-secret-key-min-32-characters"
$env:R2_ACCOUNT_ID = "your-account-id"
$env:R2_ACCESS_KEY_ID = "your-access-key"
$env:R2_SECRET_ACCESS_KEY = "your-secret-key"
$env:R2_BUCKET = "apptracker"
$env:R2_ENDPOINT = "https://<your-account>.r2.cloudflarestorage.com"
$env:MAIL_HOST = "smtp.gmail.com"
$env:MAIL_PORT = "587"
$env:MAIL_USER = "your-email@gmail.com"
$env:MAIL_PASSWORD = "your-app-password"
$env:GOOGLE_CLIENT_ID = "your-google-client-id"
$env:GOOGLE_CLIENT_SECRET = "your-google-client-secret"
```

4. Run backend:

```powershell
cd backend
./env-dev.ps1
mvn spring-boot:run
```

Backend will start on http://localhost:8080

#### Frontend Setup

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Create `.env` file:

```
VITE_API_URL=http://localhost:8080/api
```

3. Run frontend:

```bash
npm run dev
```

Frontend will start on http://localhost:5173

## Project Structure

### Backend

```
backend
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com
│   │   │       └── example
│   │   │           ├── AppTrackerApplication.java
│   │   │           ├── config
│   │   │           ├── controller
│   │   │           ├── model
│   │   │           ├── repository
│   │   │           ├── security
│   │   │           └── service
│   │   └── resources
│   │       ├── db
│   │       │   └── migration
│   │       ├── application.properties
│   │       └── static
│   └── test
└── pom.xml
```

### Frontend

```
frontend
├── public
├── src
│   ├── components
│   ├── hooks
│   ├── pages
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── index.html
└── package.json
```

## Security

- Environment variables for all sensitive data
- Sessions in httpOnly cookies: 15-minute JWT access token, 30-day rotating refresh token stored only as a hash
- CSRF protection through SameSite cookies and a required `X-Requested-With` header
- Password reset tokens with 1-hour expiration
- BCrypt hashing with salt rounds
- CORS configuration for frontend domain
- SQL injection protection via JPA/Hibernate
- XSS protection via content encoding
- File upload validation and type checking
- User ownership verification on all API endpoints

## Deployment

`vercel.json` proxies `/api` to the backend so session cookies are first-party. If the backend URL changes, update it there.

Backend environment variables this depends on:

- `FRONTEND_URL`: the exact frontend origin, used for CORS, email links and the OAuth redirect
- `TRUST_PROXY_HEADERS=true`: otherwise every user shares one rate limit bucket

Keep `VITE_API_URL` set to the backend URL in Vercel. OAuth sign-in starts there directly.

### Production Checklist

- [ ] Environment variables configured
- [ ] Database backups automated
- [ ] HTTPS/TLS enabled
- [ ] CORS updated for production domain
- [ ] Monitoring and logging setup
- [ ] Rate limiting configured
- [ ] CDN setup for static assets
- [ ] Database indexes verified
- [ ] Error handling and alerts configured

## Contributing

Not currently accepting contributions. This is a personal project.

## License

MIT License
