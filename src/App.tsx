import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";

// Public Pages
import Home from "./pages/Home";
import CorporateSolutions from "./pages/CorporateSolutions";
import UMKMSolutions from "./pages/UMKMSolutions";
import Products from "./pages/Products";
import ProductCatalog from "./pages/ProductCatalog";
import CaseStudies from "./pages/CaseStudies";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
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

// Components
import { PromoPopup } from "./components/common/PromoPopup";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { DynamicFavicon } from "./components/common/DynamicFavicon";
import { TrackingScripts } from "./components/common/TrackingScripts";

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
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/solusi-korporat" element={<CorporateSolutions />} />
                <Route path="/solusi-umkm" element={<UMKMSolutions />} />
                <Route path="/produk" element={<Products />} />
                <Route path="/produk/katalog" element={<ProductCatalog />} />
                <Route path="/case-studies" element={<CaseStudies />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/tentang-kami" element={<About />} />
                <Route path="/hubungi-kami" element={<Contact />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsConditions />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/pages" element={<ProtectedRoute><AdminPages /></ProtectedRoute>} />
                <Route path="/admin/pages/:pageKey" element={<ProtectedRoute><AdminPageEditor /></ProtectedRoute>} />
                <Route path="/admin/home" element={<ProtectedRoute><AdminHomeEditor /></ProtectedRoute>} />
                <Route path="/admin/blogs" element={<ProtectedRoute><AdminBlogs /></ProtectedRoute>} />
                <Route path="/admin/blogs/new" element={<ProtectedRoute><AdminBlogEditor /></ProtectedRoute>} />
                <Route path="/admin/blogs/:id" element={<ProtectedRoute><AdminBlogEditor /></ProtectedRoute>} />
                <Route path="/admin/leads" element={<ProtectedRoute><AdminLeads /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
                
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