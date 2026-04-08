import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI, transactionsAPI } from '../services/api';
import { 
  User, 
  Mail, 
  Calendar, 
  BookOpen, 
  FileText, 
  Edit3,
  Save,
  X,
  Eye,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import LoadingSpinner from '../componets/LoadingSpinner';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(authUser);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [profileRes, transactionsRes] = await Promise.all([
        usersAPI.getProfile(),
        usersAPI.getMyTransactions()
      ]);
      
      setUser(profileRes.data);
      setTransactions(transactionsRes.data || []);
      setFormData({
        firstName: profileRes.data.firstName || '',
        lastName: profileRes.data.lastName || '',
        email: profileRes.data.email || '',
        username: profileRes.data.username || '',
        phone: profileRes.data.phone || '',
        address: profileRes.data.address || ''
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnRequest = async (bookId) => {
    try {
      await transactionsAPI.returnBook(bookId);
      toast.success('Return request submitted');
      fetchUserData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit return request');
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await usersAPI.updateProfile(formData);
      setUser(response.data);
      setEditMode(false);
      toast.success('Dossier updated successfully');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update dossier';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      username: user.username || '',
      phone: user.phone || '',
      address: user.address || ''
    });
    setEditMode(false);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800';
      case 'pending': return 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-800';
      case 'rejected': return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800';
      case 'completed': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800';
      default: return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-700';
    }
  };

  const TransactionCard = ({ transaction }) => {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 hover:shadow-lg transition-all duration-300 group">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-5">
            <div className="shrink-0 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800 group-hover:scale-105 transition-transform">
              {transaction.type === 'issue' ? (
                <BookOpen className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              ) : (
                <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              )}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white tracking-tight text-lg mb-1">
                {transaction.book?.title || 'Unknown Volume'}
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-3">
                by <span className="text-slate-900 dark:text-slate-200">{transaction.book?.author || 'Anonymous'}</span>
              </p>
              
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                <span className="text-primary-600 dark:text-primary-400">{transaction.type === 'issue' ? 'Issuance' : 'Return'}</span>
                <span className="text-slate-200 dark:text-slate-800">|</span>
                <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                {transaction.dueDate && (
                  <>
                    <span className="text-slate-200 dark:text-slate-800">|</span>
                    <span className={new Date(transaction.dueDate) < new Date() && !transaction.returnedAt ? 'text-red-500' : ''}>
                      Due: {new Date(transaction.dueDate).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(transaction.status)}`}>
              {transaction.status}
            </span>
            {transaction.type === 'issue' && transaction.status === 'approved' && !transaction.returnedAt && (
              <button
                onClick={() => handleReturnRequest(transaction.book?._id)}
                className="px-4 py-1.5 bg-slate-900 dark:bg-primary-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-sm"
              >
                Return Book
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfdfa]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const activeBooks = transactions.filter(t => 
    t.type === 'issue' && t.status === 'approved' && !t.returnedAt
  ).length;

  const overdueBooks = transactions.filter(t => 
    t.type === 'issue' && 
    t.status === 'approved' && 
    !t.returnedAt && 
    new Date(t.dueDate) < new Date()
  ).length;

  return (
    <div className="p-8 lg:p-12 min-h-screen">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">View your Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Profile Info & Transactions */}
        <div className="lg:col-span-8 space-y-10">
          {/* Main Info Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 lg:p-10 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8">
              {!editMode ? (
                <button 
                  onClick={() => setEditMode(true)}
                  className="btn-secondary-modern group/edit"
                >
                  <Edit3 className="h-4 w-4 inline-block mr-2 group-hover/edit:scale-110 transition-transform" />
                  Edit Records
                </button>
              ) : (
                <div className="flex gap-3">
                  <button onClick={handleCancel} className="btn-secondary-modern">
                    <X className="h-4 w-4 inline-block mr-2" />
                    Discard
                  </button>
                  <button onClick={handleSave} disabled={saving} className="btn-modern py-2.5!">
                    {saving ? <LoadingSpinner size="small" /> : <Save className="h-4 w-4 inline-block mr-2" />}
                    Confirm
                  </button>
                </div>
              )}
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-10 flex items-center gap-3">
              <span className="h-1.5 w-8 bg-primary-600 rounded-full" />
              Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] block">First Name</label>
                {editMode ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-0 py-2 bg-transparent border-b-2 border-slate-100 dark:border-slate-800 focus:border-primary-400 outline-none transition-colors text-xl font-bold placeholder:text-slate-200 dark:placeholder:text-slate-700 text-slate-900 dark:text-white"
                    placeholder="Enter first name"
                  />
                ) : (
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{user.firstName || 'Not provided'}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] block">Last Name</label>
                {editMode ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-0 py-2 bg-transparent border-b-2 border-slate-100 dark:border-slate-800 focus:border-primary-400 outline-none transition-colors text-xl font-bold placeholder:text-slate-200 dark:placeholder:text-slate-700 text-slate-900 dark:text-white"
                    placeholder="Enter last name"
                  />
                ) : (
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{user.lastName || 'Not provided'}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] block">University Email</label>
                {editMode ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-0 py-2 bg-transparent border-b-2 border-slate-100 dark:border-slate-800 focus:border-primary-400 outline-none transition-colors font-semibold text-slate-700 dark:text-slate-300"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold text-lg">
                    <Mail className="h-4 w-4 text-primary-500" />
                    {user.email}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] block">Admission Number</label>
                {editMode ? (
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-0 py-2 bg-transparent border-b-2 border-slate-100 dark:border-slate-800 focus:border-primary-400 outline-none transition-colors font-semibold text-slate-700 dark:text-slate-300"
                  />
                ) : (
                  <p className="text-slate-700 dark:text-slate-300 font-black text-lg">@{user.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] block">Phone number</label>
                {editMode ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-0 py-2 bg-transparent border-b-2 border-slate-100 dark:border-slate-800 focus:border-primary-400 outline-none transition-colors font-semibold text-slate-700 dark:text-slate-300"
                    placeholder="Provide telephone number"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold text-lg">
                    <Phone className="h-4 w-4 text-primary-500" />
                    {user.phone || 'No line provided'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] block">Archives/History</label>
                <div className="flex items-center gap-2 text-primary-700 dark:text-primary-400 font-black uppercase text-sm tracking-widest bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-xl border border-primary-100 dark:border-primary-800 w-fit">
                  <ShieldCheck className="h-4 w-4" />
                  {user.role}
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] block">Primary Residence</label>
                {editMode ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-0 py-2 bg-transparent border-b-2 border-slate-100 dark:border-slate-800 focus:border-primary-400 outline-none transition-colors font-medium text-slate-700 dark:text-slate-300 resize-none"
                    placeholder="Specify physical address"
                  />
                ) : (
                  <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    <MapPin className="h-4 w-4 text-primary-500 mt-1 shrink-0" />
                    {user.address || 'Address not registered in archives.'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Records History */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                Transaction History
                <span className="text-xs font-black uppercase tracking-widest text-slate-300 dark:text-slate-600">({transactions.length} Records)</span>
              </h2>
              <button className="text-primary-600 dark:text-primary-400 font-black text-[10px] uppercase tracking-widest hover:text-primary-700 dark:hover:text-primary-300 transition-colors flex items-center gap-1 group">
                  more
                <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {transactions.length > 0 ? (
                transactions.slice(0, 6).map((transaction) => (
                  <TransactionCard key={transaction._id} transaction={transaction} />
                ))
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 py-24 text-center">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 dark:border-slate-700">
                    <FileText className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Your Record</h3>
                  <p className="text-slate-400 dark:text-slate-500 max-w-xs mx-auto font-medium text-sm">
                    Your archival history is currently empty. Begin your collection by browsing the catalog.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar Stats */}
        <div className="lg:col-span-4 space-y-8">
          {/* Identity Summary */}
          <div className="bg-slate-900 dark:bg-primary-950 rounded-[2.5rem] p-10 text-center relative overflow-hidden group shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary-500/20 transition-all duration-700" />
            
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto border border-white/10 group-hover:scale-105 transition-transform duration-500">
                <User className="h-12 w-12 text-primary-400" />
              </div>
              <div className="absolute -bottom-2 -right-2 p-2 bg-primary-500 rounded-xl border-4 border-slate-900 dark:border-primary-950">
                <ShieldCheck className="h-4 w-4 text-white" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-primary-200/60 font-black text-[10px] uppercase tracking-widest mb-4">@{user.username}</p>
            
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <p className="text-xs text-primary-100/40 uppercase font-black tracking-widest mb-1">Member Since</p>
              <p className="text-primary-100 font-bold text-lg tracking-tight">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Library Analytics */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-4">View your history</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="stat-card p-5!">
                <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800 w-fit mb-4">
                  <BookOpen className="h-5 w-5 text-orange-500" />
                </div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Active</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{activeBooks}</p>
              </div>

              <div className="stat-card p-5!">
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 w-fit mb-4">
                  <Clock className="h-5 w-5 text-red-500" />
                </div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Overdue</p>
                <p className="text-2xl font-black text-red-600 dark:text-red-400 tracking-tighter">{overdueBooks}</p>
              </div>

              <div className="stat-card p-5!">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 w-fit mb-4">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Total Logs</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{transactions.length}</p>
              </div>

              <div className="stat-card !p-5">
                <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800 w-fit mb-4">
                  <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Monthly</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                  {transactions.filter(t => {
                    const d = new Date(t.createdAt);
                    const now = new Date();
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Nav */}
          <div className="bg-primary-50/50 dark:bg-primary-900/10 rounded-4xl border border-primary-100/50 dark:border-primary-800/50 p-8 space-y-4">
            <h3 className="text-sm font-black text-primary-900 dark:text-primary-200 uppercase tracking-widest">View your transactions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-primary-300 dark:hover:border-primary-700 transition-all hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-400">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Explore Catalog</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-primary-500 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
              </button>
              
              <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-primary-300 dark:hover:border-primary-700 transition-all hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-400">
                    <FileText className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Audit History</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-primary-500 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 
