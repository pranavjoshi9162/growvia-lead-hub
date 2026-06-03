import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, Role } from "@/context/AuthContext";

interface Props {
  roles?: Role[];
}

export function ProtectedRoute({ roles }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-secondary/40">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    // Sales execs hitting an admin route → bounce to their home
    return <Navigate to="/leads" replace />;
  }

  return <Outlet />;
}
