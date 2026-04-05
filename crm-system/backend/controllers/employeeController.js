const Employee = require('../models/Employee');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
exports.getEmployees = async (req, res) => {
  try {
    let query = {};

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by department if provided
    if (req.query.department) {
      query.department = req.query.department;
    }

    // Search by name
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }

    const employees = await Employee.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate(
      'createdBy',
      'name email'
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found',
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private
exports.createEmployee = async (req, res) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    console.log('--- CREATE EMPLOYEE ---');
    console.log('Body:', req.body);
    console.log('File:', req.file);

    // Sanitize photo to prevent casting errors
    if (req.body.photo && typeof req.body.photo !== 'string') {
      delete req.body.photo;
    }

    // Handle photo file if uploaded
    if (req.file) {
      req.body.photo = `/uploads/${req.file.filename}`;
    }

    // Handle emergencyContact if it is stringified JSON (common when using FormData)
    if (req.body.emergencyContact && typeof req.body.emergencyContact === 'string') {
      try {
        req.body.emergencyContact = JSON.parse(req.body.emergencyContact);
      } catch (e) {
        // Fallback if not JSON
      }
    }

    const employee = await Employee.create(req.body);

    res.status(201).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private
exports.updateEmployee = async (req, res) => {
  try {
    let employee = await Employee.findById(req.params.id);

    console.log('--- UPDATE EMPLOYEE ---', req.params.id);
    console.log('Body:', req.body);
    console.log('File:', req.file);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found',
      });
    }

    // Sanitize photo to prevent casting errors
    if (req.body.photo && typeof req.body.photo !== 'string') {
      delete req.body.photo;
    }

    // Handle photo file if uploaded
    if (req.file) {
      req.body.photo = `/uploads/${req.file.filename}`;
    }

    // Handle emergencyContact if it is stringified JSON
    if (req.body.emergencyContact && typeof req.body.emergencyContact === 'string') {
      try {
        req.body.emergencyContact = JSON.parse(req.body.emergencyContact);
      } catch (e) {
        // Fallback if not JSON
      }
    }

    employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found',
      });
    }

    await employee.deleteOne();

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

// @desc    Update employee status
// @route   PUT /api/employees/:id/status
// @access  Private
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Please provide status',
      });
    }

    let employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found',
      });
    }

    employee.status = status;
    employee.updatedAt = Date.now();
    await employee.save();

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get employee statistics
// @route   GET /api/employees/stats/overview
// @access  Private
exports.getEmployeeStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'active' });
    const inactiveEmployees = await Employee.countDocuments({ status: 'inactive' });
    const onLeaveEmployees = await Employee.countDocuments({ status: 'on-leave' });

    // Get total monthly salary
    const employees = await Employee.find({ status: 'active' });
    const totalMonthlySalary = employees.reduce((sum, emp) => sum + emp.salary, 0);

    // Get departments count
    const departments = await Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalEmployees,
        active: activeEmployees,
        inactive: inactiveEmployees,
        onLeave: onLeaveEmployees,
        totalMonthlySalary,
        departments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
