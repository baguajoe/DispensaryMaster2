import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import injectContext from "./store/appContext";
import Navbar from "./component/Navbar";
import Sidebar from "./component/Sidebar";
import { Footer } from "./component/footer";
import ScrollToTop from "./component/scrollToTop";
import AgeVerification from "./pages/AgeVerification";

// Core Pages
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import Shop from "./pages/Shop";
import Deals from "./pages/Deals";
import ContactUs from "./pages/ContactUs";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { ForgotPassword } from "./pages/ForgotPassword";

// Non-Medical
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import PriceComparison from "./pages/PriceComparison";
import Inventory from "./pages/Inventory";
import Invoices from "./pages/Invoices";
import Orders from "./pages/Orders";
import Stores from "./pages/Stores";
import Suppliers from "./pages/Suppliers";
import Users from "./pages/Users";
import BarcodeScanner from "./pages/BarcodeScanner";
import CartManagement from "./pages/CartManagement";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import Reports from "./pages/ReportsPage";
import SalesReport from "./pages/SalesReport";
import Campaign from "./pages/Campaign";
import Customers from "./pages/Customers";

// Job Board
import JobBoard from "./pages/JobBoard";
import GramLimitChecker from "./pages/GramLimitChecker";
import MultiLocationDashboard from "./pages/MultiLocationDashboard";
import ProductReviews from "./pages/ProductReviews";
import WaitlistQueue from "./pages/WaitlistQueue";
import KioskMode from "./pages/KioskMode";
import MetrcIntegration from "./pages/MetrcIntegration";
import SMSDashboard from "./pages/SMSDashboard";
import DeliveryTracking from "./pages/DeliveryTracking";
import StripeCheckout from "./pages/StripeCheckout";
import ResumeBuilder from "./pages/ResumeBuilder";
import ResumeSearch from "./pages/ResumeSearch";
import Onboarding from "./pages/Onboarding";
import PerformanceReviews from "./pages/PerformanceReviews";
import JobPost from "./pages/JobPost";
import Companies from "./pages/Companies";
import JobApplications from "./pages/JobApplications";
import TrainingHome from "./pages/Training/TrainingHome";
import CreateTraining from "./pages/Training/CreateTraining";

// POS
import POS from "./pages/POS/POS";
import TransactionHistory from "./pages/POS/TransactionHistory";
import Returns from "./pages/POS/Returns";
import ReceiptManagement from "./pages/POS/ReceiptManagement";
import POSReports from "./pages/POS/Reports";
import Reconciliation from "./pages/POS/Reconciliation";
import POSSettings from "./pages/POS/POSSettings";
import POSCustomers from "./pages/POS/CustomerManagement";
import OfflineTransactions from "./pages/POS/OfflineTransactions";

// Medical
import ComplianceDashboard from "./pages/Medical/ComplianceDashboard";
import ComplianceReports from "./pages/Medical/ComplianceReports";
import AppointmentManagement from "./pages/Medical/AppointmentManagement";
import MedicalAnalytics from "./pages/Medical/MedicalAnalytics";
import PatientList from "./pages/Medical/PatientList";
import PatientRegistration from "./pages/Medical/PatientRegistration";
import PrescriptionManagement from "./pages/Medical/PrescriptionManagement";
import PatientProfile from "./pages/Medical/PatientProfile";
import MedicalDashboard from "./pages/Medical/MedicalDashboard";
import BillingInsurance from "./pages/Medical/BillingInsurance";

// GrowFarms
import AddPlantBatch from "./pages/GrowFarms/AddPlantBatch";
import AddGrowTask from "./pages/GrowFarms/AddGrowTask";
import GrowTaskList from "./pages/GrowFarms/GrowTaskList";
import PlantBatchList from "./pages/GrowFarms/PlantBatchList";
import YieldPrediction from "./pages/GrowFarms/YieldPrediction";
import GrowFarmDashboard from "./pages/GrowFarms/GrowFarmDashboard";
import StorageConditions from "./pages/SeedBanks/StorageConditions";
import GrowReports from "./pages/GrowFarms/GrowReports";
import PestDiseaseTracker from "./pages/GrowFarms/PestDiseaseTracker";
import HarvestLog from "./pages/GrowFarms/HarvestLog";

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
import Recommendations from "./pages/CustomerDashboard/Recommendations";
import Support from "./pages/CustomerDashboard/Support";
import Notifications from "./pages/CustomerDashboard/Notifications";

const RequireAuth = ({ children }) => {
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/login" />;
};

const RequireAgeVerification = ({ children }) => {
    const ageVerified = localStorage.getItem("ageVerified") === "true";
    return ageVerified ? children : <Navigate to="/" />;
};

const Layout = () => {
    const basename = process.env.BASENAME || "";
    const token = localStorage.getItem("token");

    return (
        <BrowserRouter basename={basename}>
            <ScrollToTop>
                <Navbar />
                <div className="d-flex">
                    {token && <Sidebar />}
                    <div className="flex-grow-1 p-3">
                        <Routes>
                            {/* Public */}
                            <Route path="/" element={<AgeVerification />} />
                            <Route path="/home" element={<RequireAgeVerification><Home /></RequireAgeVerification>} />
                            <Route path="/about-us" element={<AboutUs />} />
                            <Route path="/shop" element={<Shop />} />
                            <Route path="/deals" element={<Deals />} />
                            <Route path="/contact-us" element={<ContactUs />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />

                            {/* Non-Medical */}
                            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
                            <Route path="/products" element={<RequireAuth><Products /></RequireAuth>} />
                            <Route path="/price-comparison" element={<RequireAuth><PriceComparison /></RequireAuth>} />
                            <Route path="/inventory" element={<RequireAuth><Inventory /></RequireAuth>} />
                            <Route path="/invoices" element={<RequireAuth><Invoices /></RequireAuth>} />
                            <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />
                            <Route path="/stores" element={<RequireAuth><Stores /></RequireAuth>} />
                            <Route path="/suppliers" element={<RequireAuth><Suppliers /></RequireAuth>} />
                            <Route path="/users" element={<RequireAuth><Users /></RequireAuth>} />
                            <Route path="/barcode-scanner" element={<RequireAuth><BarcodeScanner /></RequireAuth>} />
                            <Route path="/cart-management" element={<RequireAuth><CartManagement /></RequireAuth>} />
                            <Route path="/analytics-dashboard" element={<RequireAuth><AnalyticsDashboard /></RequireAuth>} />
                            <Route path="/reports" element={<RequireAuth><Reports /></RequireAuth>} />
                            <Route path="/sales-reports" element={<RequireAuth><SalesReport /></RequireAuth>} />
                            <Route path="/campaigns" element={<RequireAuth><Campaign /></RequireAuth>} />
                            <Route path="/customers" element={<RequireAuth><Customers /></RequireAuth>} />

                            {/* Job Board */}
                            <Route path="/jobs" element={<JobBoard />} />
                            <Route path="/jobs/post" element={<RequireAuth><JobPost /></RequireAuth>} />
                            <Route path="/companies" element={<Companies />} />
                            <Route path="/jobs/applications" element={<RequireAuth><JobApplications /></RequireAuth>} />
                            <Route path="/training" element={<RequireAuth><TrainingHome /></RequireAuth>} />
                            <Route path="/training/create" element={<RequireAuth><CreateTraining /></RequireAuth>} />

                            {/* POS */}
                            <Route path="/pos" element={<RequireAuth><POS /></RequireAuth>} />
                            <Route path="/pos/transactions" element={<RequireAuth><TransactionHistory /></RequireAuth>} />
                            <Route path="/pos/returns" element={<RequireAuth><Returns /></RequireAuth>} />
                            <Route path="/pos/receipt-management" element={<RequireAuth><ReceiptManagement /></RequireAuth>} />
                            <Route path="/pos/reports" element={<RequireAuth><POSReports /></RequireAuth>} />
                            <Route path="/pos/reconciliation" element={<RequireAuth><Reconciliation /></RequireAuth>} />
                            <Route path="/pos/settings" element={<RequireAuth><POSSettings /></RequireAuth>} />
                            <Route path="/pos/customers" element={<RequireAuth><POSCustomers /></RequireAuth>} />
                            <Route path="/pos/offline" element={<RequireAuth><OfflineTransactions /></RequireAuth>} />

                            {/* Medical */}
                            <Route path="/medical/compliance-dashboard" element={<RequireAuth><ComplianceDashboard /></RequireAuth>} />
                            <Route path="/medical/compliance-reports" element={<RequireAuth><ComplianceReports /></RequireAuth>} />
                            <Route path="/medical/appointment-management" element={<RequireAuth><AppointmentManagement /></RequireAuth>} />
                            <Route path="/medical/medical-analytics" element={<RequireAuth><MedicalAnalytics /></RequireAuth>} />
                            <Route path="/medical/patient-list" element={<RequireAuth><PatientList /></RequireAuth>} />
                            <Route path="/medical/patient-registration" element={<RequireAuth><PatientRegistration /></RequireAuth>} />
                            <Route path="/medical/patient-profile/:id" element={<RequireAuth><PatientProfile /></RequireAuth>} />
                            <Route path="/medical/dashboard" element={<RequireAuth><MedicalDashboard /></RequireAuth>} />
                            <Route path="/medical/billing/:id" element={<RequireAuth><BillingInsurance /></RequireAuth>} />
                            <Route path="/medical/prescription-management" element={<RequireAuth><PrescriptionManagement /></RequireAuth>} />

                            {/* GrowFarms */}
                            <Route path="/growfarms/dashboard" element={<RequireAuth><GrowFarmDashboard /></RequireAuth>} />
                            <Route path="/growfarms/add-plant-batch" element={<RequireAuth><AddPlantBatch /></RequireAuth>} />
                            <Route path="/growfarms/add-grow-task" element={<RequireAuth><AddGrowTask /></RequireAuth>} />
                            <Route path="/growfarms/task-list" element={<RequireAuth><GrowTaskList /></RequireAuth>} />
                            <Route path="/growfarms/plant-batch-list" element={<RequireAuth><PlantBatchList /></RequireAuth>} />
                            <Route path="/growfarms/harvest-log" element={<RequireAuth><HarvestLog /></RequireAuth>} />
                            <Route path="/growfarms/pest-disease" element={<RequireAuth><PestDiseaseTracker /></RequireAuth>} />
                            <Route path="/growfarms/reports" element={<RequireAuth><GrowReports /></RequireAuth>} />
                            <Route path="/seedbanks/storage-conditions" element={<RequireAuth><StorageConditions /></RequireAuth>} />
                            <Route path="/growfarms/yield-prediction" element={<RequireAuth><YieldPrediction /></RequireAuth>} />

                            {/* SeedBanks */}
                            <Route path="/seedbanks/dashboard" element={<RequireAuth><SeedBankDashboard /></RequireAuth>} />
                            <Route path="/seedbanks/add-seed-batch" element={<RequireAuth><AddSeedBatch /></RequireAuth>} />
                            <Route path="/seedbanks/batch-list" element={<RequireAuth><SeedBatchList /></RequireAuth>} />
                            <Route path="/seedbanks/inventory" element={<RequireAuth><SeedInventory /></RequireAuth>} />
                            <Route path="/seedbanks/reports" element={<RequireAuth><SeedReports /></RequireAuth>} />

                            {/* Customer Dashboard - FIXED paths */}
                            <Route path="/dashboard-overview" element={<RequireAuth><DashboardOverview /></RequireAuth>} />
                            <Route path="/customer/overview" element={<RequireAuth><DashboardOverview /></RequireAuth>} />
                            <Route path="/customer/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
                            <Route path="/customer/support" element={<RequireAuth><Support /></RequireAuth>} />
                            <Route path="/customer/recommendations" element={<RequireAuth><Recommendations /></RequireAuth>} />
                            <Route path="/customer/profile" element={<RequireAuth><CustomerProfile /></RequireAuth>} />
                            <Route path="/customer/orders" element={<RequireAuth><OrderHistory /></RequireAuth>} />
                            <Route path="/customer/wishlist" element={<RequireAuth><Wishlist /></RequireAuth>} />
                            <Route path="/customer/loyalty-program" element={<RequireAuth><LoyaltyProgram /></RequireAuth>} />
                            <Route path="/customer/analytics" element={<RequireAuth><CustomerAnalytics /></RequireAuth>} />

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
