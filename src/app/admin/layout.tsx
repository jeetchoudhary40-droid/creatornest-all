'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  CheckSquare, 
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  UserCog,
  Wrench,
  BookOpen,
  ShoppingCart,
  Star,
  GraduationCap
} from 'lucide-react';
import { auth, User } from '@/lib/auth';
import Logo from '@/components/Logo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const currentUser = auth.getCurrentUser();
    
    if (pathname === '/admin') {
      return;
    }

    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin' && !currentUser.is_superuser)) {
      router.push('/admin');
    } else {
      setUser(currentUser);
    }
  }, [router, pathname]);

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Courses', href: '/admin/courses', icon: GraduationCap },
    { name: 'Services', href: '/admin/services', icon: Briefcase },
    { name: 'Master Creators', href: '/admin/creators', icon: Users },
    { name: 'Roster Config', href: '/admin/roster', icon: Star },
    { name: 'AI Tools', href: '/admin/tools', icon: Wrench },
    { name: 'Applications', href: '/admin/applications', icon: CheckSquare },
    { name: 'User Management', href: '/admin/users', icon: UserCog },
    { name: 'Brands', href: '/admin/brands', icon: Briefcase },
    { name: 'Blog', href: '/admin/blog', icon: BookOpen },
  ];

  const handleLogout = () => {
    auth.logout();
    router.push('/admin');
  };

  if (!isClient) return null;

  if (pathname === '/admin') {
    return <>{children}</>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-white flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-surface/50 backdrop-blur-xl">
        <div className="p-6 border-b border-white/5">
          <Logo />
          <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-2">Admin Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-primary text-background font-bold shadow-[0_0_20px_rgba(0,242,254,0.15)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center space-x-3 px-4 py-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
              {user.full_name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user.full_name}</p>
              <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 lg:px-10 bg-background/50 backdrop-blur-md sticky top-0 z-30">
          <button 
            className="lg:hidden p-2 text-gray-400"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden md:flex items-center bg-surface border border-white/5 rounded-full px-4 py-2 w-96">
            <Search className="w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="bg-transparent border-none focus:ring-0 text-sm ml-3 w-full"
            />
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-white relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
            </button>
            <div className="h-8 w-px bg-white/5 hidden sm:block" />
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-sm font-bold">{user.full_name}</p>
              <p className="text-[10px] text-primary uppercase tracking-widest font-black">Super Admin</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          {children}
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 w-72 bg-surface z-50 lg:hidden flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <Logo />
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-2 mt-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                      pathname === item.href ? 'bg-primary text-background font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
