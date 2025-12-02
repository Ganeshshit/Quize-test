import { Navigate } from "react-router-dom";
import { authService } from "../services/auth.service";

export default function RoleGuard({ children, roles }) {
    const userRole = authService.getCurrentUserRole();

    if (!userRole || !roles.includes(userRole)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
