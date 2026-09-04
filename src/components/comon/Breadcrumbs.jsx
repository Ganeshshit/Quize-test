import React from "react";
import { Link } from "react-router-dom";

const Breadcrumbs = ({ items }) => {
    return (
        <nav className="text-sm text-gray-600 mb-4">
            <ol className="flex items-center space-x-2">
                {items.map((item, index) => (
                    <li key={index} className="flex items-center">
                        {index > 0 && <span className="mx-1">/</span>}

                        {item.to ? (
                            <Link
                                to={item.to}
                                className="text-blue-600 hover:underline font-medium"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-gray-800 font-semibold">{item.label}</span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
