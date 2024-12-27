import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false); // Collapsible state
    const [collapsedSections, setCollapsedSections] = useState({
        sales: false,
        medical: false,
        settings: false,
    });

    const location = useLocation();

    const toggleSection = (section) => {
        setCollapsedSections((prevState) => ({
            ...prevState,
            [section]: !prevState[section],
        }));
    };

    return (
        <div
            className={`d-flex flex-column bg-light ${
                isCollapsed ? "w-16" : "w-64"
            } transition-all duration-300`}
            style={{ height: "100vh" }}
        >
            {/* Toggle Sidebar Collapse */}
            <button
                className="p-3 text-gray-500 hover:text-gray-900"
                onClick={() => setIsCollapsed((prev) => !prev)}
            >
                {isCollapsed ? "→" : "←"}
            </button>

            <nav className="nav flex-column px-3">
                {/* Existing Links */}
                {[
                    { path: "/overview", label: "Overview" },
                    { path: "/summary", label: "Summary" },
                    { path: "/dashboard", label: "Dashboard" },
                    { path: "/stores", label: "Stores" },
                    { path: "/suppliers", label: "Suppliers" },
                    { path: "/products", label: "Products" },
                    { path: "/price-comparison", label: "Price Comparison" }, // New Price Comparison Link
                    { path: "/category", label: "Category" },
                    { path: "/pos", label: "POS" },
                    { path: "/orders", label: "Orders" },
                    { path: "/cart-management", label: "Cart Management" },
                    { path: "/inventory", label: "Inventory" },
                    { path: "/users", label: "Users" },
                    { path: "/analytics", label: "Analytics" },
                    { path: "/reports", label: "Reports" },
                    { path: "/barcode-scanner", label: "Barcode Scanner" },
                    { path: "/campaigns", label: "Campaign Management" },
                    { path: "/tasks", label: "Task Management" },
                ].map(({ path, label }) => (
                    <Link
                        key={path}
                        className={`nav-link ${
                            location.pathname === path ? "bg-blue-500 text-white" : ""
                        }`}
                        to={path}
                    >
                        {label}
                    </Link>
                ))}

                {/* Divider */}
                <hr className="my-3" />

                {/* Collapsible Sales Features */}
                <h5
                    className="px-3 mt-3 text-secondary cursor-pointer"
                    onClick={() => toggleSection("sales")}
                >
                    Sales Features
                </h5>
                {!collapsedSections.sales && (
                    <>
                        <Link
                            className={`nav-link ${
                                location.pathname === "/leads" ? "bg-blue-500 text-white" : ""
                            }`}
                            to="/leads"
                        >
                            Leads
                        </Link>
                    </>
                )}

                {/* Collapsible Medical Features */}
                <h5
                    className="px-3 mt-3 text-secondary cursor-pointer"
                    onClick={() => toggleSection("medical")}
                >
                    Medical Features
                </h5>
                {!collapsedSections.medical && (
                    <>
                        <Link
                            className={`nav-link ${
                                location.pathname === "/medical-dashboard"
                                    ? "bg-blue-500 text-white"
                                    : ""
                            }`}
                            to="/medical-dashboard"
                        >
                            Medical Dashboard
                        </Link>
                        <Link
                            className={`nav-link ${
                                location.pathname === "/patient-management"
                                    ? "bg-blue-500 text-white"
                                    : ""
                            }`}
                            to="/patient-management"
                        >
                            Patient Management
                        </Link>
                        <Link
                            className={`nav-link ${
                                location.pathname === "/prescription-tracking"
                                    ? "bg-blue-500 text-white"
                                    : ""
                            }`}
                            to="/prescription-tracking"
                        >
                            Prescription Tracking
                        </Link>
                        <Link
                            className={`nav-link ${
                                location.pathname === "/medical-reports"
                                    ? "bg-blue-500 text-white"
                                    : ""
                            }`}
                            to="/medical-reports"
                        >
                            Medical Reports
                        </Link>
                    </>
                )}

                {/* Collapsible Settings Section */}
                <h5
                    className="px-3 mt-3 text-secondary cursor-pointer"
                    onClick={() => toggleSection("settings")}
                >
                    Settings
                </h5>
                {!collapsedSections.settings && (
                    <>
                        <Link
                            className={`nav-link ${
                                location.pathname === "/profile-settings"
                                    ? "bg-blue-500 text-white"
                                    : ""
                            }`}
                            to="/profile-settings"
                        >
                            Profile Settings
                        </Link>
                        <Link
                            className={`nav-link ${
                                location.pathname === "/system-settings"
                                    ? "bg-blue-500 text-white"
                                    : ""
                            }`}
                            to="/system-settings"
                        >
                            System Settings
                        </Link>
                        <Link
                            className={`nav-link ${
                                location.pathname === "/notifications"
                                    ? "bg-blue-500 text-white"
                                    : ""
                            }`}
                            to="/notifications"
                        >
                            Notifications
                        </Link>
                    </>
                )}

                {/* Help and Logout */}
                <hr className="my-3" />
                <Link
                    className={`nav-link ${
                        location.pathname === "/help" ? "bg-blue-500 text-white" : ""
                    }`}
                    to="/help"
                >
                    Help
                </Link>
                <Link
                    className={`nav-link ${
                        location.pathname === "/contact-us"
                            ? "bg-blue-500 text-white"
                            : ""
                    }`}
                    to="/contact-us"
                >
                    Contact Us
                </Link>
                <Link
                    className="nav-link text-danger mt-3"
                    to="/logout"
                >
                    Logout
                </Link>
            </nav>
        </div>
    );
};

export default Sidebar;
