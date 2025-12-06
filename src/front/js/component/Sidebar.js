import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../../styles/sidebar.css";

export const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [collapsedSections, setCollapsedSections] = useState({});
    const location = useLocation();

    // Configuration for sidebar sections and links (only essential features retained)
    const sections = {
        nonMedical: [
            { name: "Shop", path: "/shop" },
            { name: "Deals", path: "/deals" },
            { name: "Dashboard", path: "/dashboard" },
            { name: "Products", path: "/products" },
            { name: "Price Comparison", path: "/price-comparison" },
            { name: "Inventory", path: "/inventory" },
            { name: "Invoices", path: "/invoices" },
            { name: "Orders", path: "/orders" },
            { name: "Analytics Dashboard", path: "/analytics-dashboard" },
            { name: "Reports", path: "/reports" },
            { name: "Sales Reports", path: "/sales-reports" }
        ],
        medical: [
            { name: "Compliance Dashboard", path: "/medical/compliance-dashboard" },
            { name: "Compliance Reports", path: "/medical/compliance-reports" },
            { name: "Appointment Management", path: "/medical/appointment-management" },
            { name: "Medical Analytics", path: "/medical/medical-analytics" },
            { name: "Patient List", path: "/medical/patient-list" },
            { name: "Patient Registration", path: "/medical/patient-registration" },
            { name: "Prescription Management", path: "/medical/prescription-management" }
        ],
        posSystem: [
            { name: "Main POS", path: "/pos" },
            { name: "Transaction History", path: "/pos/transactions" },
            { name: "Returns", path: "/pos/returns" },
            { name: "Receipt Management", path: "/pos/receipt-management" },
            { name: "Reports", path: "/pos/reports" }
        ],
        growFarms: [
            { name: "Dashboard", path: "/growfarms/dashboard" },
            { name: "Add Plant Batch", path: "/growfarms/add-plant-batch" },
            { name: "Add Grow Task", path: "/growfarms/add-grow-task" },
            { name: "Task List", path: "/growfarms/task-list" },
            { name: "Plant Batch List", path: "/growfarms/plant-batch-list" },
            { name: "Yield Prediction", path: "/growfarms/yield-prediction" }
        ],
        seedBanks: [
            { name: "Dashboard", path: "/seedbanks/dashboard" },
            { name: "Add Seed Batch", path: "/seedbanks/add-seed-batch" },
            { name: "Batch List", path: "/seedbanks/batch-list" },
            { name: "Inventory", path: "/seedbanks/inventory" },
            { name: "Reports", path: "/seedbanks/reports" }
        ],
        customerDashboard: [
            { name: "Overview", path: "/customer/overview" },
            { name: "Profile", path: "/customer/profile" },
            { name: "Orders", path: "/customer/orders" },
            { name: "Wishlist", path: "/customer/wishlist" },
            { name: "Loyalty Program", path: "/customer/loyalty-program" },
            { name: "Analytics", path: "/customer/analytics" }
        ]
    };

    useEffect(() => {
        const sectionMap = Object.entries(sections).reduce((map, [key, links]) => {
            const isActive = links.some((link) => link.path === location.pathname);
            return { ...map, [key]: isActive };
        }, {});
        setCollapsedSections(sectionMap);
    }, [location.pathname]);

    const toggleSection = (section) => {
        setCollapsedSections((prevState) => ({
            ...prevState,
            [section]: !prevState[section],
        }));
    };

    return (
        <div className={`sidebar ${isCollapsed ? "sidebar-collapsed" : ""}`}>
            <button
                className="sidebar-toggle"
                onClick={() => setIsCollapsed((prev) => !prev)}
            >
                {isCollapsed ? "→" : "←"}
            </button>

            <nav className="sidebar-nav">
                {Object.entries(sections).map(([section, links]) => (
                    <div key={section}>
                        <h5
                            className="sidebar-heading"
                            onClick={() => toggleSection(section)}
                            aria-expanded={!collapsedSections[section]}
                        >
                            {section.replace(/([A-Z])/g, " $1").trim()}
                        </h5>
                        {collapsedSections[section] && (
                            <div className="dropdown-content">
                                {links.map((link) => (
                                    <Link
                                        key={link.path}
                                        className={`nav-link ${location.pathname === link.path ? "active" : ""}`}
                                        to={link.path}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                        <hr className="sidebar-divider" />
                    </div>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
