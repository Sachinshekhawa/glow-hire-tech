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
import SystemBehavior from "./pages/SystemBehavior.tsx";
import ClientFieldsAdmin from "./pages/ClientFieldsAdmin.tsx";
import CreateJob from "./pages/CreateJob.tsx";
import { ThemeProvider } from "./components/ThemeProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/blog" element={<BlogIndex />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/admin/system-behavior" element={<SystemBehavior />} />
            <Route path="/admin/client-fields" element={<ClientFieldsAdmin />} />
            <Route path="/create-job" element={<CreateJob />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
