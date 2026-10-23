import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { User, UserRole } from '../../types';
import { ManagerAuthModal } from '../common/ManagerAuthModal';
import {
  Users,
  UserPlus,
  Trash2,
  Edit,
  Shield,
  ShieldAlert,
  Key,
  Lock,
  UserCheck,
  Check,
  X,
  Sparkles,
  AlertTriangle,
  Search,
  CheckCircle2,
} from 'lucide-react';

export const UserManager: React.FC = () => {
  const { currentUser, users, addUser, updateUser, deleteUser } = usePOS();
  const [isManagerUnlocked, setIsManagerUnlocked] = useState(false);
  const [showManagerUnlockModal, setShowManagerUnlockModal] = useState(false);
  const isAdmin = currentUser.role === 'super_admin' || currentUser.role === 'manager' || isManagerUnlocked;

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('P@ssw0rd');
  const [role, setRole] = useState<UserRole>('cashier');
  const [pin, setPin] = useState('1234');
  const [avatar, setAvatar] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  );

  const resetForm = () => {
    setName('');
    setUsername('');
    setPassword('P@ssw0rd');
    setRole('cashier');
    setPin('1234');
    setAvatar(
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    );
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setUsername(u.username || '');
    setPassword(u.password || 'P@ssw0rd');
    setRole(u.role);
    setPin(u.pin || '1234');
    setAvatar(
      u.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addUser({
      name: name.trim(),
      username: username.trim() || name.toLowerCase().replace(/\s+/g, '_'),
      password,
      role,
      pin,
      avatar,
    });

    setShowAddModal(false);
    showToast(`เพิ่มผู้ใช้งาน "${name.trim()}" เรียบร้อยแล้ว`);
    resetForm();
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    updateUser(editingUser.id, {
      name: name.trim(),
      username: username.trim(),
      password,
      role,
      pin,
      avatar,
    });

    showToast(`อัปเดตข้อมูลผู้ใช้งาน "${name.trim()}" เรียบร้อยแล้ว`);
    setEditingUser(null);
    resetForm();
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    const deletedName = userToDelete.name;
    const success = deleteUser(userToDelete.id);
    if (success) {
      showToast(`ลบผู้ใช้งาน "${deletedName}" ออกจากระบบเรียบร้อยแล้ว`);
    }
    setUserToDelete(null);
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cashier':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'warehouse':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'kitchen':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getRoleName = (r: UserRole) => {
    switch (r) {
      case 'super_admin':
        return 'Super Admin (เจ้าของร้าน)';
      case 'manager':
        return 'Manager (ผู้จัดการร้าน)';
      case 'cashier':
        return 'Cashier (แคชเชียร์หน้าร้าน)';
      case 'warehouse':
        return 'Warehouse (เจ้าหน้าที่คลัง)';
      case 'kitchen':
        return 'Kitchen (พ่อครัว/บาร์น้ำ)';
      default:
        return r;
    }
  };

  const filteredUsers = (users || []).filter((u) => {
    const matchQuery =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchQuery && matchRole;
  });

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto p-8 sm:p-10 bg-white border-2 border-slate-200 rounded-3xl shadow-xl text-center space-y-6 my-8">
        <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto border-2 border-amber-200 shadow-xs">
          <Lock className="w-10 h-10 text-amber-600" />
        </div>
        <div className="space-y-2">
          <span className="text-xs bg-amber-100 text-amber-900 font-extrabold px-3 py-1 rounded-full border border-amber-300">
            🔒 สิทธิ์การเข้าถึงถูกจำกัด (Restricted to Manager & Admin)
          </span>
          <h2 className="text-2xl font-black text-slate-900">ระบบจัดการบัญชีผู้ใช้งาน</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            ตามระเบียบข้อที่ 4: สิทธิ์พนักงานแคชเชียร์ <strong>ห้ามจัดการบัญชีผู้ใช้งานระบบ</strong>
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <button
            onClick={() => setShowManagerUnlockModal(true)}
            className="px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-amber-600/30 transition cursor-pointer"
          >
            <Key className="w-4 h-4" />
            <span>ใส่รหัส PIN ผู้จัดการเพื่อปลดล็อกชั่วคราว</span>
          </button>
        </div>

        <ManagerAuthModal
          isOpen={showManagerUnlockModal}
          onClose={() => setShowManagerUnlockModal(false)}
          onSuccess={() => {
            setIsManagerUnlocked(true);
          }}
          actionTitle="ขออนุมัติจัดการผู้ใช้งาน (User Management Authorization)"
          actionDescription="ตามกฎข้อที่ 4: แคชเชียร์ห้ามจัดการบัญชีผู้ใช้งาน ยกเว้นได้รับอนุมัติจากผู้จัดการร้าน"
          requiredRoleLabel="ผู้จัดการร้าน (Manager) หรือ Admin"
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 text-slate-800">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-indigo-600/30 p-3.5 rounded-2xl border border-indigo-500/40 text-indigo-300">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">จัดการผู้ใช้งานระบบ (User Management)</h2>
              <span className="bg-purple-500/20 text-purple-300 text-[10px] px-2.5 py-0.5 rounded-full border border-purple-400/30 font-semibold">
                Admin Privilege
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              เพิ่ม, ลบ, แก้ไขชื่อผู้ใช้, รหัสผ่าน, กำหนดสิทธิ์ และซิงค์ฐานข้อมูล Supabase อัตโนมัติ
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/40 flex items-center justify-center space-x-2 text-xs transition self-start md:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ เพิ่มผู้ใช้ใหม่</span>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center justify-between shadow-md text-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-bold">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Role Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อ, Username หรือ ID ผู้ใช้งาน..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              roleFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            ทั้งหมด ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter('super_admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              roleFilter === 'super_admin'
                ? 'bg-purple-700 text-white'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200'
            }`}
          >
            Admin ({users.filter((u) => u.role === 'super_admin').length})
          </button>
          <button
            onClick={() => setRoleFilter('manager')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              roleFilter === 'manager'
                ? 'bg-blue-700 text-white'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
            }`}
          >
            Manager ({users.filter((u) => u.role === 'manager').length})
          </button>
          <button
            onClick={() => setRoleFilter('cashier')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              roleFilter === 'cashier'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            Cashier ({users.filter((u) => u.role === 'cashier').length})
          </button>
          <button
            onClick={() => setRoleFilter('warehouse')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              roleFilter === 'warehouse'
                ? 'bg-amber-700 text-white'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            Warehouse ({users.filter((u) => u.role === 'warehouse').length})
          </button>
          <button
            onClick={() => setRoleFilter('kitchen')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              roleFilter === 'kitchen'
                ? 'bg-orange-700 text-white'
                : 'bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200'
            }`}
          >
            Kitchen ({users.filter((u) => u.role === 'kitchen').length})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="font-bold text-sm text-slate-800 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>
              รายชื่อผู้ใช้งานระบบ ({filteredUsers.length} / {users.length} รายการ)
            </span>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            * สิทธิ์ Admin และ Manager สามารถเพิ่ม แก้ไข หรือลบผู้ใช้ได้
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-4">ผู้ใช้งาน</th>
                <th className="p-4">Username / รหัสผ่าน</th>
                <th className="p-4">บทบาท (Role)</th>
                <th className="p-4">PIN สลับหน้า</th>
                <th className="p-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    ไม่พบผู้ใช้งานที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = u.id === currentUser.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={
                              u.avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                            }
                            alt={u.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.2 rounded font-semibold border border-emerald-300">
                                  (คุณ)
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">ID: {u.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-800 flex items-center space-x-1">
                            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                            <span>{u.username || u.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-1">
                            <Key className="w-3 h-3 text-slate-400" />
                            <span>Password: {u.password || '••••••••'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold border ${getRoleBadge(
                            u.role
                          )}`}
                        >
                          {getRoleName(u.role)}
                        </span>
                      </td>

                      <td className="p-4 font-mono font-bold text-slate-700">{u.pin || '----'}</td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition border border-slate-300 cursor-pointer"
                            title="แก้ไขข้อมูลผู้ใช้งาน"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setUserToDelete(u)}
                            disabled={isSelf}
                            className={`p-2 rounded-xl transition border cursor-pointer ${
                              isSelf
                                ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 active:scale-95'
                            }`}
                            title={isSelf ? 'ไม่สามารถลบบัญชีที่กำลังล็อกอินอยู่ได้' : `ลบผู้ใช้งาน ${u.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">เพิ่มผู้ใช้งานใหม่ (Add User)</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">ชื่อ-นามสกุล:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น สมชาย ใจดี"
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">
                  ชื่อล็อกอิน (Username):
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="เช่น somchai หรือ admin_assistant"
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-800 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">รหัสผ่าน (Password):</label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="P@ssw0rd"
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-800 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">PIN (4 หลัก):</label>
                  <input
                    type="text"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    maxLength={4}
                    placeholder="1234"
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-800 font-mono text-center"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">สิทธิ์การใช้งาน (Role):</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-800 font-semibold"
                >
                  <option value="super_admin">Super Admin (เจ้าของร้าน - สิทธิ์เต็ม)</option>
                  <option value="manager">Manager (ผู้จัดการร้าน)</option>
                  <option value="cashier">Cashier (แคชเชียร์หน้าร้าน)</option>
                  <option value="warehouse">Warehouse (เจ้าหน้าที่คลังสินค้า)</option>
                  <option value="kitchen">Kitchen (พ่อครัว/บาร์น้ำ)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">รูปโปรไฟล์ (Avatar URL):</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-800 text-[11px]"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md text-xs flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>บันทึกผู้ใช้</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Edit className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">แก้ไขข้อมูลผู้ใช้ (Edit User)</h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">ชื่อ-นามสกุล:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">
                  ชื่อล็อกอิน (Username):
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-800 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">รหัสผ่าน (Password):</label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-800 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">PIN (4 หลัก):</label>
                  <input
                    type="text"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    maxLength={4}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-800 font-mono text-center"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">สิทธิ์การใช้งาน (Role):</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-800 font-semibold"
                >
                  <option value="super_admin">Super Admin (เจ้าของร้าน - สิทธิ์เต็ม)</option>
                  <option value="manager">Manager (ผู้จัดการร้าน)</option>
                  <option value="cashier">Cashier (แคชเชียร์หน้าร้าน)</option>
                  <option value="warehouse">Warehouse (เจ้าหน้าที่คลังสินค้า)</option>
                  <option value="kitchen">Kitchen (พ่อครัว/บาร์น้ำ)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">รูปโปรไฟล์ (Avatar URL):</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-800 text-[11px]"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md text-xs flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>อัปเดตข้อมูล</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border-2 border-rose-200 rounded-3xl max-w-md w-full p-6 text-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-600 pb-2 border-b border-rose-100">
              <div className="p-2.5 bg-rose-100 rounded-2xl">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">
                  ยืนยันการลบผู้ใช้งาน (Delete User)
                </h3>
                <p className="text-[11px] text-slate-500">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center space-x-3">
                <img
                  src={
                    userToDelete.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                  }
                  alt={userToDelete.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                />
                <div>
                  <div className="font-bold text-slate-900 text-sm">{userToDelete.name}</div>
                  <div className="text-xs text-slate-500 font-mono">
                    Username: {userToDelete.username || userToDelete.id}
                  </div>
                  <div className="mt-1">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getRoleBadge(
                        userToDelete.role
                      )}`}
                    >
                      {getRoleName(userToDelete.role)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 leading-relaxed">
                ⚠️ เมื่อลบแล้ว บัญชีนี้จะไม่สามารถล็อกอิน เข้าถึงระบบ หรือใช้รหัส PIN เพื่ออนุมัติสิทธิ์ได้อีกต่อไป และจะถูกลบออกจาก Supabase ทันที
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30 text-xs flex items-center space-x-1.5 transition cursor-pointer active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>ยืนยันลบผู้ใช้งาน</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
