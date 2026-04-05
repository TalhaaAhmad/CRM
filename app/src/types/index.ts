// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

// Order Types
export interface Order {
  _id: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderAmount: number;
  products: Product[];
  notes?: string;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  name: string;
  quantity: number;
  price: number;
}

export interface OrderFormData {
  customerName: string;
  phone: string;
  address: string;
  city: string;
  status?: string;
  orderAmount?: number;
  products?: Product[];
  notes?: string;
}

// Employee Types
export interface Employee {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  department: string;
  salary: number;
  joiningDate: string;
  status: 'active' | 'inactive' | 'on-leave';
  address?: string;
  cnic?: string;
  photo?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeFormData {
  name: string;
  email?: string;
  phone?: string;
  role: string;
  department?: string;
  salary: number;
  joiningDate?: string;
  status?: string;
  address?: string;
  cnic?: string;
  photo?: File | string | null;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
}

// Salary Slip Types
export interface SalarySlip {
  _id: string;
  employee: Employee;
  month: string;
  basicSalary: number;
  workingDays: number;
  advance: number;
  bonus: number;
  overtime: {
    hours: number;
    rate: number;
    amount: number;
  };
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  paymentMethod: 'bank-transfer' | 'cash' | 'check';
  bankDetails?: {
    accountNumber?: string;
    bankName?: string;
    branch?: string;
  };
  notes?: string;
  status: 'draft' | 'generated' | 'paid';
  paidDate?: string;
  generatedBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface SalarySlipFormData {
  employeeId: string;
  month: string;
  basicSalary: number;
  workingDays?: number;
  advance?: number;
  bonus?: number;
  overtime?: {
    hours?: number;
    rate?: number;
  };
  paymentMethod?: string;
  bankDetails?: {
    accountNumber?: string;
    bankName?: string;
    branch?: string;
  };
  notes?: string;
}

// Dashboard Types
export interface DashboardStats {
  orders: {
    total: number;
    today: number;
    thisMonth: number;
    byStatus: {
      pending: number;
      processing: number;
      shipped: number;
      delivered: number;
      cancelled: number;
    };
  };
  employees: {
    total: number;
    active: number;
    onLeave: number;
    totalMonthlySalary: number;
  };
  salary: {
    currentMonth: string;
    totalPaid: number;
    pendingAmount: number;
    totalSlips: number;
  };
  recent: {
    orders: Order[];
    employees: Employee[];
  };
  trends: {
    orders: Array<{
      month: string;
      orders: number;
    }>;
  };
}

export interface QuickStats {
  totalOrders: number;
  todayOrders: number;
  totalEmployees: number;
  pendingOrders: number;
  monthRevenue: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
  error?: string;
}
