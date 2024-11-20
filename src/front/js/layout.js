import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { BackendURL } from "./component/backendURL";
import injectContext from "./store/appContext";
import Home  from "./pages/home";

import  Products  from "./pages/products";
import  Inventory  from "./pages/inventory";
import  Invoices  from "./pages/invoices";
import Dashboard  from "./pages/dashboard";

import{Context} from "./store/appContext";

import  Navbar  from "./component/navbar";
import { Footer } from "./component/footer";
import RegisterForm from "./pages/register";

//create your first component
const Layout = () => {
    //the basename is used when your project is published in a subdirectory and not in the root of the domain
    // you can set the basename on the .env file located at the root of this project, E.g: BASENAME=/react-hello-webapp/
    const basename = process.env.BASENAME || "";

    if(!process.env.BACKEND_URL || process.env.BACKEND_URL == "") return <BackendURL/ >;

    return (
        <div>
            <BrowserRouter basename={basename}>
                <ScrollToTop>
                    <Navbar />
                    <Routes>
                        <Route element={<Home />} path="/" />
                        <Route element={<RegisterForm />} path="/register" />
                        <Route element={<Products />} path="/products" />
                        <Route element={<Inventory />} path="/inventory" />
                        <Route element={<Invoices />} path="/invoices" />
                        <Route element={<Dashboard />} path="/dashboard" />
                        <Route element={<h1>Not found!</h1>} />
                    </Routes>
                    <Footer />
                </ScrollToTop>
            </BrowserRouter>
        </div>
    );
};

export default injectContext(Layout);