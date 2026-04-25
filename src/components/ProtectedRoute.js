import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  // If role is specified and not allowed
  if (role !== "all" && user.role !== role) {
    return <h2>Access Denied</h2>;
  }

  return children;
};

export default ProtectedRoute;