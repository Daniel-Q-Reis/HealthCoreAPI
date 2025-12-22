# HealthCoreAPI Frontend

## Project Structure
The frontend is built with React, TypeScript, and Tailwind CSS, following a Feature-Sliced Design (FSD) inspired architecture.

### Key Directories
- `src/features/*`: Business logic and UI components grouped by domain.
    - `auth`: Authentication, Login, RBAC.
    - `pharmacy`: Inventory, Dispensations, AI Assistance.
    - `patients`: Patient management (coming soon).
- `src/shared/*`: Reusable components, hooks, and API clients.
- `src/pages/*`: Route entry points.

## Modules

### 💊 Pharmacy Module (`src/features/pharmacy`)
A comprehensive module for medication management.

**Features:**
- **Inventory Management**: View real-time stock levels.
- **Stock Alerts**:
    - 🟢 > 50 units (Normal)
    - 🟡 25-50 units (Low Stock)
    - 🔴 < 25 units (Critical)
- **Dispensation**: Form to dispense meds to patients with validation.
- **AI Drug Assistant**: Integration with simple AI service to get dosage/interaction info.

**Key Components:**
- `InventoryPage`: Main dashboard table.
- `DispensePage`: Action form with AI sidebar.
- `StockLevelBadge`: Visual indicator component.

**Access Control:**
- Restricted to: Doctors, Nurses, Pharmacists, Admins.

## Development

### Adding a New Feature
1. Create folder in `src/features/<feature-name>`.
2. Define `types.ts` and `api.ts`.
3. Create `components/` and `pages/`.
4. Register routes in `src/pages/dqr-health/index.tsx`.
