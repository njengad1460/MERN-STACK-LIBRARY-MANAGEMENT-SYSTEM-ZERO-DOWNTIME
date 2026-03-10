import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoadingSpinner from './componets/LoadingSpinner'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './componets/Layout'
import Register from './pages/Register'
import { LogIn } from 'lucide-react';


// protect Route Components

const ProtectedRoute = ({ children, adminOnly = false}) =>{
  const {isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner></LoadingSpinner>;
  }

  if (!isAuthenticated) {
    return <Navigate to ="/login" replace />
  }
  if (adminOnly && !isAdmin) {
    return <Navigate to ="/dashboard" replace />
  }
  return children;
}

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if(loading) {
    return <LoadingSpinner />
  }
  if (isAuthenticated) {
    return <Navigate to ="/dashboard" replace />
  }
  return children;
};

function AppRoutes() {
  return (
    <Router 
      future = {{
        v7_startTransaction:true,
        v7_relativeSplatPath: true
      }}
    > 
      <Routes>
        {/* Public Routes */}
        <Route path='/login' element ={
          <PublicRoute>
            <LogIn />
          </PublicRoute>
        } />
        <Route 
          path='/register'
          element ={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
          />
          {/* Protected Routes */}
          <Route path='/' element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element ={<Navigate to ="/darshboard" replace />}></Route>
            <Route path='dashboard' element={<Dashboard />}></Route>
            <Route path='books' element ={<Books />}></Route>
            <Route path = 'profile' element ={<Profile />}></Route>

            {/*admin only routes */}
            <Route path='admin/users' element={
              <ProtectedRoute adminOnly>
                <AdminUsers />
              </ProtectedRoute>
            }>
            </Route>
            <Route path='admin/transactions' element ={
              <ProtectedRoute adminOnly>
                <AdminTransactions />
              </ProtectedRoute>
            }>
            </Route>
          </Route>
          {/* catch all route */}
          <Route path='*' element = {<Navigate to = "/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <div className='min-h-screen bg-gray-50'>
        <AppRoutes />
        <Toaster
          position='top-right'
          toastOptions={{
            duration: 4000,
            style:{
              background: '#363636',
              color:'#fff',
            },
          }}
          />
      </div>
    </AuthProvider>
  );
}

export default App

