# HealthCoreAPI Frontend Documentation

This document provides comprehensive documentation for the HealthCoreAPI frontend application built with React, TypeScript, and Feature-Sliced Design (FSD) architecture.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Modules & Features](#modules--features)
- [Authentication](#authentication)
- [Development](#development)
- [Testing](#testing)

---

## Overview

The HealthCoreAPI frontend is a modern, full-featured healthcare management interface that connects to the Django REST API backend. It provides a complete user experience for managing appointments, pharmacy operations, patient records, and administrative functions.

### Key Capabilities

- **Bilingual Support**: Full PT/EN internationalization
- **Role-Based UI**: Different views for Admins, Doctors, Nurses, Patients
- **AI Integration**: Drug information assistant, feedback analysis
- **Real-time Updates**: Health checks, appointment notifications
- **Secure Authentication**: JWT with Google OAuth support

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18 | UI framework |
| **TypeScript** | 5+ | Type-safe JavaScript |
| **Vite** | 5+ | Build tool & dev server |
| **Tailwind CSS** | 3+ | Utility-first styling |
| **i18next** | Latest | Internationalization |
| **React Router** | 6+ | Client-side routing |
| **Axios** | Latest | HTTP client |

---

## Architecture

### Feature-Sliced Design (FSD)

The frontend follows **Feature-Sliced Design** architecture, a proven pattern for scalable React applications.

```
src/
├── app/           # Application initialization, providers
├── pages/         # Route components
├── widgets/       # Composite UI blocks
├── features/      # Business logic & user interactions
├── entities/      # Business domain models
└── shared/        # Reusable utilities & components
```

### Layer Responsibilities

| Layer | Purpose | Examples |
|-------|---------|----------|
| **app/** | App bootstrap, global providers | Router, AuthProvider, ThemeProvider |
| **pages/** | Route entry points | LandingPage, DashboardPage, LoginPage |
| **widgets/** | Large UI sections | Navbar, Sidebar, Footer, DashboardCards |
| **features/** | Business features | auth, pharmacy, scheduling |
| **entities/** | Domain models | Patient, Appointment, Medication |
| **shared/** | Shared utilities | Button, Card, API client, hooks |

### Import Rules

```
app → pages → widgets → features → entities → shared
```

- Lower layers **cannot** import from higher layers
- Same-layer imports are allowed
- `shared/` has no dependencies

---

## Project Structure

```
frontend/
├── src/
│   ├── app/                      # App initialization
│   │   ├── App.tsx              # Root component
│   │   ├── providers/           # Context providers
│   │   └── styles/              # Global styles
│   │
│   ├── pages/                    # Route components
│   │   ├── landing/             # Landing page module
│   │   └── dqr-health/          # Main application
│   │       ├── dashboard/       # Dashboard page
│   │       ├── appointments/    # Appointments page
│   │       ├── pharmacy/        # Pharmacy page
│   │       └── admin/           # Admin area
│   │
│   ├── widgets/                  # Composite UI blocks
│   │   ├── landing/             # Landing page widgets
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── TechStack.tsx
│   │   │   └── Footer.tsx
│   │   └── dqr-health/          # App widgets
│   │       └── Sidebar.tsx
│   │
│   ├── features/                 # Business features
│   │   ├── auth/                # Authentication
│   │   │   ├── context/         # AuthContext, AuthProvider
│   │   │   ├── components/      # ProtectedRoute, LoginForm
│   │   │   ├── hooks/           # useAuth
│   │   │   └── pages/           # LoginPage, OAuthCallback
│   │   ├── pharmacy/            # Pharmacy module
│   │   │   ├── components/      # InventoryTable, DispenseForm
│   │   │   ├── pages/           # InventoryPage, DispensePage
│   │   │   └── api.ts           # Pharmacy API calls
│   │   ├── scheduling/          # Scheduling module
│   │   │   ├── components/      # Calendar, AppointmentCard
│   │   │   └── pages/           # SchedulePage
│   │   └── patients/            # Patient module
│   │
│   ├── modules/                  # Feature modules (legacy)
│   │   ├── landing/             # Landing page components
│   │   └── dqr-health/          # Main app services
│   │       └── services/        # API services
│   │
│   ├── shared/                   # Shared utilities
│   │   ├── ui/                  # UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── api/                 # API utilities
│   │   │   ├── client.ts        # Axios instance
│   │   │   └── security.ts      # Secure token storage
│   │   ├── layout/              # Layout components
│   │   └── components/          # Shared components
│   │
│   ├── main.tsx                  # Application entry point
│   └── App.tsx                   # Root component
│
├── public/
│   └── images/
│       └── project/             # Project screenshots
│
├── index.html                    # HTML template
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── vite.config.ts                # Vite configuration
├── tailwind.config.js            # Tailwind configuration
└── Dockerfile                    # Container configuration
```

---

## Modules & Features

### 💊 Pharmacy Module

**Path**: `src/features/pharmacy/`

Complete medication management with AI assistance.

**Features**:
- Inventory management with real-time stock levels
- Stock alerts (Normal 🟢, Low 🟡, Critical 🔴)
- Medication dispensation with validation
- AI drug information assistant

**Key Components**:
- `InventoryPage` - Main dashboard with medication table
- `DispensePage` - Dispensation form with AI sidebar
- `StockLevelBadge` - Visual stock indicator

**Access Control**: Doctors, Nurses, Pharmacists, Admins

---

### 📅 Scheduling Module

**Path**: `src/features/scheduling/`

Appointment booking and calendar management.

**Features**:
- Calendar view (daily/weekly/monthly)
- Appointment booking with practitioner selection
- Conflict detection
- Appointment notifications

**Key Components**:
- `SchedulePage` - Main scheduling view
- `BookingModal` - Appointment creation
- `AppointmentCard` - Appointment display

---

### 🔐 Auth Module

**Path**: `src/features/auth/`

Complete authentication system with secure token management.

**Features**:
- Email/password login
- Google OAuth integration
- JWT token management (access + refresh)
- Role-based route protection
- Automatic session timeout (30 min inactivity)

**Key Components**:
- `AuthProvider` - Authentication context
- `ProtectedRoute` - Route protection HOC
- `LoginPage` - Login interface
- `OAuthCallbackPage` - OAuth token handling

**Security**:
- Tokens encrypted with XOR + Base64 in localStorage
- 15-minute access token expiry
- 7-day refresh token expiry
- See [ADR-0003](adr/frontend/0003-jwt-browser-storage-strategy.md)

---

### 👤 Admin Module

**Path**: `src/pages/dqr-health/admin/`

Administrative functions for role management.

**Features**:
- Professional role request review
- Credential verification workflow
- User role assignment

---

## Authentication

### Token Storage

Tokens are stored securely in localStorage with encryption:

```typescript
// shared/api/security.ts
const TOKEN_KEYS = {
    ACCESS: 'hc_access_token',
    REFRESH: 'hc_refresh_token',
    USER: 'hc_user_data',
};

// XOR encryption + Base64 encoding
function encrypt(text: string): string { ... }
function decrypt(encrypted: string): string { ... }
```

### Token Lifecycle

| Token | Expiry | Purpose |
|-------|--------|---------|
| Access Token | 15 minutes | API authentication |
| Refresh Token | 7 days | Token refresh |
| Session | 30 min inactive | Auto-logout on inactivity |

### Protected Routes

```typescript
// Usage
<ProtectedRoute requiredRoles={['Doctors', 'Nurses']}>
  <PharmacyPage />
</ProtectedRoute>
```

---

## Development

### Local Development

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
# → http://localhost:5173

# Build for production
npm run build

# Run with Docker
docker-compose up frontend
```

### Environment Variables

```bash
# frontend/.env
VITE_API_URL=http://localhost:8000/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### Adding a New Feature

1. Create folder in `src/features/<feature-name>/`
2. Define types in `types.ts`
3. Create API client in `api.ts`
4. Build components in `components/`
5. Create pages in `pages/`
6. Register routes in router

---

## Testing

```bash
# Run tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific test
npm run test -- --grep="Auth"
```

### Test Structure

```
src/
├── features/auth/__tests__/
│   ├── AuthProvider.test.tsx
│   └── useAuth.test.ts
└── shared/api/__tests__/
    └── security.test.ts
```

---

## Related Documentation

- [ADR-0001: Feature-Sliced Design](adr/frontend/0001-feature-sliced-design-architecture.md)
- [ADR-0002: Healthcare Credential Verification](adr/frontend/0002-healthcare-credential-verification-security.md)
- [ADR-0003: JWT Browser Storage Strategy](adr/frontend/0003-jwt-browser-storage-strategy.md)
- [Frontend Roadmap](../frontend/ROADMAP.md)

---

## Roadmap

See [Frontend ROADMAP](../frontend/ROADMAP.md) for the complete implementation plan:

- **Phase 1**: AI-Enabled Modules (Pharmacy, Experience) ✅
- **Phase 2**: Core Data Management (Patients, Practitioners)
- **Phase 3**: Clinical Operations (Admissions, Scheduling)
- **Phase 4**: Ancillary Services (Results, Orders, Equipment)
- **Phase 5**: Hospital Administration (Departments, Shifts)
