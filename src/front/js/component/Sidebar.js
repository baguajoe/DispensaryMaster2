import React from "react";
import { Link } from "react-router-dom";

export const Sidebar = () => {
    return (
        <div className="d-flex flex-column bg-light" style={{ height: "100vh", width: "250px" }}>
            <h3 className="text-center py-3">Dashboard</h3>
            <nav className="nav flex-column px-3">
                <Link className="nav-link" to="/overview">
                    Overview
                </Link>
                <Link className="nav-link" to="/summary">
                    Summary
                </Link>
                <Link className="nav-link" to="/dashboards">
                    Dashboards
                </Link>
                <Link className="nav-link" to="/stores">
                    Stores
                </Link>
                <Link className="nav-link" to="/suppliers">
                    Suppliers
                </Link>
                <Link className="nav-link" to="/products">
                    Products
                </Link>
                <Link className="nav-link" to="/category">
                    Category
                </Link>
                <Link className="nav-link" to="/orders">
                    Orders
                </Link>
                <Link className="nav-link" to="/cart-management">
                    Cart Management
                </Link>
                <Link className="nav-link" to="/inventory">
                    Inventory
                </Link>
                <Link className="nav-link" to="/users">
                    Users
                </Link>
                <Link className="nav-link" to="/analytics">
                    Analytics
                </Link>
                <Link className="nav-link" to="/reports">
                    Reports
                </Link>
                <Link className="nav-link" to="/barcode-scanner">
                    Barcode Scanner
                </Link>
                <Link className="nav-link text-danger mt-3" to="/logout">
                    Logout
                </Link>
            </nav>
        </div>
    );
};

export default Sidebar;
