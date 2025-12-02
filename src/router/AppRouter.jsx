import { Routes, Route } from "react-router-dom";
import { routes } from "./routes";

const AppRouter = () => {
    return (
        <Routes>
            {routes.map((route, i) => (
                <Route key={i} path={route.path} element={route.element}>

                    {/* If the route has children → render nested routes */}
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
        </Routes>
    );
};

export default AppRouter;
