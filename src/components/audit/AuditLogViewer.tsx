import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { ShieldCheck, Search, Filter, Lock, Terminal, FileText, CheckCircle2 } from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const { auditLogs = [] } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CHECKOUT':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'STOCK_ADJUSTMENT':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'BATCH_PRODUCED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANNABIS_LOT_CREATED':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-slate-800">
      {/* Top Banner */}
      <div className="bg-indigo-50/80 p-6 rounded-2xl border border-indigo-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-indigo-100 p-3 rounded-2xl border border-indigo-200 text-indigo-700">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              บันทึกประวัติการทำงานเเละความปลอดภัย (Audit Trail & Compliance Log)
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              ระบบจัดเก็บบันทึกว่า ใคร? ทำอะไร? เมื่อไร? หมายเหตุ/เหตุผล เพื่อรองรับการตรวจสอบโดยเจ้าหน้าที่
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-xs">
          <button
            onClick={() => setActionFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              actionFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setActionFilter('STOCK_ADJUSTMENT')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              actionFilter === 'STOCK_ADJUSTMENT'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            ปรับสต็อก
          </button>
          <button
            onClick={() => setActionFilter('CHECKOUT')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              actionFilter === 'CHECKOUT'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            ขาย/ชำระเงิน
          </button>
          <button
            onClick={() => setActionFilter('BATCH_PRODUCED')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              actionFilter === 'BATCH_PRODUCED'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            ผลิต Batch
          </button>
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้ปฏิบัติงาน หรือ รายละเอียด..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-slate-800 text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 shadow-xs"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-mono uppercase border-b border-slate-200">
              <tr>
                <th className="p-3">วัน-เวลา</th>
                <th className="p-3">ผู้ปฏิบัติงาน (User)</th>
                <th className="p-3">บทบาท</th>
                <th className="p-3">ประเภทการกระทำ (Action)</th>
                <th className="p-3">รายละเอียด & เหตุผล</th>
                <th className="p-3">หมายเลขการเปลี่ยนแปลง</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-mono text-slate-500">
                    {new Date(log.timestamp).toLocaleString('th-TH')}
                  </td>
                  <td className="p-3 font-bold text-slate-900">{log.userName}</td>
                  <td className="p-3 text-slate-500 capitalize">{log.userRole}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold ${getActionBadge(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 text-slate-800">{log.details}</td>
                  <td className="p-3 font-mono text-slate-500 text-[11px]">
                    {log.previousValue !== undefined && log.newValue !== undefined ? (
                      <span>
                        {log.previousValue} → <strong className="text-emerald-700">{log.newValue}</strong>
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
