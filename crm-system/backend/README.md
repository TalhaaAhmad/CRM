# CRM Backend API

Node.js + Express + MongoDB backend for the CRM System.

## Features

- **Authentication**: JWT-based auth with bcrypt password hashing
- **Orders Management**: Full CRUD operations with status tracking
- **Courier Labels**: PDF generation for shipping labels
- **Employee Management**: Employee records with salary tracking
- **Salary Slips**: Automated salary slip generation with PDF download
- **Dashboard**: Statistics and analytics

## Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- PDFKit for PDF generation

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crm-system
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

## Running the Server

```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

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
- `POST /api/courier/generate-labels` - Generate PDF labels for orders
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
- `GET /api/dashboard/quick-stats` - Get quick stats for cards

## Default Admin User

After starting the server, you can create an admin user by sending a POST request to `/api/auth/register`:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin"
}
```

## Project Structure

```
backend/
├── config/
│   └── database.js       # Database connection
├── controllers/
│   ├── authController.js
│   ├── orderController.js
│   ├── courierController.js
│   ├── employeeController.js
│   ├── salaryController.js
│   └── dashboardController.js
├── middleware/
│   └── auth.js           # JWT authentication middleware
├── models/
│   ├── User.js
│   ├── Order.js
│   ├── Employee.js
│   └── SalarySlip.js
├── routes/
│   ├── authRoutes.js
│   ├── orderRoutes.js
│   ├── courierRoutes.js
│   ├── employeeRoutes.js
│   ├── salaryRoutes.js
│   └── dashboardRoutes.js
├── uploads/              # Generated PDFs storage
├── .env
├── .env.example
├── package.json
├── README.md
└── server.js
```
