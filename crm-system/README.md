# CRM System

A complete Customer Relationship Management system built with Node.js, Express, MongoDB, and React.

## Features

### Core Modules

1. **Authentication System**
   - JWT-based authentication
   - Secure password hashing with bcrypt
   - Role-based access control (Admin/Staff)

2. **Orders Management**
   - Create, read, update, delete orders
   - Order status tracking (Pending, Processing, Shipped, Delivered, Cancelled)
   - Search and filter orders
   - Order statistics and analytics

3. **Courier Label System**
   - Generate PDF shipping labels
   - Bulk label generation for multiple orders
   - Preview labels before printing
   - Professional label template with tracking numbers

4. **Employee Management**
   - Employee records with full details
   - Department and role management
   - Status tracking (Active, Inactive, On Leave)
   - Emergency contact information

5. **Salary Slip System**
   - Automated salary slip generation
   - Configurable allowances and deductions
   - Overtime calculation
   - PDF download with professional template
   - Payment tracking

6. **Dashboard**
   - Visual analytics with charts
   - Quick statistics cards
   - Recent activity overview
   - Order trends and insights

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- PDFKit for PDF generation
- bcryptjs for password hashing

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- React Router DOM
- Axios
- Recharts for data visualization

## Project Structure

```
crm-system/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── orderController.js
│   │   ├── courierController.js
│   │   ├── employeeController.js
│   │   ├── salaryController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Order.js
│   │   ├── Employee.js
│   │   └── SalarySlip.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── courierRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── salaryRoutes.js
│   │   └── dashboardRoutes.js
│   ├── uploads/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── README.md
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Layout.tsx
    │   │   │   ├── Sidebar.tsx
    │   │   │   └── ProtectedRoute.tsx
    │   │   └── ui/
    │   ├── context/
    │   │   └── AuthContext.tsx
    │   ├── hooks/
    │   │   └── useAuth.ts
    │   ├── pages/
    │   │   ├── Login.tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── Orders.tsx
    │   │   ├── Courier.tsx
    │   │   ├── Employees.tsx
    │   │   └── Salary.tsx
    │   ├── services/
    │   │   └── api.ts
    │   ├── types/
    │   │   └── index.ts
    │   ├── App.tsx
    │   ├── App.css
    │   ├── index.css
    │   └── main.tsx
    ├── .env
    ├── .env.example
    ├── package.json
    ├── README.md
    ├── index.html
    ├── tailwind.config.js
    ├── tsconfig.json
    └── vite.config.ts
```

## Quick Start

### Prerequisites

- Node.js 18+ installed
- MongoDB installed and running
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crm-system
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

4. Start the server:
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

The backend will be running at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Default Login Credentials

After starting the backend, you can create an admin user:

**POST** `http://localhost:5000/api/auth/register`
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin"
}
```

Or use the login endpoint directly if the user already exists:
- Email: `admin@example.com`
- Password: `password123`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/orders/stats/overview` - Get order statistics

### Courier Labels
- `POST /api/courier/generate-labels` - Generate PDF labels
- `GET /api/courier/download/:filename` - Download generated PDF
- `GET /api/courier/preview/:orderId` - Preview single label

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create new employee
- `GET /api/employees/:id` - Get single employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `PUT /api/employees/:id/status` - Update employee status
- `GET /api/employees/stats/overview` - Get employee statistics

### Salary Slips
- `GET /api/salary` - Get all salary slips
- `POST /api/salary/generate` - Generate salary slip
- `GET /api/salary/:id` - Get single salary slip
- `PUT /api/salary/:id` - Update salary slip
- `DELETE /api/salary/:id` - Delete salary slip
- `PUT /api/salary/:id/pay` - Mark as paid
- `GET /api/salary/:id/download` - Download PDF
- `GET /api/salary/stats/overview` - Get salary statistics

### Dashboard
- `GET /api/dashboard` - Get full dashboard statistics
- `GET /api/dashboard/quick-stats` - Get quick stats

## Database Models

### User
- name: String (required)
- email: String (required, unique)
- password: String (required, hashed)
- role: Enum ['admin', 'staff']
- createdAt: Date

### Order
- customerName: String (required)
- phone: String (required)
- address: String (required)
- city: String (required)
- status: Enum ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
- orderAmount: Number
- products: Array
- notes: String
- createdBy: ObjectId (ref: User)
- createdAt: Date

### Employee
- name: String (required)
- email: String
- phone: String
- role: String (required)
- department: String
- salary: Number (required)
- joiningDate: Date
- status: Enum ['active', 'inactive', 'on-leave']
- address: String
- emergencyContact: Object
- createdBy: ObjectId (ref: User)
- createdAt: Date

### SalarySlip
- employee: ObjectId (ref: Employee, required)
- month: String (required, format: YYYY-MM)
- basicSalary: Number (required)
- allowances: Object (housing, transport, medical, other)
- deductions: Object (tax, insurance, leave, other)
- bonus: Number
- overtime: Object (hours, rate, amount)
- grossSalary: Number (calculated)
- totalDeductions: Number (calculated)
- netSalary: Number (calculated)
- paymentMethod: Enum ['bank-transfer', 'cash', 'check']
- bankDetails: Object
- notes: String
- status: Enum ['draft', 'generated', 'paid']
- paidDate: Date
- generatedBy: ObjectId (ref: User)
- createdAt: Date

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Input validation
- CORS enabled
- Environment variable configuration

## Development Timeline

| Phase | Feature | Duration |
|-------|---------|----------|
| 1 | Backend Setup + Auth | 2 days |
| 2 | Orders System | 3 days |
| 3 | Courier Labels | 2 days |
| 4 | Employee System | 2 days |
| 5 | Salary System | 2 days |
| 6 | Dashboard + Frontend | 2-3 days |

**Total: ~12-14 days for MVP**

## Future Enhancements

- [ ] Bulk order upload via CSV
- [ ] WhatsApp API integration for notifications
- [ ] Advanced role-based permissions
- [ ] Data backup and export
- [ ] Pakistan Post API integration
- [ ] Email notifications
- [ ] Multi-language support
- [ ] Dark mode

## License

This project is private and proprietary.

## Support

For support or questions, please contact the development team.
