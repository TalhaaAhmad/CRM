import React from 'react';
import type { SalarySlip } from '../types';

interface SalarySlipDocumentProps {
  data: SalarySlip | null;
}

export const SalarySlipDocument = React.forwardRef<HTMLDivElement, SalarySlipDocumentProps>(
  ({ data }, ref) => {
    if (!data) return null;

    const employee = data.employee as any; // Cast to access additional fields if needed

    return (
      <div 
        ref={ref} 
        className="w-[800px] bg-white text-slate-800 font-sans print:w-full print:m-0"
        style={{ 
          margin: '0 auto', 
          padding: '24px', 
          WebkitPrintColorAdjust: 'exact', 
          printColorAdjust: 'exact' 
        }}
      >
        {/* Hide browser print headers/footers */}
        <style type="text/css" media="print">
          {`
            @page { size: auto; margin: 0mm; }
          `}
        </style>
        
        <div className="border-[4px] border-[#1e3a5f] p-8 min-h-[1050px] relative">
          
          {/* Header Section */}
          <div className="flex justify-between items-start mb-8 tracking-widest">
            {/* Logo placeholder */}
            <div className="w-32 h-32 border border-slate-300 flex flex-col items-center justify-center p-2 pt-6">
              <div className="w-8 h-8 rounded-full overflow-hidden flex space-x-1 -mb-1 mt-2">
                <div className="w-3 h-8 bg-blue-500 transform -skew-x-[20deg]" />
                <div className="w-3 h-8 bg-orange-400 transform -skew-x-[20deg]" />
              </div>
              <span className="text-xs font-bold mt-2 text-[#1e3a5f]">ECOMSEA</span>
            </div>

            {/* Company Name Box */}
            <div className="flex-1 flex justify-center pt-8">
              <div className="bg-[#1e3a5f] text-white px-8 py-3 rounded-md shadow-sm">
                <span className="text-3xl font-bold tracking-widest">ECOMSEA</span>
                <span className="text-[10px] ml-2 align-baseline tracking-normal">(PVT) LTD</span>
              </div>
            </div>

            {/* Employee Photo */}
            <div className="w-32 h-36 border-2 border-slate-300 overflow-hidden flex items-center justify-center text-slate-400 text-sm italic bg-slate-50">
              {employee?.photo ? (
                <img 
                  src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${employee.photo}`} 
                  alt="Employee"
                  className="w-full h-full object-cover"
                />
              ) : (
                "Photo"
              )}
            </div>
          </div>

          <div className="w-full h-8 bg-[#ef8935] mb-6"></div>

          {/* Contact Details */}
          <div className="mb-6 px-4">
            <div className="grid grid-cols-[100px_1fr] gap-y-2 text-sm font-medium">
              <div>Phone#</div>
              <div>03189757497</div>
              
              <div>Address:</div>
              <div>Office # 10 2nd Floor Ajab Khan Plaza<br/>Kababiyan Stop Warsak Road Peshawar</div>
              
              <div>Email:</div>
              <div>info@ecomseapvtltd.com</div>
            </div>
          </div>

          {/* Employee Details Header */}
          <div className="w-full bg-[#ef8935] py-1 px-4 font-bold text-slate-900 mb-4">
            Employee Details
          </div>

          <div className="px-4 mb-4">
            <div className="grid grid-cols-[140px_1fr_100px_1fr] gap-y-3 text-sm font-semibold uppercase">
              <div className="font-normal capitalize text-slate-600">Employee Name:</div>
              <div>{employee?.name || 'N/A'}</div>
              <div className="font-normal capitalize text-slate-600">Department:</div>
              <div>{employee?.department || 'N/A'}</div>

              <div className="font-normal capitalize text-slate-600">Designation:</div>
              <div>{employee?.role || 'N/A'}</div>
              <div></div>
              <div></div>

              <div className="font-normal capitalize text-slate-600">Salary Month:</div>
              <div className="capitalize">{data.month || 'N/A'}</div>
            </div>
          </div>

          <hr className="border-t-[2px] border-[#1e3a5f] mb-4" />

          {/* Additional Info */}
          <div className="px-4 mb-8">
            <div className="grid grid-cols-[140px_1fr_120px_1fr] gap-y-3 text-sm">
              <div className="text-slate-600">Date of joining:</div>
              <div className="font-medium">{employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'}</div>
              
              <div className="text-slate-600">Employee Email:</div>
              <div className="font-medium">{employee?.email || ''}</div>
              
              <div className="text-slate-600">CNIC Number:</div>
              <div className="font-medium">{employee?.cnic || 'N/A'}</div>
              
              <div className="text-slate-600">Phone #</div>
              <div className="font-medium">{employee?.phone || ''}</div>
              
              <div></div>
              <div></div>
              
              <div className="text-slate-600">Terms:</div>
              <div className="font-medium">On salary</div>
            </div>
          </div>

          {/* Particulars Header */}
          <div className="w-full bg-[#ef8935] py-1 px-4 font-bold text-slate-900 flex">
            <div className="flex-1">Particulars</div>
            <div className="w-[150px]">Amount</div>
          </div>

          {/* Payment Particulars Details */}
          <div className="px-4 text-sm font-semibold mb-6">
            <div className="flex border-b border-slate-300 py-2">
              <div className="flex-1">Basic</div>
              <div className="w-[150px]">Rs {data.basicSalary?.toLocaleString() || 0}</div>
            </div>
            <div className="flex border-b border-slate-300 py-2">
              <div className="flex-1">Working Days ({data.workingDays || 0})</div>
              <div className="w-[150px]">Rs {data.basicSalary?.toLocaleString() || 0}</div>
            </div>
            <div className="flex border-b border-slate-300 py-2">
              <div className="flex-1">Over Time</div>
              <div className="w-[150px]">Rs {data.overtime?.amount?.toLocaleString() || 0}</div>
            </div>
            <div className="flex border-b border-slate-300 py-2">
              <div className="flex-1">ADVANCE</div>
              <div className="w-[150px]">{data.advance ? `Rs ${data.advance.toLocaleString()}` : ''}</div>
            </div>
            <div className="flex border-b border-slate-300 py-2">
              <div className="flex-1">BONUS</div>
              <div className="w-[150px]">{data.bonus ? `Rs ${data.bonus.toLocaleString()}` : ''}</div>
            </div>
          </div>

          {/* Subtotal */}
          <div className="w-full bg-[#ef8935] py-1 px-4 font-bold text-slate-900 flex mb-20">
            <div className="flex-1">Subtotal</div>
            <div className="w-[150px] underline underline-offset-2">Rs {data.netSalary?.toLocaleString() || 0}</div>
          </div>

          {/* Signatures */}
          <div className="px-4 grid grid-cols-2 mt-auto pb-4 gap-y-16 text-sm flex-1">
            <div className="flex items-end shadow-sm">
                <span className="w-36 text-slate-700">Employee's Signature:</span>
                <div className="border-b-[1px] border-blue-400 w-48 ml-2 h-4"></div>
            </div>
            <div></div>
            
            <div className="flex items-end">
                <span className="w-36 text-slate-700">Director signature:</span>
                <div className="border-b-[1px] border-blue-400 w-48 ml-2 h-4"></div>
            </div>
          </div>

        </div>
      </div>
    );
  }
);

export default SalarySlipDocument;
