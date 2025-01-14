import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../../styles/sidebar.css";

export const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [collapsedSections, setCollapsedSections] = useState({
        nonMedical: false,
        medical: false,
        growFarms: false,
        seedBanks: false,
        utilities: false,
        posSystem: false, // Added for POS System
    });

    const location = useLocation();

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
                {/* Non-Medical Features */}
                <h5
                    className="sidebar-heading"
                    onClick={() => toggleSection("nonMedical")}
                >
                    Non-Medical Features
                </h5>
                {collapsedSections.nonMedical && (
                    <div className="dropdown-content">
                        <Link className={`nav-link ${location.pathname === "/shop" ? "active" : ""}`} to="/shop">
                            Shop
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/deals" ? "active" : ""}`} to="/deals">
                            Deals
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""}`} to="/dashboard">
                            Dashboard
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/products" ? "active" : ""}`} to="/products">
                            Products
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/price-comparison" ? "active" : ""}`} to="/price-comparison">
                            Price Comparison
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/inventory" ? "active" : ""}`} to="/inventory">
                            Inventory
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/analytics-dashboard" ? "active" : ""}`} to="/analytics-dashboard">
                            Leads
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/invoices" ? "active" : ""}`} to="/invoices">
                            Invoices
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/stores" ? "active" : ""}`} to="/stores">
                            Stores
                        </Link>
                        {/* <Link className={`nav-link ${location.pathname === "/stores/add" ? "active" : ""}`} to="/stores/add">
                            Add Store
                        </Link> */}
                        <Link className={`nav-link ${location.pathname === "/suppliers" ? "active" : ""}`} to="/suppliers">
                            Suppliers
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/orders" ? "active" : ""}`} to="/orders">
                            Orders
                        </Link>
                        
                        <Link className={`nav-link ${location.pathname === "/cart-management" ? "active" : ""}`} to="/cart-management">
                            Cart Management
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/users" ? "active" : ""}`} to="/users">
                            Users
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/analytics-dashboard" ? "active" : ""}`} to="/analytics-dashboard">
                            Analytics Dashboard
                        </Link>
                        
                        <Link className={`nav-link ${location.pathname === "/reports" ? "active" : ""}`} to="/reports">
                            Reports
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/barcode-scanner" ? "active" : ""}`} to="/barcode-scanner">
                            Barcode Scanner
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/campaign" ? "active" : ""}`} to="/campaign">
                            Campaign
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/task" ? "active" : ""}`} to="/task">
                            Task
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/sales-pipeline" ? "active" : ""}`} to="/sales-pipeline">
                            Sales Pipeline
                        </Link>
                    </div>
                )}

                {/* Divider */}
                <hr className="sidebar-divider" />

                {/* Medical Features */}
                <h5
                    className="sidebar-heading"
                    onClick={() => toggleSection("medical")}
                >
                    Medical Features
                </h5>
                {collapsedSections.medical && (
                    <div className="dropdown-content">
                        <Link className={`nav-link ${location.pathname === "/medical/compliance-dashboard" ? "active" : ""}`} to="/medical/compliance-dashboard">
                            Compliance Dashboard
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/medical/compliance-reports" ? "active" : ""}`} to="/medical/compliance-reports">
                            Compliance Reports
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/medical/medical-analytics" ? "active" : ""}`} to="/medical/medical-analytics">
                            Medical Analytics
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/medical/patient-dashboard" ? "active" : ""}`} to="/medical/patient-dashboard">
                            Patient Dashboard
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/medical/patient-list" ? "active" : ""}`} to="/medical/patient-list">
                            Patient List
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/medical/patient-profile" ? "active" : ""}`} to="/medical/patient-profile">
                            Patient Profile
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/medical/patient-registration" ? "active" : ""}`} to="/medical/patient-registration">
                            Patient Registration
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/medical/prescription-creation" ? "active" : ""}`} to="/medical/prescription-creation">
                            Prescription Creation
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/medical/prescription-management" ? "active" : ""}`} to="/medical/prescription-management">
                            Prescription Management
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/medical/recommendations" ? "active" : ""}`} to="/medical/recommendations">
                            Recommendations
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/medical/resource-detail" ? "active" : ""}`} to="/medical/resource-detail">
                            Resource Detail
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/medical/symptom-tracker" ? "active" : ""}`} to="/medical/symptom-tracker">
                            Symptom Tracker
                        </Link>
                    </div>
                )}

                {/* Divider */}
                <hr className="sidebar-divider" />

                {/* POS System Features */}
                <h5
                    className="sidebar-heading"
                    onClick={() => toggleSection("posSystem")}
                >
                    POS System
                </h5>
                {collapsedSections.posSystem && (
                    <div className="dropdown-content">
                        <Link className={`nav-link ${location.pathname === "/pos" ? "active" : ""}`} to="/pos">
                            Main POS
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/pos/transactions" ? "active" : ""}`} to="/pos/transactions">
                            Transaction History
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/pos/returns" ? "active" : ""}`} to="/pos/returns">
                            Returns
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/pos/reconciliation" ? "active" : ""}`} to="/pos/reconciliation">
                            Reconciliation
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/pos/customers" ? "active" : ""}`} to="/pos/customers">
                            Customer Management
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/pos/receipt-management" ? "active" : ""}`} to="/pos/receipt-management">
                            Receipt Management
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/pos/settings" ? "active" : ""}`} to="/pos/settings">
                            POS Settings
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/pos/offline-transactions" ? "active" : ""}`} to="/pos/offline-transactions">
                            Offline Transactions
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/pos/reports" ? "active" : ""}`} to="/pos/reports">
                            Reports
                        </Link>
                    </div>
                )}

                {/* Divider */}
                <hr className="sidebar-divider" />

                {/* GrowFarms Features */}
                <h5
                    className="sidebar-heading"
                    onClick={() => toggleSection("growFarms")}
                >
                    GrowFarms
                </h5>
                {collapsedSections.growFarms && (
                    <div className="dropdown-content">
                        <Link className={`nav-link ${location.pathname === "/growfarms/add-grow-task" ? "active" : ""}`} to="/growfarms/add-grow-task">
                            Add Grow Task
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/growfarms/add-plant-batch" ? "active" : ""}`} to="/growfarms/add-plant-batch">
                            Add Plant Batch
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/growfarms/alert-threshold" ? "active" : ""}`} to="/growfarms/alert-threshold">
                            Alert Threshold
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/growfarms/batch" ? "active" : ""}`} to="/growfarms/batch">
                            Batch
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/growfarms/dashboard" ? "active" : ""}`} to="/growfarms/dashboard">
                            Dashboard
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/growfarms/task-list" ? "active" : ""}`} to="/growfarms/task-list">
                            Task List
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/growfarms/plant-batch-details" ? "active" : ""}`} to="/growfarms/plant-batch-details">
                            Plant Batch Details
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/growfarms/plant-batch-list" ? "active" : ""}`} to="/growfarms/plant-batch-list">
                            Plant Batch List
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/growfarms/grow-reports" ? "active" : ""}`} to="/growfarms/grow-reports">
                            Grow Reports
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/growfarms/settings" ? "active" : ""}`} to="/growfarms/settings">
                            Settings
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/growfarms/yield-prediction" ? "active" : ""}`} to="/growfarms/yield-prediction">
                            Yield Prediction
                        </Link>
                    </div>
                )}

                {/* Divider */}
                <hr className="sidebar-divider" />

                {/* SeedBanks Features */}
                <h5
                    className="sidebar-heading"
                    onClick={() => toggleSection("seedBanks")}
                >
                    SeedBanks
                </h5>
                {collapsedSections.seedBanks && (
                    <div className="dropdown-content">
                        <Link className={`nav-link ${location.pathname === "/seedbanks/add-seed-batch" ? "active" : ""}`} to="/seedbanks/add-seed-batch">
                            Add Seed Batch
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/seedbanks/dashboard" ? "active" : ""}`} to="/seedbanks/dashboard">
                            Dashboard
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/seedbanks/settings" ? "active" : ""}`} to="/seedbanks/settings">
                            Settings
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/seedbanks/batch-details" ? "active" : ""}`} to="/seedbanks/batch-details">
                            Batch Details
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/seedbanks/batch-list" ? "active" : ""}`} to="/seedbanks/batch-list">
                            Batch List
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/seedbanks/inventory" ? "active" : ""}`} to="/seedbanks/inventory">
                            Inventory
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/seedbanks/reports" ? "active" : ""}`} to="/seedbanks/reports">
                            Reports
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/seedbanks/storage-conditions" ? "active" : ""}`} to="/seedbanks/storage-conditions">
                            Storage Conditions
                        </Link>
                    </div>
                )}

            

                {/* Divider */}
                <hr className="sidebar-divider" />

                {/* User Management & Utilities */}
                <h5
                    className="sidebar-heading"
                    onClick={() => toggleSection("utilities")}
                >
                    User Management & Utilities
                </h5>
                {collapsedSections.utilities && (
                    <div className="dropdown-content">
                        <Link className={`nav-link ${location.pathname === "/accounts" ? "active" : ""}`} to="/accounts">
                            Account
                        </Link>
                        <Link className={`nav-link ${location.pathname === "/contact-us" ? "active" : ""}`} to="/contact-us">
                            Contact Us
                        </Link>
                    </div>
                )}
            </nav>
        </div>
    );
};

export default Sidebar;
