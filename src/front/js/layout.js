import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import Products from "./pages/products";
import ProductDetail from "./pages/productDetail";
import AddProduct from "./pages/addProduct";
import EditProduct from "./pages/editProduct";
import Customers from "./pages/customers";
import CustomerDetail from "./pages/customerDetail";
import AddCustomer from "./pages/addCustomer";
import Orders from "./pages/orders";
import OrderDetail from "./pages/orderDetail";
import AddOrder from "./pages/addOrder";
import Invoices from "./pages/invoices";
import InvoiceDetail from "./pages/invoiceDetail";
import AddInvoice from "./pages/addInvoice";
import ComplianceReports from "./pages/complianceReports";
import ComplianceDetail from "./pages/complianceDetail";
import Users from "./pages/users";
import UserDetail from "./pages/userDetail";
import AddUser from "./pages/addUser";
import ImportInventory from "./pages/importInventory";
import SalesAnalytics from "./pages/salesAnalytics";
import InventoryAnalytics from "./pages/inventoryAnalytics";
import UserSettings from "./pages/UserSettings";
import Notifications from "./pages/Notifications";
import AdminDashboard from "./pages/AdminDashboard";
import ManageRoles from "./pages/ManageRoles";
import ProductSearch from "./pages/ProductSearch";
import Pricing from "./pages/Pricing";

const Layout = () => {
  return (
    <Router>
      <Routes>
        {/* Home and Dashboard */}
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Products */}
        <Route path="/products" element={<Products />} />
        <Route path="/products/add" element={<AddProduct />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/products/:id/edit" element={<EditProduct />} />
        <Route path="/products/search" element={<ProductSearch />} />

        {/* Customers */}
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/add" element={<AddCustomer />} />
        <Route path="/customers/:id" element={<CustomerDetail />} />

        {/* Orders */}
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/add" element={<AddOrder />} />
        <Route path="/orders/:id" element={<OrderDetail />} />

        {/* Invoices */}
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/invoices/add" element={<AddInvoice />} />
        <Route path="/invoices/:id" element={<InvoiceDetail />} />

        {/* Compliance */}
        <Route path="/compliance" element={<ComplianceReports />} />
        <Route path="/compliance/:id" element={<ComplianceDetail />} />

        {/* Users */}
        <Route path="/users" element={<Users />} />
        <Route path="/users/add" element={<AddUser />} />
        <Route path="/users/:id" element={<UserDetail />} />

        {/* Inventory */}
        <Route path="/inventory/import" element={<ImportInventory />} />

        {/* Analytics */}
        <Route path="/analytics/sales" element={<SalesAnalytics />} />
        <Route path="/analytics/inventory" element={<InventoryAnalytics />} />

        {/* User Settings and Notifications */}
        <Route path="/user/settings" element={<UserSettings />} />
        <Route path="/notifications" element={<Notifications />} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/manage-roles" element={<ManageRoles />} />

        {/* Pricing */}
        <Route path="/pricing" element={<Pricing />} />
      </Routes>
    </Router>
  );
};

export default Layout;
