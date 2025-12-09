// src/router/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { routes } from "./routes";

const AppRouter = () => {
    return (
        <Routes>

            {/* Redirect root "/" to "/login" */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {routes.map((route, i) => (
                <Route
                    key={i}
                    path={route.path}
                    element={route.element}
                >
                    {/* Render nested children if present */}
                    {route.children &&
                        route.children.map((child, j) => (
                            <Route
                                key={j}
                                path={child.path}
                                element={child.element}
                            />
                        ))}
                </Route>
            ))}

            {/* Fallback for undefined routes → redirect to /login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRouter;
