import React, { useState, useEffect, useCallback } from 'react';
import { usersAPI } from '../services/api';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical,
  Mail,
  Calendar,
  BookOpen,
  Edit3,
  Trash2,
  Eye,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import LoadingSpinner from '../componets/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    isActive: true
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  // eslint-disable-next-line no-undef
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = { 
        page: currentPage, 
        limit: 10,
        ...(filterRole !== 'all' && { role: filterRole }),
        ...(searchTerm && { search: searchTerm })
      };
      const response = await usersAPI.getUsers(params);
      setUsers(response.data.users || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterRole, searchTerm]);
  useEffect(() => {
  fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const handleRoleFilter = (role) => {
    setFilterRole(role);
    setCurrentPage(1);
  };

  const handleEditUser = (user) => {
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await usersAPI.updateUser(selectedUser._id, editFormData);
      toast.success('User updated successfully');
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update user';
      toast.error(message);
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete user "${user.firstName} ${user.lastName}"? This action cannot be undone.`)) {
      try {
        await usersAPI.deleteUser(user._id);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to delete user';
        toast.error(message);
      }
    }
  };

  const UserCard = ({ user }) => {
    const [showDropdown, setShowDropdown] = useState(false);

    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 hover:shadow-xl transition-all duration-500 group relative">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-8">
            <div className="relative">
              <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center border border-primary-100 dark:border-primary-800 group-hover:scale-110 transition-transform duration-500">
                <User className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 ${user.isActive ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {user.firstName} {user.lastName}
                </h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  user.role === 'admin' 
                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800' 
                    : 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-800'
                }`}>
                  {user.role}
                </span>
              </div>
              <p className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-tighter mb-4">@{user.username}</p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                  <Mail className="h-4 w-4 text-primary-400" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                  <Calendar className="h-4 w-4 text-primary-400" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <BookOpen className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  <span className="text-slate-900 dark:text-white font-bold">
                    {user.issuedBooks?.length || 0} <span className="text-slate-400 dark:text-slate-500 font-medium">Volumes</span>
                  </span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                    <span className="text-lg">📱</span>
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-3 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-2xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all border border-transparent hover:border-primary-100 dark:hover:border-primary-800"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-20 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowUserModal(true);
                      setShowDropdown(false);
                    }}
                    className="flex items-center gap-3 w-full px-5 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Dossier Overview</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      handleEditUser(user);
                    }}
                    className="flex items-center gap-3 w-full px-5 py-3 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Modify Record</span>
                  </button>
                  <div className="h-px bg-gray-50 mx-4 my-1" />
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      handleDeleteUser(user);
                    }}
                    className="flex items-center gap-3 w-full px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Purge Account</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const UserDetailsModal = ({ user, isOpen, onClose }) => {
    if (!isOpen || !user) return null;

    return (
      <div className="fixed inset-0 z-[100] overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md dark:bg-slate-950/80" onClick={onClose} />
          
          <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl max-w-3xl w-full overflow-hidden border border-white/20 dark:border-slate-800">
            <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-800 p-8 flex items-end justify-between">
              <div className="flex items-center gap-6 translate-y-12">
                <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl shadow-xl flex items-center justify-center p-1">
                  <div className="w-full h-full bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center border border-primary-100 dark:border-primary-800">
                    <User className="h-12 w-12 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <div className="pb-4">
                  <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">
                    {user.firstName} {user.lastName}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-white/80 font-bold text-xs uppercase tracking-widest">@{user.username}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20 text-white backdrop-blur-md border border-white/20`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-md transition-all mb-4"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-12 pt-20 bg-white dark:bg-slate-900">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <section>
                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Contact Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <Mail className="h-5 w-5 text-primary-400" />
                        <div>
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Email Address</p>
                          <p className="text-slate-900 dark:text-white font-bold">{user.email}</p>
                        </div>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <span className="text-xl">📱</span>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Phone Number</p>
                            <p className="text-slate-900 dark:text-white font-bold">{user.phone}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <Calendar className="h-5 w-5 text-primary-400" />
                        <div>
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Enrollment Date</p>
                          <p className="text-slate-900 dark:text-white font-bold">{new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="space-y-8">
                  <section>
                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Library Performance</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-primary-50/50 dark:bg-primary-900/10 p-6 rounded-3xl border border-primary-100 dark:border-primary-800 text-center">
                        <div className="text-3xl font-black text-primary-600 dark:text-primary-400 mb-1">{user.issuedBooks?.length || 0}</div>
                        <div className="text-[10px] font-black text-primary-400 dark:text-primary-500 uppercase tracking-widest leading-tight">Active<br/>Circulation</div>
                      </div>
                      <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-800 text-center">
                        <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-1">0</div>
                        <div className="text-[10px] font-black text-blue-400 dark:text-blue-500 uppercase tracking-widest leading-tight">Total<br/>Archives</div>
                      </div>
                    </div>
                  </section>
                  
                  {user.address && (
                    <section>
                      <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Residential Details</h3>
                      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                        "{user.address}"
                      </div>
                    </section>
                  )}
                </div>
              </div>

              <div className="flex gap-4 mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                <button onClick={onClose} className="flex-1 btn-secondary-modern">Close Dossier</button>
                <button 
                  onClick={() => {
                    handleEditUser(user);
                    onClose();
                  }}
                  className="flex-1 btn-modern !bg-indigo-600 hover:!bg-indigo-700 shadow-xl"
                >
                  Modify Member
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EditUserModal = ({ user, isOpen, onClose }) => {
    if (!isOpen || !user) return null;

    return (
      <div className="fixed inset-0 z-[100] overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md" onClick={onClose} />
          
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full p-10 overflow-hidden">
            <div className="mb-10 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <Edit3 className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 italic tracking-tight">Edit Member Dossier</h2>
              <p className="text-sm font-semibold text-gray-400 mt-1 uppercase tracking-widest">Update Administrative Record</p>
            </div>
            
            <form onSubmit={handleUpdateUser} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">First Name *</label>
                  <input
                    type="text"
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="input-modern"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Last Name *</label>
                  <input
                    type="text"
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="input-modern"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address *</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="input-modern"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Administrative Role</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="input-modern appearance-none"
                >
                  <option value="user">Standard User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out bg-gray-200 rounded-full cursor-pointer focus-within:ring-2 focus-within:ring-brand-500">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editFormData.isActive}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="absolute opacity-0 w-0 h-0"
                  />
                  <span className={`absolute left-1 top-1 w-4 h-4 transition duration-200 ease-in-out transform bg-white rounded-full ${editFormData.isActive ? 'translate-x-6 !bg-brand-600' : ''}`} />
                </div>
                <label htmlFor="isActive" className="text-sm font-bold text-gray-700 uppercase tracking-widest cursor-pointer">
                  Account Status: <span className={editFormData.isActive ? 'text-brand-600' : 'text-gray-400'}>{editFormData.isActive ? 'Active' : 'Suspended'}</span>
                </label>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={onClose} className="flex-1 btn-secondary-modern">Discard</button>
                <button type="submit" className="flex-1 btn-modern bg-blue-600 hover:bg-blue-700 shadow-xl">Confirm Updates</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-8 py-10">
        <div className="flex-1 flex items-center justify-center lg:justify-between">
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
              Showing Page <span className="text-gray-900">{currentPage}</span> of <span className="text-gray-900">{totalPages}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-brand-600 hover:border-brand-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2 mx-4">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = i + Math.max(1, currentPage - 2);
                if (pageNumber > totalPages) return null;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`h-11 w-11 rounded-2xl text-sm font-bold transition-all shadow-sm flex items-center justify-center ${
                      currentPage === pageNumber
                        ? 'bg-brand-600 text-white shadow-xl scale-110'
                        : 'bg-white text-gray-500 hover:bg-brand-50 hover:text-brand-600 border border-transparent'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-brand-600 hover:border-brand-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 lg:p-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Member Directory</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium text-lg">
          Oversee library <span className="text-primary-600 dark:text-primary-400 font-bold decoration-primary-200 dark:decoration-primary-800 underline decoration-4 underline-offset-4">Students</span> and administrative access.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex-1 max-w-xl">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            </div>
            <input
              type="text"
              className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border border-transparent rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:border-primary-200 dark:focus:border-primary-800 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-white"
              placeholder="Search by name, email, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-5 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
            <Filter className="h-4 w-4 text-primary-500" />
            <select
              value={filterRole}
              onChange={(e) => handleRoleFilter(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-300 outline-none min-w-30 cursor-pointer"
            >
              <option value="all">Access: All Roles</option>
              <option value="user">Access: Standard Members</option>
              <option value="admin">Access: Administrators</option>
            </select>
          </div>

          <button
            onClick={handleSearch}
            className="btn-modern px-8 flex items-center gap-2"
          >
            <Search className="h-5 w-5" />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div className="stat-card">
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
              <Users className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-2">Total Students</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
              <User className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-2">Admins</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-2xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800">
              <BookOpen className="h-7 w-7 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-2">Active Borrowers</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                {users.filter(u => u.issuedBooks?.length > 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800">
              <Calendar className="h-7 w-7 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-2">New Registrations</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white">12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="py-40 flex items-center justify-center">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {users.map((user) => (
              <UserCard key={user._id} user={user} />
            ))}
          </div>

          {users.length === 0 && (
            <div className="py-40 text-center">
              <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-100 dark:border-slate-700">
                <Users className="h-10 w-10 text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">No members discovered</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto font-medium">
                {searchTerm 
                  ? 'The archives did not match your search parameters.' 
                  : 'No membership records exist in the current database phase.'
                }
              </p>
            </div>
          )}

          <Pagination />
        </>
      )}

      {/* User Details Modal */}
      <UserDetailsModal 
        user={selectedUser}
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
        }}
      />

      {/* Edit User Modal */}
      <EditUserModal 
        user={selectedUser}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
};

export default AdminUsers; 