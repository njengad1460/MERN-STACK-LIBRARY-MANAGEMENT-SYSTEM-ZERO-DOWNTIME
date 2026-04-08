/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { booksAPI, usersAPI, transactionsAPI } from '../services/api';
import { 
  BookOpen, 
  Users, 
  FileText, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Library,
  CheckCircle
} from 'lucide-react';
import LoadingSpinner from '../componets/LoadingSpinner';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentBooks, setRecentBooks] = useState([]);
  const [myTransactions, setMyTransactions] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (isAdmin) {
          // Admin dashboard data
          const [dashboardStatsRes, recentBooksRes] = await Promise.all([
            usersAPI.getDashboardStats(),
            booksAPI.getBooks({ limit: 5 })
          ]);
          
          setRecentBooks(recentBooksRes.data.books || []);
          setStats(dashboardStatsRes.data);
        } else {
          // User dashboard data
          const [booksRes, transactionsRes] = await Promise.all([
            booksAPI.getBooks({ limit: 6 }),
            usersAPI.getMyTransactions()
          ]);
          
          setRecentBooks(booksRes.data.books || []);
          setMyTransactions(transactionsRes.data.slice(0, 5) || []);
          
          const issuedBooks = transactionsRes.data.filter(t => 
            t.type === 'issue' && t.status === 'approved' && !t.returnedAt
          ).length;
          
          setStats({
            issuedBooks,
            totalTransactions: transactionsRes.data.length,
            pendingRequests: transactionsRes.data.filter(t => t.status === 'pending').length
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAdmin]);

  const handleReturnRequest = async (bookId) => {
    try {
      await transactionsAPI.returnBook(bookId);
      toast.success('Return request submitted');
      // Refresh dashboard data
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit return request');
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, colorClass = "bg-primary-500" }) => (
    <div className="stat-card group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10 dark:bg-opacity-20 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`h-6 w-6 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        <div className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">Global</div>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value}</h3>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
        {subtitle && (
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );

  const BookCard = ({ book }) => (
    <div className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-900 dark:text-white mb-1 truncate group-hover:text-primary-600 transition-colors uppercase tracking-tight">{book.title}</h4>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-3">by {book.author}</p>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            book.availability?.availableCopies > 0 
              ? 'bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800'
          }`}>
            {book.availability?.availableCopies > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
        <div className="text-right ml-4">
          <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-1">Genre</p>
          <p className="text-xs font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-lg">{book.genre}</p>
        </div>
      </div>
    </div>
  );

  const TransactionItem = ({ transaction }) => {
    const getStatusStyles = (status) => {
      switch (status) {
        case 'approved': return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800';
        case 'pending': return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-800';
        case 'rejected': return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800';
        case 'completed': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800';
        default: return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700';
      }
    };

    const getTypeIcon = (type) => {
      return type === 'issue' ? <BookOpen className="h-5 w-5 text-indigo-500" /> : <CheckCircle className="h-5 w-5 text-emerald-500" />;
    };

    return (
      <div className="flex items-center justify-between p-5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200 border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
        <div className="flex items-center space-x-4">
          <div className="shrink-0 p-2.5 bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-100 dark:border-slate-700">
            {getTypeIcon(transaction.type)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {transaction.book?.title || 'Book Title'}
            </p>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {transaction.type} • {new Date(transaction.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xs ${getStatusStyles(transaction.status)}`}>
            {transaction.status}
          </span>
          {!isAdmin && transaction.type === 'issue' && transaction.status === 'approved' && !transaction.returnedAt && (
            <button
              onClick={() => handleReturnRequest(transaction.book?._id)}
              className="px-4 py-1.5 bg-primary-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-sm"
            >
              Return
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
          Welcome back, {user?.firstName}
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium text-lg">
          {isAdmin 
            ? <>Explore your library's <span className="text-primary-600 dark:text-primary-400 font-bold underline decoration-primary-200 dark:decoration-primary-800 decoration-4">Activities </span> and transactions</>
            : <>Discover something <span className="text-primary-600 dark:text-primary-400 font-bold">new to read</span> in your collection today.</>
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8 mb-12">
        {isAdmin ? (
          <>
            <StatCard 
              icon={BookOpen} 
              title="Total Catalog" 
              value={stats.totalBooks || 0} 
              subtitle="Registered volumes"
              colorClass="bg-brand-500"
            />
            <StatCard 
              icon={Users} 
              title="Active Members" 
              value={stats.totalUsers || 0} 
              subtitle="Library patrons"
              colorClass="bg-blue-500"
            />
            <StatCard 
              icon={Library} 
              title="Available Now" 
              value={stats.availableBooks || 0} 
              subtitle="On the shelves"
              colorClass="bg-green-500"
            />
            <StatCard 
              icon={Clock} 
              title="Pending Req." 
              value={stats.pendingRequests || 0} 
              subtitle="Awaiting action"
              colorClass="bg-yellow-500"
            />
            <StatCard 
              icon={FileText} 
              title="Active Loans" 
              value={stats.activeIssues || 0} 
              subtitle="In circulation"
              colorClass="bg-purple-500"
            />
          </>
        ) : (
          <>
            <StatCard 
              icon={BookOpen} 
              title="Issued Books" 
              value={stats.issuedBooks || 0} 
              subtitle="Currently in your possession"
              colorClass="bg-primary-500"
            />
            <StatCard 
              icon={FileText} 
              title="Transactions" 
              value={stats.totalTransactions || 0} 
              subtitle="Total activity history"
              colorClass="bg-blue-500"
            />
            <StatCard 
              icon={Clock} 
              title="Pending" 
              value={stats.pendingRequests || 0} 
              subtitle="Requests being processed"
              colorClass="bg-yellow-500"
            />
            <div className="hidden xl:col-span-1 xl:flex items-center justify-center p-8 bg-primary-600 dark:bg-primary-900/40 rounded-3xl text-white shadow-lg relative overflow-hidden">
               <div className="relative z-10 text-center">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-primary-100">Read Score</p>
                 <p className="text-4xl font-bold">A+</p>
               </div>
               <TrendingUp className="absolute -right-4 -bottom-4 h-24 w-24 text-white/10" />
            </div>
          </>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Recent Books */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isAdmin ? 'Recently Cataloged' : 'Curated Selection'}
              </h2>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">Latest Updates</p>
            </div>
            <Library className="h-6 w-6 text-primary-600" />
          </div>
          <div className="p-6 space-y-4 overflow-y-auto max-h-125">
            {recentBooks.length > 0 ? (
              recentBooks.map((book) => (
                <BookCard key={book._id} book={book} />
              ))
            ) : (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                   <Library className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-gray-400 font-medium italic">No volumes found in catalog</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity / Transactions */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isAdmin ? 'System Activity' : 'Your Library Flow'}
              </h2>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">Recent Logs</p>
            </div>
            <FileText className="h-6 w-6 text-primary-600" />
          </div>
          <div className="p-2 divide-y divide-gray-50 overflow-y-auto max-h-125">
            {(isAdmin ? [] : myTransactions).length > 0 ? (
              (isAdmin ? [] : myTransactions).map((transaction) => (
                <TransactionItem key={transaction._id} transaction={transaction} />
              ))
            ) : (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <FileText className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-gray-400 font-medium">
                  {isAdmin ? 'System logs are currently empty' : 'No recorded transactions'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {!isAdmin && (
        <div className="mt-12 bg-slate-900 dark:bg-primary-950 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-8 italic">Library Shortcuts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <button 
                onClick={() => navigate('/books')}
                className="group flex items-center p-6 bg-white/10 hover:bg-white text-left transition-all duration-300 rounded-2xl border border-white/10 hover:border-transparent"
              >
                <div className="shrink-0 p-3 bg-primary-500 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-lg group-hover:text-slate-900 transition-colors">Browse Catalog</p>
                  <p className="text-sm text-slate-400 group-hover:text-slate-500">Explore 1000+ titles</p>
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/profile')}
                className="group flex items-center p-6 bg-white/10 hover:bg-white text-left transition-all duration-300 rounded-2xl border border-white/10 hover:border-transparent"
              >
                <div className="shrink-0 p-3 bg-blue-500 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-lg group-hover:text-gray-900 transition-colors">My Profile</p>
                  <p className="text-sm text-gray-400 group-hover:text-gray-500">Manage preferences</p>
                </div>
              </button>

              <div className="hidden lg:block absolute -right-20 -bottom-20 opacity-10">
                 <Library className="h-96 w-96 transform rotate-12" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 