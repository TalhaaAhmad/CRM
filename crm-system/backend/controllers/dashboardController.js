const Order = require('../models/Order');
const Employee = require('../models/Employee');
const SalarySlip = require('../models/SalarySlip');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get this month's date range
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Orders statistics
    const totalOrders = await Order.countDocuments();
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
    });
    const monthOrders = await Order.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });

    // Employee statistics
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'active' });
    const onLeaveEmployees = await Employee.countDocuments({ status: 'on-leave' });

    // Calculate total monthly salary
    const employees = await Employee.find({ status: 'active' });
    const totalMonthlySalary = employees.reduce((sum, emp) => sum + emp.salary, 0);

    // Salary statistics for current month
    const currentMonth = today.toISOString().slice(0, 7); // YYYY-MM format
    const monthSalarySlips = await SalarySlip.find({ month: currentMonth });
    const totalSalaryPaid = monthSalarySlips
      .filter((slip) => slip.status === 'paid')
      .reduce((sum, slip) => sum + slip.netSalary, 0);
    const pendingSalaryAmount = monthSalarySlips
      .filter((slip) => slip.status === 'generated')
      .reduce((sum, slip) => sum + slip.netSalary, 0);

    // Recent orders (last 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('customerName status createdAt orderAmount');

    // Recent employees (last 5)
    const recentEmployees = await Employee.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name role department status joiningDate');

    // Order trends (last 6 months)
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
    const orderTrends = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Format order trends
    const formattedTrends = orderTrends.map((trend) => ({
      month: `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}`,
      orders: trend.count,
    }));

    res.status(200).json({
      success: true,
      data: {
        orders: {
          total: totalOrders,
          today: todayOrders,
          thisMonth: monthOrders,
          byStatus: {
            pending: pendingOrders,
            processing: processingOrders,
            shipped: shippedOrders,
            delivered: deliveredOrders,
          },
        },
        employees: {
          total: totalEmployees,
          active: activeEmployees,
          onLeave: onLeaveEmployees,
          totalMonthlySalary,
        },
        salary: {
          currentMonth: currentMonth,
          totalPaid: totalSalaryPaid,
          pendingAmount: pendingSalaryAmount,
          totalSlips: monthSalarySlips.length,
        },
        recent: {
          orders: recentOrders,
          employees: recentEmployees,
        },
        trends: {
          orders: formattedTrends,
        },
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get quick stats for dashboard cards
// @route   GET /api/dashboard/quick-stats
// @access  Private
exports.getQuickStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get counts
    const [
      totalOrders,
      todayOrders,
      totalEmployees,
      pendingOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Employee.countDocuments({ status: 'active' }),
      Order.countDocuments({ status: 'pending' }),
    ]);

    // Calculate total revenue from delivered orders this month
    const monthRevenue = await Order.aggregate([
      {
        $match: {
          status: 'delivered',
          createdAt: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$orderAmount' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        todayOrders,
        totalEmployees,
        pendingOrders,
        monthRevenue: monthRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
