import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../styles/sidebar.css";

export const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [collapsedSections, setCollapsedSections] = useState({});
    const location = useLocation();
    const navigate = useNavigate();

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
            { name: "Stores", path: "/stores" },
            { name: "Suppliers", path: "/suppliers" },
            { name: "Users", path: "/users" },
            { name: "Barcode Scanner", path: "/barcode-scanner" },
            { name: "Cart", path: "/cart-management" },
            { name: "Analytics Dashboard", path: "/analytics-dashboard" },
            { name: "Reports", path: "/reports" },
            { name: "Sales Reports", path: "/sales-reports" },
            { name: "Campaigns", path: "/campaigns" },
            { name: "Sales Dashboard", path: "/sales-dashboard" },
            { name: "Revenue Reports", path: "/revenue-reports" },
            { name: "Discount Management", path: "/discount-management" },
            { name: "Stock Alerts", path: "/stock-alerts" },
            { name: "Inventory Dashboard", path: "/inventory-dashboard" },
            { name: "Leads", path: "/leads" },
            { name: "Sales Pipeline", path: "/sales-pipeline" },
            { name: "Help Center", path: "/help" },
            { name: "Customers", path: "/customers" },
        ],
        leafBridge: [
            { name: "🌿 LeafBridge Connect", path: "/leafbridge" },
        ],
        posSystem: [
            { name: "Main POS", path: "/pos" },
            { name: "Transaction History", path: "/pos/transactions" },
            { name: "Returns", path: "/pos/returns" },
            { name: "Receipt Management", path: "/pos/receipt-management" },
            { name: "Reports", path: "/pos/reports" },
            { name: "Customer Management", path: "/pos/customers" },
            { name: "Reconciliation", path: "/pos/reconciliation" },
            { name: "POS Settings", path: "/pos/settings" },
            { name: "Offline Transactions", path: "/pos/offline" },
        ],
        medical: [
            { name: "Medical Dashboard", path: "/medical/dashboard" },
            { name: "Compliance Dashboard", path: "/medical/compliance-dashboard" },
            { name: "Compliance Reports", path: "/medical/compliance-reports" },
            { name: "Appointment Management", path: "/medical/appointment-management" },
            { name: "Medical Analytics", path: "/medical/medical-analytics" },
            { name: "Patient List", path: "/medical/patient-list" },
            { name: "Patient Registration", path: "/medical/patient-registration" },
            { name: "Prescription Management", path: "/medical/prescription-management" },
        ],
        growFarms: [
            { name: "Dashboard", path: "/growfarms/dashboard" },
            { name: "Add Plant Batch", path: "/growfarms/add-plant-batch" },
            { name: "Add Grow Task", path: "/growfarms/add-grow-task" },
            { name: "Task List", path: "/growfarms/task-list" },
            { name: "Plant Batch List", path: "/growfarms/plant-batch-list" },
            { name: "Yield Prediction", path: "/growfarms/yield-prediction" },
            { name: "Overview", path: "/growfarms/overview" },
            { name: "Assign Task", path: "/growfarms/assign-task" },
            { name: "Environment", path: "/growfarms/environment" },
            { name: "Strain Catalog", path: "/growfarms/strain-catalog" },
            { name: "Calendar", path: "/growfarms/calendar" },
            { name: "Resources", path: "/growfarms/resources" },
            { name: "Alerts", path: "/growfarms/alerts" },
            { name: "Settings", path: "/growfarms/settings" },
            { name: "Harvest Log", path: "/growfarms/harvest-log" },
            { name: "Pest & Disease", path: "/growfarms/pest-disease" },
            { name: "Reports", path: "/growfarms/reports" },
        ],
        seedBanks: [
            { name: "Dashboard", path: "/seedbanks/dashboard" },
            { name: "Add Seed Batch", path: "/seedbanks/add-seed-batch" },
            { name: "Batch List", path: "/seedbanks/batch-list" },
            { name: "Inventory", path: "/seedbanks/inventory" },
            { name: "Reports", path: "/seedbanks/reports" },
            { name: "Analytics", path: "/seedbanks/analytics" },
            { name: "Calendar", path: "/seedbanks/calendar" },
            { name: "Resources", path: "/seedbanks/resources" },
            { name: "Notifications", path: "/seedbanks/notifications" },
            { name: "Settings", path: "/seedbanks/settings" },
            { name: "Storage Conditions", path: "/seedbanks/storage-conditions" },
            { name: "Storage Conditions", path: "/seedbanks/storage-conditions" },
        ],
        customerDashboard: [
            { name: "Overview", path: "/dashboard-overview" },
            { name: "Profile", path: "/customer/profile" },
            { name: "Order History", path: "/customer/orders" },
            { name: "Wishlist", path: "/customer/wishlist" },
            { name: "Loyalty Program", path: "/customer/loyalty-program" },
            { name: "Analytics", path: "/customer/analytics" },
        ],
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

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const sectionLabels = {
        nonMedical: "Non Medical",
        leafBridge: "LeafBridge Connect",
        posSystem: "POS System",
        medical: "Medical",
        growFarms: "Grow Farms",
        seedBanks: "Seed Banks",
        customerDashboard: "Customer Dashboard",
    };

    return (
        <div className={`sidebar ${isCollapsed ? "sidebar-collapsed" : ""}`}>
            <button
                className="sidebar-toggle"
                onClick={() => setIsCollapsed((prev) => !prev)}
            >
                {isCollapsed ? "→" : "←"}
            </button>

            {!isCollapsed && (
                <div className="sidebar-brand">
                    <span>BudphoriaPro</span>
                </div>
            )}

            <nav className="sidebar-nav">
                {Object.entries(sections).map(([section, links]) => (
                    <div key={section}>
                        <h5
                            className="sidebar-heading"
                            onClick={() => toggleSection(section)}
                            aria-expanded={!!collapsedSections[section]}
                        >
                            {!isCollapsed && (sectionLabels[section] || section.replace(/([A-Z])/g, " $1").trim())}
                            <span className="sidebar-arrow">
                                {collapsedSections[section] ? "▲" : "▼"}
                            </span>
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

                <button className="nav-link text-danger logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </nav>
        </div>
    );
};

export default Sidebar;
