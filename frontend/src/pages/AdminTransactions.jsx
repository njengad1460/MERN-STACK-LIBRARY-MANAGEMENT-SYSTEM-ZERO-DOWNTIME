import React, { useState, useEffect, useCallback } from 'react';
import { transactionsAPI } from '../services/api';
import { 
  FileText, 
  Search, 
  Filter, 
  BookOpen,
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MoreVertical,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import LoadingSpinner from '../componets/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

 

   
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params = { 
        page: currentPage, 
        limit: 10,
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterType !== 'all' && { type: filterType }),
        ...(searchTerm && { search: searchTerm })
      };
      const response = await transactionsAPI.getTransactions(params);
      setTransactions(response.data.transactions || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus, filterType, searchTerm]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions])

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTransactions();
  };

  const handleStatusUpdate = async (transactionId, newStatus, notes = '') => {
    try {
      await transactionsAPI.updateTransactionStatus(transactionId, newStatus, notes);
      toast.success(`Transaction ${newStatus} successfully`);
      fetchTransactions();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update transaction';
      toast.error(message);
    }
  };

  const handleDeleteTransaction = async (transaction) => {
    if (window.confirm(`Are you sure you want to delete this ${transaction.type} transaction for "${transaction.book?.title}"? This action cannot be undone.`)) {
      try {
        await transactionsAPI.deleteTransaction(transaction._id);
        toast.success('Transaction deleted successfully');
        fetchTransactions();
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to delete transaction';
        toast.error(message);
      }
    }
  };

  // eslint-disable-next-line no-unused-vars
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'pending': return Clock;
      case 'rejected': return XCircle;
      case 'completed': return CheckCircle;
      default: return AlertCircle;
    }
  };

  const getTypeIcon = (type) => {
    return type === 'issue' ? BookOpen : FileText;
  };

  const TransactionCard = ({ transaction }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const StatusIcon = getStatusIcon(transaction.status);
    const TypeIcon = getTypeIcon(transaction.type);

    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 hover:shadow-xl transition-all duration-500 group relative">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center border border-primary-100 dark:border-primary-800 group-hover:scale-110 transition-transform duration-500">
                <TypeIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <div className={`p-2 rounded-xl border-2 border-white dark:border-slate-900 shadow-sm ${
                transaction.status === 'approved' ? 'bg-green-500 text-white' :
                transaction.status === 'pending' ? 'bg-orange-400 text-white' :
                transaction.status === 'rejected' ? 'bg-red-500 text-white' :
                'bg-blue-500 text-white'
              }`}>
                <StatusIcon className="h-4 w-4" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {transaction.book?.title || 'Archive Volume'}
                  </h3>
                  <p className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-tighter mb-4">
                    By {transaction.book?.author || 'Unknown Scholar'}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-6 text-sm mb-6">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                      <User className="h-4 w-4 text-primary-400 transition-colors" />
                      <span>{transaction.user?.firstName} {transaction.user?.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                      <Calendar className="h-4 w-4 text-primary-400 transition-colors" />
                      <span>Req. {new Date(transaction.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700`}>
                      {transaction.type}
                    </span>
                  </div>

                  {transaction.dueDate && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 w-fit mb-4">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[10px]">
                        Maturity: <span className="text-slate-900 dark:text-white">{new Date(transaction.dueDate).toLocaleDateString()}</span>
                      </span>
                      {new Date(transaction.dueDate) < new Date() && transaction.status === 'approved' && !transaction.returnedAt && (
                        <span className="px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-[9px] font-black border border-red-100 dark:border-red-800 animate-pulse">LATE</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${
                      transaction.status === 'approved' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800' :
                      transaction.status === 'pending' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800' :
                      transaction.status === 'rejected' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800' :
                      'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800'
                    }`}>
                      {transaction.status}
                    </span>
                    
                    {transaction.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        {transaction.type === 'return' ? (
                          <button
                            onClick={() => transactionsAPI.completeReturn(transaction._id).then(() => {
                              toast.success('Return completed successfully');
                              fetchTransactions();
                            })}
                            className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md active:scale-95"
                          >
                            Complete
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusUpdate(transaction._id, 'approved')}
                            className="px-4 py-1.5 bg-green-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-md active:scale-95"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleStatusUpdate(transaction._id, 'rejected')}
                          className="px-4 py-1.5 bg-white text-red-500 border border-red-100 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95"
                        >
                          Deny
                        </button>
                      </div>
                    )}

                    {transaction.status === 'approved' && transaction.type === 'issue' && !transaction.returnedAt && (
                      <button
                        onClick={() => transactionsAPI.completeReturn(transaction._id).then(() => {
                          toast.success('Book return completed');
                          fetchTransactions();
                        })}
                        className="px-5 py-2 bg-primary-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl active:scale-95 flex items-center gap-2"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Complete Archive
                      </button>
                    )}
                  </div>
                </div>
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
                      setSelectedTransaction(transaction);
                      setShowTransactionModal(true);
                      setShowDropdown(false);
                    }}
                    className="flex items-center gap-3 w-full px-5 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Examine Record</span>
                  </button>
                  <div className="h-px bg-gray-50 mx-4 my-1" />
                  <button
                    onClick={() => {
                      handleDeleteTransaction(transaction);
                      setShowDropdown(false);
                    }}
                    className="flex items-center gap-3 w-full px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Expunge Entry</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const TransactionDetailsModal = ({ transaction, isOpen, onClose }) => {
    if (!isOpen || !transaction) return null;

    return (
      <div className="fixed inset-0 z-[100] overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md dark:bg-slate-950/80" onClick={onClose} />
          
          <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl max-w-3xl w-full overflow-hidden border border-white/20 dark:border-slate-800">
            <div className={`h-32 p-8 flex items-end justify-between ${
              transaction.status === 'approved' ? 'bg-linear-to-r from-green-600 to-green-800' :
              transaction.status === 'pending' ? 'bg-linear-to-r from-orange-500 to-orange-700' :
              transaction.status === 'rejected' ? 'bg-linear-to-r from-red-600 to-red-800' :
              'bg-linear-to-r from-blue-600 to-blue-800'
            }`}>
              <div className="flex items-center gap-6 translate-y-12">
                <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl shadow-xl flex items-center justify-center p-1">
                  <div className="w-full h-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-700">
                    <FileText className={`h-12 w-12 ${
                      transaction.status === 'approved' ? 'text-green-600 dark:text-green-400' :
                      transaction.status === 'pending' ? 'text-orange-500 dark:text-orange-400' :
                      transaction.status === 'rejected' ? 'text-red-600 dark:text-red-400' :
                      'text-blue-600 dark:text-blue-400'
                    }`} />
                  </div>
                </div>
                <div className="pb-4">
                  <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">
                    Circulation Record
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-white/80 font-bold text-xs uppercase tracking-widest leading-none">ID: {transaction._id.slice(-8)}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20 text-white backdrop-blur-md border border-white/20`}>
                      {transaction.status}
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
                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Bibliographic Data</h3>
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{transaction.book?.title}</h4>
                      <p className="text-sm font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">{transaction.book?.author}</p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Borrower Dossier</h3>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex items-center justify-center border border-slate-100 dark:border-slate-700">
                        <User className="h-6 w-6 text-primary-500 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-white font-bold">{transaction.user?.firstName} {transaction.user?.lastName}</p>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{transaction.user?.email}</p>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="space-y-8">
                  <section>
                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Chronology</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Entry Date</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{new Date(transaction.createdAt).toLocaleDateString()}</span>
                      </div>
                      {transaction.dueDate && (
                        <div className="flex items-center justify-between p-4 bg-orange-50/50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-800">
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-orange-400 dark:text-orange-500" />
                            <span className="text-[10px] font-black text-orange-400 dark:text-orange-500 uppercase tracking-widest">Target Return</span>
                          </div>
                          <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{new Date(transaction.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </section>

                  {transaction.notes && (
                    <section>
                      <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Administrative Notes</h3>
                      <p className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium tracking-tight">
                        "{transaction.notes}"
                      </p>
                    </section>
                  )}
                </div>
              </div>

              <div className="flex gap-4 mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                <button onClick={onClose} className="flex-1 btn-secondary-modern">Archive View</button>
                {transaction.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => {
                        handleStatusUpdate(transaction._id, 'approved');
                        onClose();
                      }}
                      className="flex-1 btn-modern bg-green-600! hover:bg-green-700! shadow-xl"
                    >
                      Authorize Request
                    </button>
                    <button 
                      onClick={() => {
                        handleStatusUpdate(transaction._id, 'rejected');
                        onClose();
                      }}
                      className="flex-1 btn-modern bg-red-600! hover:bg-red-700!"
                    >
                      Dismiss
                    </button>
                  </>
                )}
              </div>
            </div>
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

  const pendingCount = transactions.filter(t => t.status === 'pending').length;
  const approvedCount = transactions.filter(t => t.status === 'approved').length;
  const overdueCount = transactions.filter(t => 
    t.status === 'approved' && 
    t.dueDate && 
    new Date(t.dueDate) < new Date() && 
    !t.returnedAt
  ).length;

  return (
    <div className="p-8 lg:p-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Records of Circulation</h1>
        
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
              placeholder="Search volumes or members..."
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-300 outline-none min-w-30 cursor-pointer"
            >
              <option value="all">Status: All Records</option>
              <option value="pending">Status: Pending</option>
              <option value="approved">Status: Approved</option>
              <option value="rejected">Status: Rejected</option>
              <option value="completed">Status: Completed</option>
            </select>
          </div>

          <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-300 outline-none min-w-30 cursor-pointer"
            >
              <option value="all">Transactions</option>
              <option value="issue">Issued</option>
              <option value="return">Returned</option>
            </select>
          </div>

          <button
            onClick={handleSearch}
            className="btn-modern px-8 flex items-center gap-2"
          >
            <Search className="h-5 w-5" />
            <span>Apply Analysis</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div className="stat-card">
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800">
              <Clock className="h-7 w-7 text-orange-500 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-2">Pending</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
              <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-2">Approved</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{approvedCount}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
              <AlertCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-2">Overdue</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{overdueCount}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
              <FileText className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-2">Exhaustive</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{transactions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="py-40 flex items-center justify-center">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {transactions.map((transaction) => (
              <TransactionCard key={transaction._id} transaction={transaction} />
            ))}
          </div>

          {transactions.length === 0 && (
            <div className="py-40 text-center">
              <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-100 dark:border-slate-700">
                <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">No archives discovered</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto font-medium">
                {searchTerm 
                  ? 'The circulation records did not match your search parameters.' 
                  : 'No circulation history exists in the current system phase.'
                }
              </p>
            </div>
          )}

          <Pagination />
        </>
      )}

      <TransactionDetailsModal 
        transaction={selectedTransaction}
        isOpen={showTransactionModal}
        onClose={() => {
          setShowTransactionModal(false);
          setSelectedTransaction(null);
        }}
      />
    </div>
  );
};

export default AdminTransactions; 