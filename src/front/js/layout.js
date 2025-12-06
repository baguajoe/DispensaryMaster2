import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import injectContext from "./store/appContext";
import Navbar from "./component/Navbar";
import Sidebar from "./component/Sidebar";
import { Footer } from "./component/footer";
import ScrollToTop from "./component/scrollToTop";
import AgeVerification from "./pages/AgeVerification";

// Pages
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import Shop from "./pages/Shop";
import Deals from "./pages/Deals";
import ContactUs from "./pages/ContactUs";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { ForgotPassword } from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import PriceComparison from "./pages/PriceComparison";
import Inventory from "./pages/Inventory";
import Invoices from "./pages/Invoices";
import Orders from "./pages/Orders";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import Reports from "./pages/ReportsPage";
import SalesReport from "./pages/SalesReport";

// POS
import POS from "./pages/POS/POS";
import TransactionHistory from "./pages/POS/TransactionHistory";
import Returns from "./pages/POS/Returns";
import ReceiptManagement from "./pages/POS/ReceiptManagement";
import POSReports from "./pages/POS/Reports";

// Medical
import ComplianceDashboard from "./pages/Medical/ComplianceDashboard";
import ComplianceReports from "./pages/Medical/ComplianceReports";
import AppointmentManagement from "./pages/Medical/AppointmentManagement";
import MedicalAnalytics from "./pages/Medical/MedicalAnalytics";
import PatientList from "./pages/Medical/PatientList";
import PatientRegistration from "./pages/Medical/PatientRegistration";
import PrescriptionManagement from "./pages/Medical/PrescriptionManagement";

// GrowFarms
import AddPlantBatch from "./pages/GrowFarms/AddPlantBatch";
import AddGrowTask from "./pages/GrowFarms/AddGrowTask";
import GrowTaskList from "./pages/GrowFarms/GrowTaskList";
import PlantBatchList from "./pages/GrowFarms/PlantBatchList";
import YieldPrediction from "./pages/GrowFarms/YieldPrediction";
import GrowFarmDashboard from "./pages/GrowFarms/GrowFarmDashboard";

// SeedBanks
import AddSeedBatch from "./pages/SeedBanks/AddSeedBatch";
import SeedBatchList from "./pages/SeedBanks/SeedBatchList";
import SeedInventory from "./pages/SeedBanks/SeedInventory";
import SeedReports from "./pages/SeedBanks/SeedReports";
import SeedBankDashboard from "./pages/SeedBanks/SeedBankDashboard";

// Customer Dashboard
import DashboardOverview from "./pages/CustomerDashboard/DashboardOverview";
import CustomerProfile from "./pages/CustomerDashboard/CustomerProfile";
import OrderHistory from "./pages/CustomerDashboard/OrderHistory";
import Wishlist from "./pages/CustomerDashboard/Wishlist";
import LoyaltyProgram from "./pages/CustomerDashboard/LoyaltyProgram";
import CustomerAnalytics from "./pages/CustomerDashboard/CustomerAnalytics";

const RequireAgeVerification = ({ children }) => {
    const ageVerified = localStorage.getItem("ageVerified") === "true";
    return ageVerified ? children : <Navigate to="/" />;
};

const Layout = () => {
    const basename = process.env.BASENAME || "";

    return (
        <BrowserRouter basename={basename}>
            <ScrollToTop>
                <Navbar />
                <div className="d-flex">
                    <Sidebar />
                    <div className="flex-grow-1 p-3">
                        <Routes>
                            <Route path="/" element={<AgeVerification />} />
                            <Route path="/home" element={<RequireAgeVerification><Home /></RequireAgeVerification>} />
                            <Route path="/about-us" element={<AboutUs />} />
                            <Route path="/shop" element={<Shop />} />
                            <Route path="/deals" element={<Deals />} />
                            <Route path="/contact-us" element={<ContactUs />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/products" element={<Products />} />
                            <Route path="/price-comparison" element={<PriceComparison />} />
                            <Route path="/inventory" element={<Inventory />} />
                            <Route path="/invoices" element={<Invoices />} />
                            <Route path="/orders" element={<Orders />} />
                            <Route path="/analytics-dashboard" element={<AnalyticsDashboard />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/sales-reports" element={<SalesReport />} />

                            {/* POS */}
                            <Route path="/pos" element={<POS />} />
                            <Route path="/pos/transactions" element={<TransactionHistory />} />
                            <Route path="/pos/returns" element={<Returns />} />
                            <Route path="/pos/receipt-management" element={<ReceiptManagement />} />
                            <Route path="/pos/reports" element={<POSReports />} />

                            {/* Medical */}
                            <Route path="/medical/compliance-dashboard" element={<ComplianceDashboard />} />
                            <Route path="/medical/compliance-reports" element={<ComplianceReports />} />
                            <Route path="/medical/appointment-management" element={<AppointmentManagement />} />
                            <Route path="/medical/medical-analytics" element={<MedicalAnalytics />} />
                            <Route path="/medical/patient-list" element={<PatientList />} />
                            <Route path="/medical/patient-registration" element={<PatientRegistration />} />
                            <Route path="/medical/prescription-management" element={<PrescriptionManagement />} />

                            {/* GrowFarms */}
                            <Route path="/growfarms/dashboard" element={<GrowFarmDashboard />} />
                            <Route path="/growfarms/add-plant-batch" element={<AddPlantBatch />} />
                            <Route path="/growfarms/add-grow-task" element={<AddGrowTask />} />
                            <Route path="/growfarms/task-list" element={<GrowTaskList />} />
                            <Route path="/growfarms/plant-batch-list" element={<PlantBatchList />} />
                            <Route path="/growfarms/yield-prediction" element={<YieldPrediction />} />

                            {/* SeedBanks */}
                            <Route path="/seedbanks/dashboard" element={<SeedBankDashboard />} />
                            <Route path="/seedbanks/add-seed-batch" element={<AddSeedBatch />} />
                            <Route path="/seedbanks/batch-list" element={<SeedBatchList />} />
                            <Route path="/seedbanks/inventory" element={<SeedInventory />} />
                            <Route path="/seedbanks/reports" element={<SeedReports />} />

                            {/* Customer */}
                            <Route path="/dashboard-overview" element={<DashboardOverview />} />
                            <Route path="/profile" element={<CustomerProfile />} />
                            <Route path="/order-history" element={<OrderHistory />} />
                            <Route path="/wishlist" element={<Wishlist />} />
                            <Route path="/loyalty-program" element={<LoyaltyProgram />} />
                            <Route path="/customer-analytics" element={<CustomerAnalytics />} />

                            <Route path="*" element={<h1>Page Not Found</h1>} />
                        </Routes>
                    </div>
                </div>
                <Footer />
            </ScrollToTop>
        </BrowserRouter>
    );
};

export default injectContext(Layout);
