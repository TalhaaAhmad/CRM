# CRM Frontend

React + TypeScript + Vite + Tailwind CSS + shadcn/ui frontend for the CRM System.

## Features

- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **Authentication**: JWT-based authentication with protected routes
- **Dashboard**: Visual analytics with charts and statistics
- **Orders Management**: Full CRUD operations with filtering
- **Courier Labels**: Select orders and generate PDF labels
- **Employee Management**: Employee records and salary tracking
- **Salary Slips**: Generate and download salary slip PDFs

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router DOM
- Axios
- Recharts (for charts)

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## Running the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   └── ProtectedRoute.tsx
│   └── ui/           # shadcn/ui components
├── context/
│   └── AuthContext.tsx
├── hooks/
│   └── useAuth.ts
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Orders.tsx
│   ├── Courier.tsx
│   ├── Employees.tsx
│   └── Salary.tsx
├── services/
│   └── api.ts
├── types/
│   └── index.ts
├── App.tsx
├── App.css
├── index.css
└── main.tsx
```

## Default Login Credentials

- Email: `admin@example.com`
- Password: `password123`

## Available Pages

- `/` - Dashboard with statistics and charts
- `/orders` - Order management (CRUD operations)
- `/courier` - Generate courier labels for orders
- `/employees` - Employee management
- `/salary` - Salary slip generation and management

## API Integration

The frontend communicates with the backend API at `http://localhost:5000/api`. All API calls are handled through the `services/api.ts` file.

## Authentication Flow

1. User logs in with email and password
2. Backend returns JWT token and user data
3. Token is stored in localStorage
4. All subsequent API requests include the token in the Authorization header
5. Protected routes check for valid authentication
6. Token expiration redirects to login page
