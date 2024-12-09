import React from "react";
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { BackendURL } from "./component/backendURL";
import injectContext from "./store/appContext";
import Home from "./pages/Home";

import AboutUs from "./pages/AboutUs";
import Shop from "./pages/Shop";
import Deals from "./pages/Deals";
import ContactUs from "./pages/ContactUs";

import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Invoices from "./pages/Invoices";
import Dashboard from "./pages/Dashboard";
import Stores from "./pages/Stores";
import Suppliers from "./pages/Suppliers";
import Orders from "./pages/Orders";
import CartManagement from "./pages/CartManagement";
import Users from "./pages/Users";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import BarcodeScanner from "./pages/BarcodeScanner";

import Navbar from "./component/Navbar";
import Sidebar from "./component/Sidebar";
import { Footer } from "./component/footer";
import RegisterForm from "./pages/Register";


// Base Layout Component
const Layout = () => {
    const basename = process.env.BASENAME || "";

    if (!process.env.BACKEND_URL || process.env.BACKEND_URL === "") return <BackendURL />;

    return (
        <div>
            <BrowserRouter basename={basename}>
                <ScrollToTop>
                    <Navbar />
                    <Sidebar />
                    <Routes>

                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/about-us" element={<AboutUs />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/deals" element={<Deals />} />
                        <Route path="/contact-us" element={<ContactUs />} />
                        <Route path="/register" element={<RegisterForm />} />


                        {/* Protected Routes (Wrapped in MainLayout) */}

                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/invoices" element={<Invoices />} />
                        <Route path="/stores" element={<Stores />} />
                        <Route path="/suppliers" element={<Suppliers />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/cart-management" element={<CartManagement />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/barcode-scanner" element={<BarcodeScanner />} />


                        {/* Fallback Route  */}
                        <Route path="*" element={<h1>Not found!</h1>} />

                    </Routes>
                </ScrollToTop>
            </BrowserRouter>
        </div>
    );
};

export default injectContext(Layout);
