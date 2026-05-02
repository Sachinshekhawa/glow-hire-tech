import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import BlogIndex from "./pages/Blog.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import SignIn from "./pages/SignIn.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import ManagerDashboard from "./pages/ManagerDashboard.tsx";
import SystemBehavior from "./pages/SystemBehavior.tsx";
import ClientFieldsAdmin from "./pages/ClientFieldsAdmin.tsx";
import CreateJob from "./pages/CreateJob.tsx";
import Jobs from "./pages/Jobs.tsx";
import JobDetail from "./pages/JobDetail.tsx";
import { ThemeProvider } from "./components/ThemeProvider";
import MuiThemeBridge from "./components/MuiThemeBridge";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <MuiThemeBridge>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/blog" element={<BlogIndex />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/manager" element={<ProtectedRoute><ManagerDashboard /></ProtectedRoute>} />
            <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
            <Route path="/jobs/:id" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
            <Route path="/create-job" element={<ProtectedRoute><CreateJob /></ProtectedRoute>} />
            <Route path="/admin/system-behavior" element={<ProtectedRoute><SystemBehavior /></ProtectedRoute>} />
            <Route path="/admin/client-fields" element={<ProtectedRoute><ClientFieldsAdmin /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </MuiThemeBridge>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
