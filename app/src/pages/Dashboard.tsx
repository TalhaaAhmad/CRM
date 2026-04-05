import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '@/services/api';
import type { DashboardStats, QuickStats } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ShoppingCart,
  Users,
  Clock,
  TrendingUp,
  Package,
  CheckCircle,
  Truck,
  XCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const [statsRes, quickRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getQuickStats(),
      ]);
      setStats(statsRes.data.data as DashboardStats);
      setQuickStats(quickRes.data.data as QuickStats);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Orders',
      value: quickStats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      title: "Today's Orders",
      value: quickStats?.todayOrders || 0,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: 'Active Employees',
      value: quickStats?.totalEmployees || 0,
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      title: 'Pending Orders',
      value: quickStats?.pendingOrders || 0,
      icon: Clock,
      color: 'bg-orange-500',
    },
  ];

  const orderStatusCards = [
    {
      label: 'Pending',
      value: stats?.orders.byStatus.pending || 0,
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Processing',
      value: stats?.orders.byStatus.processing || 0,
      icon: Package,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Shipped',
      value: stats?.orders.byStatus.shipped || 0,
      icon: Truck,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
    },
    {
      label: 'Delivered',
      value: stats?.orders.byStatus.delivered || 0,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Cancelled',
      value: stats?.orders.byStatus.cancelled || 0,
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.title}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {orderStatusCards.map((status, index) => (
              <div
                key={index}
                className={`${status.bgColor} rounded-lg p-4 text-center`}
              >
                <status.icon className={`w-8 h-8 ${status.color} mx-auto mb-2`} />
                <p className="text-2xl font-bold text-slate-900">{status.value}</p>
                <p className={`text-sm font-medium ${status.color}`}>{status.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Order Trends (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats?.trends.orders || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Employee & Salary Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Employee & Salary Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm text-slate-500">Total Employees</p>
                <p className="text-2xl font-bold">{stats?.employees.total || 0}</p>
              </div>
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm text-slate-500">Active Employees</p>
                <p className="text-2xl font-bold">{stats?.employees.active || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm text-slate-500">Monthly Salary Budget</p>
                <p className="text-2xl font-bold">
                  Rs. {(stats?.employees.totalMonthlySalary || 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm text-slate-500">Salary Paid (Current Month)</p>
                <p className="text-2xl font-bold">
                  Rs. {(stats?.salary.totalPaid || 0).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Pending</p>
                <p className="text-sm font-medium text-orange-500">
                  Rs. {(stats?.salary.pendingAmount || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recent.orders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-slate-900">{order.customerName}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'delivered'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'pending'
                          ? 'bg-orange-100 text-orange-800'
                          : order.status === 'processing'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'shipped'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {order.status}
                    </span>
                    <p className="text-sm font-medium mt-1">
                      Rs. {order.orderAmount?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              ))}
              {(!stats?.recent.orders || stats.recent.orders.length === 0) && (
                <p className="text-center text-slate-500 py-4">No recent orders</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Employees */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recent.employees.map((employee) => (
                <div
                  key={employee._id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-slate-900">{employee.name}</p>
                    <p className="text-sm text-slate-500">
                      {employee.role} • {employee.department}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        employee.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : employee.status === 'on-leave'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {employee.status}
                    </span>
                    <p className="text-sm font-medium mt-1">
                      Joined: {new Date(employee.joiningDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!stats?.recent.employees || stats.recent.employees.length === 0) && (
                <p className="text-center text-slate-500 py-4">No recent employees</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
