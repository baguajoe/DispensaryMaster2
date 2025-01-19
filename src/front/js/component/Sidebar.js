import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../../styles/sidebar.css";

export const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [collapsedSections, setCollapsedSections] = useState({});
    const location = useLocation();

    // Configuration for sidebar sections and links
    const sections = {
        nonMedical: [
            { name: "Shop", path: "/shop" },
            { name: "Deals", path: "/deals" },
            { name: "Dashboard", path: "/dashboard" },
            { name: "Products", path: "/products" },
            { name: "Price Comparison", path: "/price-comparison" },
            { name: "Inventory", path: "/inventory" },
            { name: "Invoices", path: "/invoices" },
            { name: "Stores", path: "/stores" },
            { name: "Suppliers", path: "/suppliers" },
            { name: "Orders", path: "/orders" },
            { name: "Cart Management", path: "/cart-management" },
            { name: "Users", path: "/users" },
            { name: "Analytics Dashboard", path: "/analytics-dashboard" },
            { name: "Reports", path: "/reports" },
            { name: "Barcode Scanner", path: "/barcode-scanner" },
            { name: "Campaign", path: "/campaign" },
            { name: "Task", path: "/task" },
            { name: "Sales Pipeline", path: "/sales-pipeline" },
        ],
        medical: [
            { name: "Compliance Dashboard", path: "/medical/compliance-dashboard" },
            { name: "Compliance Reports", path: "/medical/compliance-reports" },
            { name: "Medical Analytics", path: "/medical/medical-analytics" },
            { name: "Patient Dashboard", path: "/medical/patient-dashboard" },
            { name: "Patient List", path: "/medical/patient-list" },
            { name: "Patient Profile", path: "/medical/patient-profile" },
            { name: "Patient Registration", path: "/medical/patient-registration" },
            { name: "Prescription Creation", path: "/medical/prescription-creation" },
            { name: "Prescription Management", path: "/medical/prescription-management" },
            { name: "Recommendations", path: "/medical/recommendations" },
            { name: "Resource Detail", path: "/medical/resource-detail" },
            { name: "Symptom Tracker", path: "/medical/symptom-tracker" },
        ],
        posSystem: [
            { name: "Main POS", path: "/pos" },
            { name: "Transaction History", path: "/pos/transactions" },
            { name: "Returns", path: "/pos/returns" },
            { name: "Reconciliation", path: "/pos/reconciliation" },
            { name: "Customer Management", path: "/pos/customers" },
            { name: "Receipt Management", path: "/pos/receipt-management" },
            { name: "POS Settings", path: "/pos/settings" },
            { name: "Offline Transactions", path: "/pos/offline-transactions" },
            { name: "Reports", path: "/pos/reports" },
        ],
        nonMedical: [
            { name: "Shop", path: "/shop" },
            { name: "Deals", path: "/deals" },
            { name: "Dashboard", path: "/dashboard" },
            { name: "Products", path: "/products" },
            { name: "Price Comparison", path: "/price-comparison" },
            { name: "Inventory", path: "/inventory" },
            { name: "Invoices", path: "/invoices" },
            { name: "Stores", path: "/stores" },
            { name: "Suppliers", path: "/suppliers" },
            { name: "Orders", path: "/orders" },
            { name: "Cart Management", path: "/cart-management" },
            { name: "Users", path: "/users" },
            { name: "Analytics Dashboard", path: "/analytics-dashboard" },
            { name: "Reports", path: "/reports" },
            { name: "Barcode Scanner", path: "/barcode-scanner" },
            { name: "Campaign", path: "/campaign" },
            { name: "Task", path: "/task" },
            { name: "Sales Pipeline", path: "/sales-pipeline" },
        ],
        medical: [
            { name: "Compliance Dashboard", path: "/medical/compliance-dashboard" },
            { name: "Compliance Reports", path: "/medical/compliance-reports" },
            { name: "Medical Analytics", path: "/medical/medical-analytics" },
            { name: "Patient Dashboard", path: "/medical/patient-dashboard" },
            { name: "Patient List", path: "/medical/patient-list" },
            { name: "Patient Profile", path: "/medical/patient-profile" },
            { name: "Patient Registration", path: "/medical/patient-registration" },
            { name: "Prescription Creation", path: "/medical/prescription-creation" },
            { name: "Prescription Management", path: "/medical/prescription-management" },
            { name: "Recommendations", path: "/medical/recommendations" },
            { name: "Resource Detail", path: "/medical/resource-detail" },
            { name: "Symptom Tracker", path: "/medical/symptom-tracker" },
        ],
        posSystem: [
            { name: "Main POS", path: "/pos" },
            { name: "Transaction History", path: "/pos/transactions" },
            { name: "Returns", path: "/pos/returns" },
            { name: "Reconciliation", path: "/pos/reconciliation" },
            { name: "Customer Management", path: "/pos/customers" },
            { name: "Receipt Management", path: "/pos/receipt-management" },
            { name: "POS Settings", path: "/pos/settings" },
            { name: "Offline Transactions", path: "/pos/offline-transactions" },
            { name: "Reports", path: "/pos/reports" },
        ],
        growFarms: [
            { name: "Add Grow Task", path: "/growfarms/add-grow-task" },
            { name: "Add Plant Batch", path: "/growfarms/add-plant-batch" },
            { name: "Alert Threshold", path: "/growfarms/alert-threshold" },
            { name: "Batch", path: "/growfarms/batch" },
            { name: "Dashboard", path: "/growfarms/dashboard" },
            { name: "Task List", path: "/growfarms/task-list" },
            { name: "Plant Batch Details", path: "/growfarms/plant-batch-details" },
            { name: "Plant Batch List", path: "/growfarms/plant-batch-list" },
            { name: "Grow Reports", path: "/growfarms/grow-reports" },
            { name: "Settings", path: "/growfarms/settings" },
            { name: "Yield Prediction", path: "/growfarms/yield-prediction" },
        ],
        seedBanks: [
            { name: "Add Seed Batch", path: "/seedbanks/add-seed-batch" },
            { name: "Dashboard", path: "/seedbanks/dashboard" },
            { name: "Settings", path: "/seedbanks/settings" },
            { name: "Batch Details", path: "/seedbanks/batch-details" },
            { name: "Batch List", path: "/seedbanks/batch-list" },
            { name: "Inventory", path: "/seedbanks/inventory" },
            { name: "Reports", path: "/seedbanks/reports" },
            { name: "Storage Conditions", path: "/seedbanks/storage-conditions" },
        ],
        customerDashboard: [
            { name: "Overview", path: "/customer/overview" },
            { name: "Profile", path: "/customer/profile" },
            { name: "Orders", path: "/customer/orders" },
            { name: "Wishlist", path: "/customer/wishlist" },
            { name: "Settings", path: "/customer/settings" },
            { name: "Support Tickets", path: "/customer/support-tickets" },
            { name: "Loyalty Program", path: "/customer/loyalty-program" },
            { name: "Analytics", path: "/customer/analytics" },
        ],
    };

    // Default collapse state based on current route
    useEffect(() => {
        const sectionMap = Object.entries(sections).reduce((map, [key, links]) => {
            const isActive = links.some((link) => link.path === location.pathname);
            return { ...map, [key]: isActive };
        }, {});
        setCollapsedSections(sectionMap);
    }, [location.pathname]);

    // Toggle section collapse
    const toggleSection = (section) => {
        setCollapsedSections((prevState) => ({
            ...prevState,
            [section]: !prevState[section],
        }));
    };

    return (
        <div className={`sidebar ${isCollapsed ? "sidebar-collapsed" : ""}`}>
            {/* Toggle Sidebar Collapse */}
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
                                        className={`nav-link ${
                                            location.pathname === link.path ? "active" : ""
                                        }`}
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
