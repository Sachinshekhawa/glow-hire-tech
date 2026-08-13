import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ensureCandidateRole } from "@/data/candidatePortal";

/** Guards the candidate portal: requires a session and tags the user as a candidate. */
const CandidateRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) return;
    ensureCandidateRole()
      .catch(() => null)
      .finally(() => setReady(true));
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="h-6 w-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/candidate/signin" replace />;

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="h-6 w-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};

export default CandidateRoute;
