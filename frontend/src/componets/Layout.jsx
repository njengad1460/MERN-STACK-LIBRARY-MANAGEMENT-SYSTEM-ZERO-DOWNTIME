// Layout.jsx is the "skeleton" of your application. It ensures that the navigation, sidebar, and branding remain consistent while the central content changes based on the URL.

import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  BookOpen, 
  Home, 
  User, 
  Users, 
  FileText, 
  LogOut, 
  Menu, 
  X,
  Library,
  Sun,
  Moon
} from 'lucide-react';

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Books', href: '/books', icon: BookOpen },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const adminNavigation = [
    { name: 'Manage Users', href: '/admin/users', icon: Users },
    { name: 'Transactions', href: '/admin/transactions', icon: FileText },
  ];

  const ThemeToggle = ({ mobile = false }) => (
    <button
      onClick={toggleTheme}
      className={`p-2.5 rounded-xl transition-all duration-300 ${
        mobile 
          ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' 
          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
      }`}
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </button>
  );

  const NavItem = ({ item, mobile = false }) => (
    <NavLink
      to={item.href}
      className={({ isActive }) => 
        `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'} ${mobile ? 'text-base' : ''}`
      }
      onClick={() => mobile && setSidebarOpen(false)}
    >
      <item.icon
        className={`mr-3 shrink-0 h-5 w-5 transition-colors duration-200`}
        aria-hidden="true"
      />
      {item.name}
    </NavLink>
  );

  return (
    <div className="h-screen flex bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/60"
          onClick={() => setSidebarOpen(false)}
        />
        
        {/* Mobile sidebar */}
        <div className={`relative flex flex-col w-full max-w-xs h-full bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <Library className="h-6 w-6 text-primary-600" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Library Management System</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <NavItem key={item.name} item={item} mobile />
              ))}
              
              {isAdmin && (
                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                  <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                    Administration
                  </p>
                  <div className="space-y-2">
                    {adminNavigation.map((item) => (
                      <NavItem key={item.name} item={item} mobile />
                    ))}
                  </div>
                </div>
              )}
            </nav>
          </div>
          
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Theme</span>
              <ThemeToggle mobile />
            </div>
            <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <div className="shrink-0">
                <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center border border-slate-100 dark:border-slate-700">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:shrink-0">
        <div className="flex flex-col w-72 h-full bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center h-20 px-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                <Library className="h-7 w-7 text-primary-600" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">Library Management System</span>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col overflow-y-auto px-4 py-6">
            <nav className="space-y-1.5 focus:outline-none">
              {navigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
              
              {isAdmin && (
                <div className="pt-8 mt-8 border-t border-slate-100 dark:border-slate-800">
                  <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                    Administration
                  </p>
                  <div className="space-y-1.5">
                    {adminNavigation.map((item) => (
                      <NavItem key={item.name} item={item} />
                    ))}
                  </div>
                </div>
              )}
            </nav>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="group flex items-center p-3.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border border-slate-100/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300">
              <div className="shrink-0">
                <div className="h-11 w-11 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:scale-105 transition-transform duration-300">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div className="ml-3.5 flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 p-2.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 relative h-full">
        {/* Mobile top navigation */}
        <div className="lg:hidden flex items-center justify-between h-16 px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 z-10 transition-colors">
          <button
            type="button"
            className="p-2 -ml-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <Library className="h-7 w-7 text-primary-600" />
            <span className="text-lg font-bold text-slate-900 dark:text-white">LMS</span>
          </div>
          
          <ThemeToggle />
        </div>

        {/* Global Header */}
        <header className="hidden lg:flex items-center justify-end h-20 px-10 bg-transparent">
           <ThemeToggle />
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="max-w-screen-2xl mx-auto h-full min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
 




/*
2. The Mobile Top-Bar (lg:hidden)
Since your sidebar is hidden on mobile, the user needs a way to actually open it.

The Hamburger Menu (Menu icon): This button triggers setSidebarOpen(true), which slides out the mobile menu we discussed earlier.

Visual Branding: It repeats the LibraryMS logo. This is important for Brand Consistency; users should always know what app they are in, even if the sidebar is closed.

The "Centering Spacer": That empty div with w-10 is a clever CSS trick. It balances the "Menu" button on the left, ensuring the logo in the middle stays perfectly centered.

3. The Page Content Area (<main>)
Independent Scrolling (overflow-y-auto): This is critical. You want your Sidebar to stay fixed while only the Main Content scrolls. This keeps the navigation always within reach of the user.

Focus Management (focus:outline-none): This helps with accessibility, ensuring that when a user navigates between pages, the focus doesn't create awkward outlines on the main container.

4. The Outlet (The Heart of the Layout)
Dynamic Injection: This is where the magic happens. When the URL is /books, the Books component renders here. When it's /profile, the Profile component renders here.

Efficiency: Because the Outlet is inside this layout, React doesn't have to re-render the Sidebar or Header when you switch pages. This makes your app feel much faster and smoother */