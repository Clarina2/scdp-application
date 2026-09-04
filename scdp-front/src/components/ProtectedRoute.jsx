import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { DEMO_MODE } from "../config/demo";

const ProtectedRoute = ({ children, role }) => {
  const { user, viewAsUser, loading } = useAuth();

  if (DEMO_MODE) {
    return children;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Chargement...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Check role if specified
  // Admin can access any route when viewing as another user
  // Or if the route doesn't require a specific role
  if (!role) {
    return children;
  }

  // If user is admin and in view-as mode, check against the view-as role
  if (user.role === 'ADMIN' && viewAsUser) {
    if (viewAsUser.role === role) {
      return children;
    }
    return <Navigate to="/" replace />;
  }

  // Normal role check
  if (user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
