/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { booksAPI, transactionsAPI } from '../services/api';
import { 
  Search, 
  Plus, 
  BookOpen, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Star,
  Calendar,
  User,
  Eye,
  Edit3,
  Trash2,
  X
} from 'lucide-react';
import LoadingSpinner from '../componets/LoadingSpinner';
import toast from 'react-hot-toast';

const Books = () => {
  const { isAdmin } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    author: '',
    genre: '',
    isbn: '',
    description: '',
    availability: {
      totalCopies: 1,
      availableCopies: 1
    }
  });
  const [addBookFormData, setAddBookFormData] = useState({
    title: '',
    author: '',
    genre: '',
    isbn: '',
    description: '',
    availability: {
      totalCopies: 1,
      availableCopies: 1
    }
  });

  useEffect(() => {
    fetchBooks();
  }, [currentPage]);

  const fetchBooks = async (search = '') => {
    try {
      setLoading(true);
      const params = { 
        page: currentPage, 
        limit: 12,
        ...(search && { search })
      };
      const response = await booksAPI.getBooks(params);
      setBooks(response.data.books || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      setSearching(true);
      setCurrentPage(1);
      try {
        const response = await booksAPI.searchBooks(searchTerm);
        setBooks(response.data || []);
        setTotalPages(1);
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Search failed');
      } finally {
        setSearching(false);
      }
    } else {
      setCurrentPage(1);
      fetchBooks();
    }
  };

  const handleRequestBook = async (bookId) => {
    try {
      await transactionsAPI.requestBook(bookId, 'Book request from catalog');
      toast.success('Book request submitted successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to request book';
      toast.error(message);
    }
  };

  const handleCreateBook = async (e) => {
    e.preventDefault();
    try {
      await booksAPI.createBook(addBookFormData);
      toast.success('Book added successfully!');
      
      // Reset form and close modal
      setAddBookFormData({
        title: '',
        author: '',
        genre: '',
        isbn: '',
        description: '',
        availability: {
          totalCopies: 1,
          availableCopies: 1
        }
      });
      setShowAddModal(false);
      fetchBooks();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add book';
      toast.error(message);
    }
  };

  const handleEditBook = (book) => {
    setEditFormData({
      title: book.title,
      author: book.author,
      genre: book.genre,
      isbn: book.isbn,
      description: book.description,
      availability: {
        totalCopies: book.availability?.totalCopies || 1,
        availableCopies: book.availability?.availableCopies || 1
      }
    });
    setSelectedBook(book);
    setShowEditModal(true);
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    try {
      await booksAPI.updateBook(selectedBook._id, editFormData);
      toast.success('Book updated successfully!');
      setShowEditModal(false);
      fetchBooks();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update book';
      toast.error(message);
    }
  };

  const handleDeleteBook = async (book) => {
    if (window.confirm(`Are you sure you want to delete "${book.title}"? This action cannot be undone.`)) {
      try {
        await booksAPI.deleteBook(book._id);
        toast.success('Book deleted successfully!');
        fetchBooks();
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to delete book';
        toast.error(message);
      }
    }
  };

  const BookCard = ({ book }) => (
    <div className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col h-full">
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 flex flex-col justify-end p-6">
           <button 
             onClick={() => {
               setSelectedBook(book);
               setShowDetailsModal(true);
             }}
             className="w-full py-3 bg-white/20 backdrop-blur-md text-white font-bold rounded-2xl border border-white/30 hover:bg-white hover:text-slate-900 transition-all duration-300"
           >
             Quick View
           </button>
        </div>
        
        {book.coverImage ? (
          <img 
            src={book.coverImage} 
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-primary-50 dark:bg-primary-900/10 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/20 transition-colors duration-500">
            <BookOpen className="h-20 w-20 text-primary-200 dark:text-primary-800 group-hover:text-primary-300 transition-colors mb-4" />
            <p className="text-[10px] font-black text-primary-300 dark:text-primary-700 uppercase tracking-[0.2em]">No Cover Available</p>
          </div>
        )}

        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <span className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-900 dark:text-slate-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/50 dark:border-slate-800 shadow-sm">
            {book.genre}
          </span>
          {book.rating?.average > 0 && (
            <div className="bg-primary-600 text-white px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-lg">
              <Star className="h-3 w-3 fill-current" />
              {book.rating.average.toFixed(1)}
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <div className="flex-1 mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
            {book.title}
          </h3>
          <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">by {book.author}</p>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              book.availability?.availableCopies > 0 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800'
            }`}>
              {book.availability?.availableCopies > 0 
                ? `${book.availability.availableCopies} Copies Left` 
                : 'All Loaned Out'
              }
            </span>
            <div className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">
              Total {book.availability?.totalCopies}
            </div>
          </div>

          <div className="flex gap-2">
            {isAdmin ? (
              <>
                <button 
                  onClick={() => handleEditBook(book)}
                  className="flex-1 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl transition-all duration-200 flex items-center justify-center border border-slate-100 dark:border-slate-700"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDeleteBook(book)}
                  className="flex-1 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all duration-200 flex items-center justify-center border border-slate-100 dark:border-slate-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            ) : (
              book.availability?.availableCopies > 0 && (
                <button 
                  onClick={() => handleRequestBook(book._id)}
                  className="flex-1 btn-modern py-2.5! text-sm"
                >
                  Request Copy
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const BookDetailsModal = ({ book, isOpen, onClose }) => {
    if (!isOpen || !book) return null;

    return (
      <div className="fixed inset-0 z-[100] overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md dark:bg-slate-950/80" onClick={onClose} />
          
          <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row border border-white/20 dark:border-slate-800">
            <div className="w-full md:w-2/5 bg-slate-50 dark:bg-slate-800/50 p-10 flex flex-col items-center justify-center border-r border-slate-100 dark:border-slate-800">
              <div className="w-full max-w-[240px] aspect-[3/4] rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-slate-800 mb-8 border-4 border-white dark:border-slate-700 transform -rotate-1">
                {book.coverImage ? (
                  <img 
                    src={book.coverImage} 
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-50 dark:bg-primary-900/20">
                    <BookOpen className="h-24 w-24 text-primary-200 dark:text-primary-800" />
                  </div>
                )}
              </div>
              
              <div className="w-full space-y-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Genre</span>
                  <span className="text-sm font-bold text-primary-600 dark:text-primary-400 uppercase">{book.genre}</span>
                </div>
                {book.rating?.average > 0 && (
                  <div className="bg-primary-600 p-4 rounded-2xl shadow-lg flex items-center justify-between text-white">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary-100">User Rating</span>
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-current text-white" />
                      <span className="text-lg font-bold">{book.rating.average.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 p-10 md:p-14 flex flex-col">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                   <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{book.title}</h2>
                   <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all ml-4">
                      <X className="h-6 w-6" />
                   </button>
                </div>
                <p className="text-lg font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8">by {book.author}</p>
                
                <div className="space-y-8">
                  <div className="prose prose-sm text-gray-600 max-w-none">
                    <p className="leading-relaxed text-lg font-medium opacity-80">{book.description || 'No description available for this volume.'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 text-sm">
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Publisher</span>
                      <p className="text-gray-900 font-bold text-base">{book.publisher || 'Unknown'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Published Date</span>
                      <p className="text-gray-900 font-bold text-base">
                        {book.publishedDate ? new Date(book.publishedDate).getFullYear() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Category Code</span>
                      <p className="text-gray-900 font-bold text-base uppercase tracking-wider">{book.isbn || 'LOAN-REF-100'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Page Count</span>
                      <p className="text-gray-900 font-bold text-base">{book.pages || '250+'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full animate-pulse ${book.availability?.availableCopies > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm font-bold text-gray-900">
                    {book.availability?.availableCopies > 0 
                      ? `${book.availability.availableCopies} Vol. Available` 
                      : 'Reserved for Loan'
                    }
                  </span>
                </div>
                
                <div className="flex gap-3">
                  {!isAdmin && book.availability?.availableCopies > 0 && (
                    <button 
                      onClick={() => {
                        handleRequestBook(book._id);
                        onClose();
                      }}
                      className="btn-modern shadow-xl px-10!"
                    >
                      Process Loan
                    </button>
                  )}
                  <button onClick={onClose} className="btn-secondary-modern">Close Details</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AddBookModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-100 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md" onClick={onClose} />
          
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full p-10 overflow-hidden">
            <div className="mb-10 text-center">
              <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-100">
                <Plus className="h-8 w-8 text-brand-600" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 italic tracking-tight">Add New Volume</h2>
              <p className="text-sm font-semibold text-gray-400 mt-1 uppercase tracking-widest">Catalog Entry</p>
            </div>
            
            <form onSubmit={handleCreateBook} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Volume Title *</label>
                  <input
                    type="text"
                    value={addBookFormData.title}
                    onChange={(e) => setAddBookFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="input-modern"
                    placeholder="e.g. The Great Gatsby"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Author Name *</label>
                  <input
                    type="text"
                    value={addBookFormData.author}
                    onChange={(e) => setAddBookFormData(prev => ({ ...prev, author: e.target.value }))}
                    className="input-modern"
                    placeholder="F. Scott Fitzgerald"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Book Genre</label>
                  <input
                    type="text"
                    value={addBookFormData.genre}
                    onChange={(e) => setAddBookFormData(prev => ({ ...prev, genre: e.target.value }))}
                    className="input-modern"
                    placeholder="Classic Fiction"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Narrative Summary</label>
                <textarea
                  value={addBookFormData.description}
                  onChange={(e) => setAddBookFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="input-modern min-h-30 resize-none"
                  placeholder="Provide a brief synopsis..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Total Inv.</label>
                    <input
                      type="number"
                      min="1"
                      value={addBookFormData.availability.totalCopies}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setAddBookFormData(prev => ({ 
                          ...prev, 
                          availability: { ...prev.availability, totalCopies: val, availableCopies: Math.min(prev.availability.availableCopies, val) } 
                        }));
                      }}
                      className="input-modern"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Avail. Units</label>
                    <input
                      type="number"
                      min="0"
                      max={addBookFormData.availability.totalCopies}
                      value={addBookFormData.availability.availableCopies}
                      onChange={(e) => setAddBookFormData(prev => ({ 
                        ...prev, 
                        availability: { ...prev.availability, availableCopies: parseInt(e.target.value) || 0 } 
                      }))}
                      className="input-modern"
                    />
                 </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={onClose} className="flex-1 btn-secondary-modern text-[10px]">Discard</button>
                <button type="submit" className="flex-1 btn-modern shadow-xl text-[10px]">Confirm Addition</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const EditBookModal = ({ book, isOpen, onClose }) => {
    if (!isOpen || !book) return null;

    return (
      <div className="fixed inset-0 z-100 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md" onClick={onClose} />
          
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full p-10 overflow-hidden">
            <div className="mb-10 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <Edit3 className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 italic tracking-tight">Edit Volume</h2>
              <p className="text-sm font-semibold text-gray-400 mt-1 uppercase tracking-widest">Update Catalog Record</p>
            </div>
            
            <form onSubmit={handleUpdateBook} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Volume Title *</label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="input-modern"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Author Name *</label>
                  <input
                    type="text"
                    value={editFormData.author}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, author: e.target.value }))}
                    className="input-modern"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Book Genre</label>
                  <input
                    type="text"
                    value={editFormData.genre}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, genre: e.target.value }))}
                    className="input-modern"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Narrative Summary</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="input-modern min-h-30 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Total Inv.</label>
                    <input
                      type="number"
                      min="1"
                      value={editFormData.availability.totalCopies}
                      onChange={(e) => {
                        const total = parseInt(e.target.value) || 1;
                        setEditFormData(prev => ({ 
                          ...prev, 
                          availability: { ...prev.availability, totalCopies: total, availableCopies: Math.min(prev.availability.availableCopies, total) } 
                        }));
                      }}
                      className="input-modern"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Avail. Units</label>
                    <input
                      type="number"
                      min="0"
                      max={editFormData.availability.totalCopies}
                      value={editFormData.availability.availableCopies}
                      onChange={(e) => setEditFormData(prev => ({ 
                        ...prev, 
                        availability: { ...prev.availability, availableCopies: parseInt(e.target.value) || 0 } 
                      }))}
                      className="input-modern"
                    />
                 </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={onClose} className="flex-1 btn-secondary-modern text-[10px]">Discard Changes</button>
                <button type="submit" className="flex-1 btn-modern bg-blue-600 hover:bg-blue-700 shadow-xl text-[10px]">Update Record</button>
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
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Library Catalog</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium text-lg">
            Available books in our <span className="text-primary-600 dark:text-primary-400 font-bold decoration-primary-200 dark:decoration-primary-800 underline decoration-4 underline-offset-4">catalogue</span>.
          </p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-modern flex items-center gap-2.5 shadow-xl group"
          >
            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
            <span>Add New volume</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            </div>
            <input
              type="text"
              className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border border-transparent rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:border-primary-200 dark:focus:border-primary-800 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-slate-100"
              placeholder="Search by title, author, or genre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleSearch}
            disabled={searching}
            className="btn-modern px-8 flex items-center gap-2"
          >
            {searching ? <LoadingSpinner size="small" /> : <Search className="h-5 w-5" />}
            <span>Execute Search</span>
          </button>
          <button className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-100 dark:hover:border-primary-900 transition-all shadow-sm">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="py-40 flex items-center justify-center">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {books.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>

          {books.length === 0 && (
            <div className="py-40 text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-100">
                <BookOpen className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 font-serif italic mb-3">No matching volumes found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-10 font-medium">
                {searchTerm 
                  ? 'Our literary archives did not match your query. Try different terms.' 
                  : 'The library catalog is currently being updated by our curators.'
                }
              </p>
              {searchTerm && (
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    fetchBooks();
                  }}
                  className="btn-modern !py-3 !px-10"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

          <Pagination />
        </>
      )}

      {/* Modals */}
      <BookDetailsModal 
        book={selectedBook}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedBook(null);
        }}
      />

      <AddBookModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      <EditBookModal 
        book={selectedBook}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedBook(null);
        }}
      />
    </div>
  );
};

export default Books; 