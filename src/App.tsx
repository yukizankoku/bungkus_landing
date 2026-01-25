import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";

// Public Pages
import Home from "./pages/Home";
import BlogPost from "./pages/BlogPost";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Admin Pages
import ProtectedRoute from "./components/admin/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPages from "./pages/admin/AdminPages";
import AdminPageEditor from "./pages/admin/AdminPageEditor";
import AdminBlogs from "./pages/admin/AdminBlogs";
import AdminBlogEditor from "./pages/admin/AdminBlogEditor";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminHomeEditor from "./pages/admin/AdminHomeEditor";
import AdminMenus from "./pages/admin/AdminMenus";
import AdminCustomPages from "./pages/admin/AdminCustomPages";
import AdminCustomPageEditor from "./pages/admin/AdminCustomPageEditor";
import CustomPage from "./pages/CustomPage";
import DynamicBuiltInPageRouter from "./components/common/DynamicBuiltInPageRouter";

// Components
import { PromoPopup } from "./components/common/PromoPopup";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { DynamicFavicon } from "./components/common/DynamicFavicon";
import { TrackingScripts } from "./components/common/TrackingScripts";
import { SchemaMarkup } from "./components/common/SchemaMarkup";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TrackingScripts />
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <DynamicFavicon />
              <SchemaMarkup />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/pages" element={<ProtectedRoute><AdminPages /></ProtectedRoute>} />
                <Route path="/admin/pages/:pageKey" element={<ProtectedRoute><AdminPageEditor /></ProtectedRoute>} />
                <Route path="/admin/home" element={<ProtectedRoute><AdminHomeEditor /></ProtectedRoute>} />
                <Route path="/admin/menus" element={<ProtectedRoute><AdminMenus /></ProtectedRoute>} />
                <Route path="/admin/blogs" element={<ProtectedRoute><AdminBlogs /></ProtectedRoute>} />
                <Route path="/admin/blogs/new" element={<ProtectedRoute><AdminBlogEditor /></ProtectedRoute>} />
                <Route path="/admin/blogs/:id" element={<ProtectedRoute><AdminBlogEditor /></ProtectedRoute>} />
                <Route path="/admin/leads" element={<ProtectedRoute><AdminLeads /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
                <Route path="/admin/custom-pages" element={<ProtectedRoute><AdminCustomPages /></ProtectedRoute>} />
                <Route path="/admin/custom-pages/:id" element={<ProtectedRoute><AdminCustomPageEditor /></ProtectedRoute>} />
                
                {/* Custom Pages Route with /p/ prefix */}
                <Route path="/p/:slug" element={<CustomPage />} />
                
                {/* Dynamic routing for all other paths - checks both built-in and custom pages */}
                <Route path="/:slug" element={<DynamicBuiltInPageRouter />} />
                <Route path="/:slug/:subslug" element={<DynamicBuiltInPageRouter />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              <PromoPopup />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;