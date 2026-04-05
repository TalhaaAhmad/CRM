import React, { useEffect, useState } from 'react';
import { employeesAPI, salaryAPI } from '@/services/api';
import type { Employee, SalarySlip, SalarySlipFormData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Plus,
  MoreVertical,
  Trash2,
  CheckCircle,
  DollarSign,
  Users,
  Calendar,
  Filter,
  Printer,
} from 'lucide-react';
import SalarySlipDocument from '@/components/SalarySlipDocument';

const statusOptions = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  { value: 'generated', label: 'Generated', color: 'bg-blue-100 text-blue-800' },
  { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
];

const Salary: React.FC = () => {
  const [salarySlips, setSalarySlips] = useState<SalarySlip[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [printSlip, setPrintSlip] = useState<SalarySlip | null>(null);

  useEffect(() => {
    const handleAfterPrint = () => setPrintSlip(null);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const [formData, setFormData] = useState<SalarySlipFormData>({
    employeeId: '',
    month: new Date().toISOString().slice(0, 7),
    basicSalary: 0,
    workingDays: 30,
    advance: 0,
    bonus: 0,
    overtime: {
      hours: 0,
      rate: 0,
    },
    paymentMethod: 'bank-transfer',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter, monthFilter]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [slipsRes, employeesRes] = await Promise.all([
        salaryAPI.getAll({
          status: statusFilter === 'all' ? undefined : statusFilter || undefined,
          month: monthFilter || undefined,
        }),
        employeesAPI.getAll({ status: 'active' }),
      ]);
      setSalarySlips(slipsRes.data.data as SalarySlip[]);
      setEmployees(employeesRes.data.data as Employee[]);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find((emp) => emp._id === employeeId);
    if (employee) {
      setFormData({
        ...formData,
        employeeId,
        basicSalary: employee.salary,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await salaryAPI.generate(formData);
      toast.success('Salary slip generated successfully');
      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate salary slip');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this salary slip?')) return;
    try {
      await salaryAPI.delete(id);
      toast.success('Salary slip deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete salary slip');
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await salaryAPI.markAsPaid(id);
      toast.success('Salary marked as paid');
      fetchData();
    } catch (error) {
      toast.error('Failed to mark as paid');
    }
  };

  const handleDownload = async (id: string) => {
    // Look up the full slip details from our fetched list
    const slip = salarySlips.find(s => s._id === id);
    if (slip) {
      setPrintSlip(slip);
      // Wait for React to render the printable slip, then trigger print
      setTimeout(() => {
        window.print();
      }, 150);
    } else {
      toast.error('Salary slip data not found');
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      month: new Date().toISOString().slice(0, 7),
      basicSalary: 0,
      workingDays: 30,
      advance: 0,
      bonus: 0,
      overtime: {
        hours: 0,
        rate: 0,
      },
      paymentMethod: 'bank-transfer',
      notes: '',
    });
  };

  const calculateNetSalary = () => {
    const overtimeAmount = (formData.overtime?.hours || 0) * (formData.overtime?.rate || 0);
    const grossSalary = (formData.basicSalary || 0) + (formData.bonus || 0) + overtimeAmount;
    const totalDeductions = (formData.advance || 0);
    return grossSalary - totalDeductions;
  };

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return (
      <Badge className={option?.color || 'bg-gray-100 text-gray-800'}>
        {option?.label || status}
      </Badge>
    );
  };

  const totalPaid = salarySlips
    .filter((slip) => slip.status === 'paid')
    .reduce((sum, slip) => sum + slip.netSalary, 0);
  const totalPending = salarySlips
    .filter((slip) => slip.status === 'generated')
    .reduce((sum, slip) => sum + slip.netSalary, 0);

  return (
    <>
      {/* Hidden print area */}
      {printSlip && (
        <div className="hidden print:block fixed inset-0 z-[9999] bg-white">
          <SalarySlipDocument data={printSlip} />
        </div>
      )}

      {/* Main App Content (hidden while printing) */}
      <div className="space-y-6 print:hidden">
        <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Salary Slips</h1>
          <p className="text-slate-500 mt-1">Generate and manage employee salary slips.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Generate Slip
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Slips</p>
              <p className="text-2xl font-bold">{salarySlips.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Paid</p>
              <p className="text-2xl font-bold">
                Rs. {totalPaid.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending</p>
              <p className="text-2xl font-bold">
                Rs. {totalPending.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Current Month</p>
              <p className="text-2xl font-bold">{monthFilter}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="pl-10 w-48"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Salary Slips Table */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Slips ({salarySlips.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Gross Salary</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salarySlips.map((slip) => (
                  <TableRow key={slip._id}>
                    <TableCell className="font-medium">
                      {slip.employee?.name}
                      <p className="text-sm text-slate-500">{slip.employee?.role}</p>
                    </TableCell>
                    <TableCell>{slip.month}</TableCell>
                    <TableCell>Rs. {slip.basicSalary.toLocaleString()}</TableCell>
                    <TableCell>Rs. {slip.grossSalary.toLocaleString()}</TableCell>
                    <TableCell className="font-medium">
                      Rs. {slip.netSalary.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(slip.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDownload(slip._id)}>
                            <Printer className="w-4 h-4 mr-2" />
                            Print / Save PDF
                          </DropdownMenuItem>
                          {slip.status !== 'paid' && (
                            <DropdownMenuItem onClick={() => handleMarkAsPaid(slip._id)}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          {slip.status !== 'paid' && (
                            <DropdownMenuItem
                              onClick={() => handleDelete(slip._id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {salarySlips.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      No salary slips found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Generate Salary Slip Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Salary Slip</DialogTitle>
            <DialogDescription>
              Select an employee and enter salary details to generate a salary slip.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6 py-4">
              {/* Employee & Month */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">Employee *</Label>
                  <Select
                    value={formData.employeeId}
                    onValueChange={handleEmployeeSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp._id} value={emp._id}>
                          {emp.name} - {emp.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="month">Month *</Label>
                  <Input
                    id="month"
                    type="month"
                    value={formData.month}
                    onChange={(e) =>
                      setFormData({ ...formData, month: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Basic Salary & Bonus */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basicSalary">Basic Salary (Rs.) *</Label>
                  <Input
                    id="basicSalary"
                    type="number"
                    value={formData.basicSalary}
                    onChange={(e) =>
                      setFormData({ ...formData, basicSalary: Number(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bonus">Bonus (Rs.)</Label>
                  <Input
                    id="bonus"
                    type="number"
                    value={formData.bonus}
                    onChange={(e) =>
                      setFormData({ ...formData, bonus: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              {/* Salary Components */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workingDays">Working Days</Label>
                  <Input
                    id="workingDays"
                    type="number"
                    value={formData.workingDays}
                    onChange={(e) =>
                      setFormData({ ...formData, workingDays: Number(e.target.value) })
                    }
                    placeholder="e.g. 30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="advance">Advance (Rs.)</Label>
                  <Input
                    id="advance"
                    type="number"
                    value={formData.advance}
                    onChange={(e) =>
                      setFormData({ ...formData, advance: Number(e.target.value) })
                    }
                    placeholder="Deductions or Advance"
                  />
                </div>
              </div>

              {/* Overtime */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Overtime</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="overtimeHours">Hours</Label>
                    <Input
                      id="overtimeHours"
                      type="number"
                      value={formData.overtime?.hours}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          overtime: {
                            ...formData.overtime,
                            hours: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overtimeRate">Rate per Hour (Rs.)</Label>
                    <Input
                      id="overtimeRate"
                      type="number"
                      value={formData.overtime?.rate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          overtime: {
                            ...formData.overtime,
                            rate: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method & Notes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) =>
                      setFormData({ ...formData, paymentMethod: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>

              {/* Net Salary Preview */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-700">Estimated Net Salary:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    Rs. {calculateNetSalary().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!formData.employeeId}>
                Generate Salary Slip
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
};

export default Salary;
