const PDFDocument = require('pdfkit');
const SalarySlip = require('../models/SalarySlip');
const Employee = require('../models/Employee');
const fs = require('fs');
const path = require('path');

// @desc    Get all salary slips
// @route   GET /api/salary
// @access  Private
exports.getSalarySlips = async (req, res) => {
  try {
    let query = {};

    // Filter by employee
    if (req.query.employeeId) {
      query.employee = req.query.employeeId;
    }

    // Filter by month
    if (req.query.month) {
      query.month = req.query.month;
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    const salarySlips = await SalarySlip.find(query)
      .populate('employee', 'name email phone role department photo cnic joiningDate address')
      .populate('generatedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: salarySlips.length,
      data: salarySlips,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get single salary slip
// @route   GET /api/salary/:id
// @access  Private
exports.getSalarySlip = async (req, res) => {
  try {
    const salarySlip = await SalarySlip.findById(req.params.id)
      .populate('employee', 'name email phone role department joiningDate photo cnic address')
      .populate('generatedBy', 'name');

    if (!salarySlip) {
      return res.status(404).json({
        success: false,
        error: 'Salary slip not found',
      });
    }

    res.status(200).json({
      success: true,
      data: salarySlip,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Generate salary slip
// @route   POST /api/salary/generate
// @access  Private
exports.generateSalarySlip = async (req, res) => {
  try {
    const {
      employeeId,
      month,
      basicSalary,
      workingDays,
      bonus,
      overtime,
      advance,
      paymentMethod,
      bankDetails,
      notes,
    } = req.body;

    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found',
      });
    }

    // Check if salary slip already exists for this employee and month
    const existingSlip = await SalarySlip.findOne({
      employee: employeeId,
      month,
    });

    if (existingSlip) {
      return res.status(400).json({
        success: false,
        error: 'Salary slip already exists for this employee and month',
      });
    }

    const safeBonus = bonus || 0;
    const safeOvertime = overtime || { hours: 0, rate: 0 };
    const overtimeAmount = (safeOvertime.hours || 0) * (safeOvertime.rate || 0);
    safeOvertime.amount = overtimeAmount;

    const grossSalary = (basicSalary || 0) + safeBonus + overtimeAmount;
    const totalDeductions = (advance || 0);
    const netSalary = grossSalary - totalDeductions;

    // Create salary slip instance
    const salarySlip = new SalarySlip({
      employee: employeeId,
      month,
      basicSalary,
      workingDays,
      bonus: safeBonus,
      overtime: safeOvertime,
      advance,
      paymentMethod,
      bankDetails,
      notes,
      generatedBy: req.user.id,
      status: 'generated',
    });

    await salarySlip.save();

    await salarySlip.populate('employee', 'name email phone role department photo cnic joiningDate address');

    res.status(201).json({
      success: true,
      data: salarySlip,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Update salary slip
// @route   PUT /api/salary/:id
// @access  Private
exports.updateSalarySlip = async (req, res) => {
  try {
    let salarySlip = await SalarySlip.findById(req.params.id);

    if (!salarySlip) {
      return res.status(404).json({
        success: false,
        error: 'Salary slip not found',
      });
    }

    // Don't allow updates if already paid
    if (salarySlip.status === 'paid' && req.body.status !== 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Cannot modify a paid salary slip',
      });
    }

    // Update fields
    Object.assign(salarySlip, {
      basicSalary: req.body.basicSalary,
      workingDays: req.body.workingDays,
      bonus: req.body.bonus,
      overtime: req.body.overtime,
      advance: req.body.advance,
      paymentMethod: req.body.paymentMethod,
      bankDetails: req.body.bankDetails,
      notes: req.body.notes,
    });

    await salarySlip.save();

    await salarySlip.populate('employee', 'name email phone role department photo cnic joiningDate address');

    res.status(200).json({
      success: true,
      data: salarySlip,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Delete salary slip
// @route   DELETE /api/salary/:id
// @access  Private
exports.deleteSalarySlip = async (req, res) => {
  try {
    const salarySlip = await SalarySlip.findById(req.params.id);

    if (!salarySlip) {
      return res.status(404).json({
        success: false,
        error: 'Salary slip not found',
      });
    }

    // Don't allow deletion if already paid
    if (salarySlip.status === 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete a paid salary slip',
      });
    }

    await salarySlip.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Mark salary slip as paid
// @route   PUT /api/salary/:id/pay
// @access  Private
exports.markAsPaid = async (req, res) => {
  try {
    let salarySlip = await SalarySlip.findById(req.params.id);

    if (!salarySlip) {
      return res.status(404).json({
        success: false,
        error: 'Salary slip not found',
      });
    }

    salarySlip.status = 'paid';
    salarySlip.paidDate = new Date();
    await salarySlip.save();

    await salarySlip.populate('employee', 'name email role department photo cnic');

    res.status(200).json({
      success: true,
      data: salarySlip,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Download salary slip PDF
// @route   GET /api/salary/:id/download
// @access  Private
exports.downloadSalarySlip = async (req, res) => {
  try {
    const salarySlip = await SalarySlip.findById(req.params.id).populate(
      'employee',
      'name email role department joiningDate address photo cnic'
    );

    if (!salarySlip) {
      return res.status(404).json({
        success: false,
        error: 'Salary slip not found',
      });
    }

    const employee = salarySlip.employee;

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    const filename = `salary-slip-${employee.name.replace(/\s+/g, '-').toLowerCase()}-${salarySlip.month}.pdf`;
    const filepath = path.join(__dirname, '../uploads', filename);

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Header
    doc.fontSize(24).font('Helvetica-Bold');
    doc.text('SALARY SLIP', { align: 'center' });

    doc.moveDown();
    doc.fontSize(12).font('Helvetica');
    doc.text(`For the month of: ${salarySlip.month}`, { align: 'center' });

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#000000');
    doc.moveDown();

    // Employee Details
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('Employee Information');
    doc.moveDown(0.5);

    doc.fontSize(11).font('Helvetica');
    doc.text(`Name: ${employee.name}`);
    doc.text(`Department: ${employee.department}`);
    doc.text(`Role: ${employee.role}`);
    doc.text(`Joining Date: ${new Date(employee.joiningDate).toLocaleDateString()}`);

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#cccccc');
    doc.moveDown();

    // Earnings
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('Earnings');
    doc.moveDown(0.5);

    doc.fontSize(11).font('Helvetica');
    doc.text(`Basic Salary: Rs. ${salarySlip.basicSalary.toLocaleString()}`);
    doc.text(`Housing Allowance: Rs. ${salarySlip.allowances.housing.toLocaleString()}`);
    doc.text(`Transport Allowance: Rs. ${salarySlip.allowances.transport.toLocaleString()}`);
    doc.text(`Medical Allowance: Rs. ${salarySlip.allowances.medical.toLocaleString()}`);
    doc.text(`Other Allowances: Rs. ${salarySlip.allowances.other.toLocaleString()}`);
    doc.text(`Bonus: Rs. ${salarySlip.bonus.toLocaleString()}`);
    if (salarySlip.overtime.amount > 0) {
      doc.text(`Overtime (${salarySlip.overtime.hours} hrs @ Rs. ${salarySlip.overtime.rate}/hr): Rs. ${salarySlip.overtime.amount.toLocaleString()}`);
    }

    doc.moveDown();
    doc.font('Helvetica-Bold');
    doc.text(`Gross Salary: Rs. ${salarySlip.grossSalary.toLocaleString()}`);
    doc.font('Helvetica');

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#cccccc');
    doc.moveDown();

    // Deductions
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('Deductions');
    doc.moveDown(0.5);

    doc.fontSize(11).font('Helvetica');
    doc.text(`Tax: Rs. ${salarySlip.deductions.tax.toLocaleString()}`);
    doc.text(`Insurance: Rs. ${salarySlip.deductions.insurance.toLocaleString()}`);
    doc.text(`Leave Deductions: Rs. ${salarySlip.deductions.leave.toLocaleString()}`);
    doc.text(`Other Deductions: Rs. ${salarySlip.deductions.other.toLocaleString()}`);

    doc.moveDown();
    doc.font('Helvetica-Bold');
    doc.text(`Total Deductions: Rs. ${salarySlip.totalDeductions.toLocaleString()}`);
    doc.font('Helvetica');

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#000000');
    doc.moveDown();

    // Net Salary
    doc.fontSize(16).font('Helvetica-Bold');
    doc.text(`NET SALARY: Rs. ${salarySlip.netSalary.toLocaleString()}`, { align: 'center' });

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#000000');
    doc.moveDown();

    // Payment Details
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Payment Details');
    doc.moveDown(0.5);

    doc.fontSize(11).font('Helvetica');
    doc.text(`Payment Method: ${salarySlip.paymentMethod.replace('-', ' ').toUpperCase()}`);
    if (salarySlip.bankDetails && salarySlip.bankDetails.accountNumber) {
      doc.text(`Bank: ${salarySlip.bankDetails.bankName || 'N/A'}`);
      doc.text(`Account Number: ${salarySlip.bankDetails.accountNumber}`);
      doc.text(`Branch: ${salarySlip.bankDetails.branch || 'N/A'}`);
    }
    doc.text(`Status: ${salarySlip.status.toUpperCase()}`);
    if (salarySlip.paidDate) {
      doc.text(`Paid Date: ${new Date(salarySlip.paidDate).toLocaleDateString()}`);
    }

    if (salarySlip.notes) {
      doc.moveDown();
      doc.fontSize(10).font('Helvetica-Oblique');
      doc.text(`Notes: ${salarySlip.notes}`);
    }

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).font('Helvetica');
    doc.text('This is a computer-generated document and does not require a signature.', { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });

    doc.end();

    stream.on('finish', () => {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.sendFile(filepath);
    });

    stream.on('error', (err) => {
      console.error('PDF generation error:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to generate PDF',
      });
    });
  } catch (error) {
    console.error('Download salary slip error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get salary statistics
// @route   GET /api/salary/stats/overview
// @access  Private
exports.getSalaryStats = async (req, res) => {
  try {
    const { month } = req.query;

    let matchQuery = {};
    if (month) {
      matchQuery.month = month;
    }

    const totalSlips = await SalarySlip.countDocuments(matchQuery);
    const paidSlips = await SalarySlip.countDocuments({ ...matchQuery, status: 'paid' });
    const pendingSlips = await SalarySlip.countDocuments({ ...matchQuery, status: 'generated' });
    const draftSlips = await SalarySlip.countDocuments({ ...matchQuery, status: 'draft' });

    // Calculate total amounts
    const stats = await SalarySlip.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalNetSalary: { $sum: '$netSalary' },
          totalGrossSalary: { $sum: '$grossSalary' },
          totalDeductions: { $sum: '$totalDeductions' },
          avgNetSalary: { $avg: '$netSalary' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalSlips,
        paid: paidSlips,
        pending: pendingSlips,
        draft: draftSlips,
        financials: stats[0] || {
          totalNetSalary: 0,
          totalGrossSalary: 0,
          totalDeductions: 0,
          avgNetSalary: 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
