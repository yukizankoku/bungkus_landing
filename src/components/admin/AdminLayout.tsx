import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  Home,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { signOut } = useAuth();
  const { language, setLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'id' : 'en');
  };

  const menuItems = [
    { 
      href: '/admin', 
      icon: LayoutDashboard, 
      label: language === 'en' ? 'Dashboard' : 'Dasbor',
      exact: true
    },
    { 
      href: '/admin/pages', 
      icon: FileText, 
      label: language === 'en' ? 'Pages' : 'Halaman' 
    },
    { 
      href: '/admin/blogs', 
      icon: BookOpen, 
      label: 'Blog' 
    },
    { 
      href: '/admin/leads', 
      icon: MessageSquare, 
      label: language === 'en' ? 'Leads' : 'Kontak' 
    },
    { 
      href: '/admin/settings', 
      icon: Settings, 
      label: language === 'en' ? 'Settings' : 'Pengaturan' 
    },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <span className="font-semibold text-primary">Admin Panel</span>
        <Link to="/">
          <Button variant="ghost" size="icon">
            <Home className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-40 h-full w-64 bg-background border-r border-border transform transition-transform duration-200 ease-in-out",
        "lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">Bungkus</span>
              <span className="text-sm text-muted-foreground">Admin</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive(item.href, item.exact)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
                {isActive(item.href, item.exact) && (
                  <ChevronRight className="h-4 w-4 ml-auto" />
                )}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-2">
            {/* Language Switcher */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              onClick={toggleLanguage}
            >
              <Globe className="h-5 w-5" />
              <span className="flex-1 text-left">
                {language === 'en' ? 'English' : 'Bahasa Indonesia'}
              </span>
              <span className="text-xs bg-muted px-2 py-1 rounded">
                {language.toUpperCase()}
              </span>
            </Button>
            
            {/* Sign Out */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              {language === 'en' ? 'Sign Out' : 'Keluar'}
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
