import { Navigate } from "react-router-dom";
import { authService } from "../services/auth.service"; // you already have this

export default function AuthGuard({ children }) {
    const isAuthenticated = authService.isAuthenticated();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
