import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "@/hooks/useAuth";
import FloatingChatbot from "@/components/FloatingChatbot";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <CircularProgress size={28} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location.pathname + location.search }} replace />;
  }

  return (
    <>
      {children}
      <FloatingChatbot />
    </>
  );
};

export default ProtectedRoute;
