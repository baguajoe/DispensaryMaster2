import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import Products from "./pages/products";
import ProductDetail from "./pages/productDetail";
import Customers from "./pages/customers";
import CustomerDetail from "./pages/customerDetail";
import Orders from "./pages/orders";
import OrderDetail from "./pages/orderDetail";
import Invoices from "./pages/invoices";
import InvoiceDetail from "./pages/invoiceDetail";
import SalesAnalytics from "./pages/salesAnalytics";
import InventoryAnalytics from "./pages/inventoryAnalytics";

const Layout = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/:id" element={<CustomerDetail />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/invoices/:id" element={<InvoiceDetail />} />
        <Route path="/analytics/sales" element={<SalesAnalytics />} />
        <Route path="/analytics/inventory" element={<InventoryAnalytics />} />
      </Routes>
    </Router>
  );
};

export default Layout;
