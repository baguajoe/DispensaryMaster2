import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import injectContext from "./store/appContext"; // Context for global state

// Non-Medical Pages
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import Shop from "./pages/Shop";
import Deals from "./pages/Deals";
import ContactUs from "./pages/ContactUs";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { ForgotPassword } from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import InventoryPage from "./pages/InventoryPage";
import Invoices from "./pages/Invoices";
import Stores from "./pages/Stores";
import AddStore from "./pages/AddStore";
import Suppliers from "./pages/Suppliers";
import Orders from "./pages/Orders";
import CartManagement from "./pages/CartManagement";
import Users from "./pages/Users";
import AnalyticsDashboard from "./pages/AnalyticsDashboard"; // Assuming the file is in the 'pages' folder
import Reports from "./pages/ReportsPage";
import Leads from "./pages/Leads";
import CheckoutPage from "./pages/CheckoutPage";
import BarcodeScanner from "./pages/BarcodeScanner";
import Campaign from "./pages/Campaign";
import Task from "./pages/Task";
import SalesPipeline from "./pages/SalesPipeline";
import PriceComparison from "./pages/PriceComparison";
import PersonalizedRecommendations from "./pages/PersonalizedRecommendations";
import ChatPage from './pages/ChatPage';

// import MainPOS from "./pages/POS/MainPOS";
import POS from "./pages/POS/POS";
import TransactionHistory from "./pages/POS/TransactionHistory";
import Returns from "./pages/POS/Returns";
import Reconciliation from "./pages/POS/Reconciliation";
import CustomerManagement from "./pages/POS/CustomerManagement";
import ReceiptManagement from "./pages/POS/ReceiptManagement";
import POSSettings from "./pages/POS/POSSettings";
import OfflineTransactions from "./pages/POS/OfflineTransactions";
import POSReports from "./pages/POS/Reports";


// Medical Pages
import ComplianceDashboard from "./pages/Medical/ComplianceDashboard";
import ComplianceReports from "./pages/Medical/ComplianceReports";
import MedicalAnalytics from "./pages/Medical/MedicalAnalytics";
import PatientDashboard from "./pages/Medical/PatientDashboard";
import PatientList from "./pages/Medical/PatientList";
import PatientProfile from "./pages/Medical/PatientProfile";
import PatientRegistration from "./pages/Medical/PatientRegistration";
import PrescriptionCreation from "./pages/Medical/PrescriptionCreation";
import PrescriptionManagement from "./pages/Medical/PrescriptionManagement";
import MedicalRecommendations from "./pages/Medical/Recommendations";
import ResourceDetailPage from "./pages/Medical/ResourceDetailPage";
import SymptomTracker from "./pages/Medical/SymptomTracker";

// GrowFarms Pages
import AddGrowTask from "./pages/GrowFarms/AddGrowTask";
import AddPlantBatch from "./pages/GrowFarms/AddPlantBatch";
import AlertThresholdPage from "./pages/GrowFarms/AlertThresholdPage";
import BatchPage from "./pages/GrowFarms/BatchPage";
import GrowFarmDashboard from "./pages/GrowFarms/GrowFarmDashboard";
import GrowTaskList from "./pages/GrowFarms/GrowTaskList";
import PlantBatchDetails from "./pages/GrowFarms/PlantBatchDetails";
import PlantBatchList from "./pages/GrowFarms/PlantBatchList";
import GrowReports from "./pages/GrowFarms/GrowReports";
import GrowFarmSettings from "./pages/GrowFarms/Settings";
import YieldPrediction from "./pages/GrowFarms/YieldPrediction";

// SeedBanks Pages
import AddSeedBatch from "./pages/SeedBanks/AddSeedBatch";
import SeedBankDashboard from "./pages/SeedBanks/SeedBankDashboard";
import SeedBankSettings from "./pages/SeedBanks/SeedBankSettings";
import SeedBatchDetails from "./pages/SeedBanks/SeedBatchDetails";
import SeedBatchList from "./pages/SeedBanks/SeedBatchList";
import SeedInventory from "./pages/SeedBanks/SeedInventory";
import SeedReports from "./pages/SeedBanks/SeedReports";
import StorageConditions from "./pages/SeedBanks/StorageConditions";

// Import your customer dashboard components
import DashboardOverview from "./pages/CustomerDashboard/DashboardOverview";
import CustomerProfile from "./pages/CustomerDashboard/CustomerProfile";
import OrderHistory from "./pages/CustomerDashboard/OrderHistory";
import OrderDetails from "./pages/CustomerDashboard/OrderDetails";
import Wishlist from "./pages/CustomerDashboard/Wishlist";
import Cart from "./pages/CustomerDashboard/Cart";
import PaymentMethods from "./pages/CustomerDashboard/PaymentMethods";
import Support from "./pages/CustomerDashboard/Support";
import LoyaltyProgram from "./pages/CustomerDashboard/LoyaltyProgram";
import CustomerRecommendations from "./pages/CustomerDashboard/Recommendations";
import Notifications from "./pages/CustomerDashboard/Notifications";
import Subscriptions from "./pages/CustomerDashboard/Subscriptions";
import CustomerAnalytics from "./pages/CustomerDashboard/CustomerAnalytics";
import Addresses from "./pages/CustomerDashboard/Addresses";
import CustomerSettings from "./pages/CustomerDashboard/Settings";

import Navbar from "./component/Navbar";
import Sidebar from "./component/Sidebar";
import { Footer } from "./component/footer";
// import { Settings, Accounts, Profile, Messaging, Help } from "./pages/NewPages";



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
                            {/* Non-Medical Routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/about-us" element={<AboutUs />} />
                            <Route path="/shop" element={<Shop />} />
                            <Route path="/deals" element={<Deals />} />
                            <Route path="/contact-us" element={<ContactUs />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/employee-dashboard" element={<EmployeeDashboard employeeId={1} />} />
                            <Route path="/products" element={<Products />} />
                            <Route path="/price-comparison" element={<PriceComparison />} />
                            <Route path="/personalized-recommendations" element={<PersonalizedRecommendations customerId={1} />} />
                            <Route path="/inventory" element={<Inventory />} />
                            <Route path="/inventory" element={<InventoryPage />} />;
                            <Route path="/invoices" element={<Invoices />} />
                            <Route path="/stores" element={<Stores />} />
                            <Route path="/stores/add" element={<AddStore />} />
                            <Route path="/suppliers" element={<Suppliers />} />
                            <Route path="/orders" element={<Orders />} />
                            <Route path="/pos" element={<POS />} />
                            <Route path="/cart-management" element={<CartManagement />} />
                            <Route path="/checkout" element={<CheckoutPage />} />
                            <Route path="/users" element={<Users />} />
                            <Route path="/analytics-dashboard" element={<AnalyticsDashboard />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/barcode-scanner" element={<BarcodeScanner />} />
                            <Route path="/campaign" element={<Campaign />} />
                            <Route path="/task" element={<Task />} />
                            <Route path="/sales-pipeline" element={<SalesPipeline />} />
                            <Route path="/chat" element={<ChatPage />} />

                            {/* POS Routes */}
                            <Route path="/pos" element={<POS />} /> Main POS Page
                            <Route path="/pos/transactions" element={<TransactionHistory />} />
                            <Route path="/pos/returns" element={<Returns />} />
                            <Route path="/pos/reconciliation" element={<Reconciliation />} />
                            <Route path="/pos/customers" element={<CustomerManagement />} />
                            <Route path="/pos/receipt-management" element={<ReceiptManagement />} />
                            <Route path="/pos/settings" element={<POSSettings />} />
                            <Route path="/pos/offline-transactions" element={<OfflineTransactions />} />
                            <Route path="/pos/reports" element={<POSReports />} />

                            {/* customer dashboard */}

                            <Route path="/dashboard-overview" element={<DashboardOverview />} />
                            <Route path="/profile" element={<CustomerProfile />} />
                            <Route path="/order-history" element={<OrderHistory />} />
                            <Route path="/order-details/:orderId" element={<OrderDetails />} />
                            <Route path="/wishlist" element={<Wishlist />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/payment-methods" element={<PaymentMethods />} />
                            <Route path="/support" element={<Support />} />
                            <Route path="/loyalty-program" element={<LoyaltyProgram />} />
                            <Route path="/recommendations" element={<CustomerRecommendations />} />
                            <Route path="/notifications" element={<Notifications />} />
                            <Route path="/subscriptions" element={<Subscriptions />} />
                            <Route path="/customer-analytics" element={<CustomerAnalytics />} />
                            <Route path="/addresses" element={<Addresses />} />
                            <Route path="/settings" element={<CustomerSettings />} />
      


                            {/* Medical Routes */}
                            <Route path="/medical/compliance-dashboard" element={<ComplianceDashboard />} />
                            <Route path="/medical/compliance-reports" element={<ComplianceReports />} />
                            <Route path="/medical/medical-analytics" element={<MedicalAnalytics />} />
                            <Route path="/medical/patient-dashboard" element={<PatientDashboard />} />
                            <Route path="/medical/patient-list" element={<PatientList />} />
                            <Route path="/medical/patient-profile" element={<PatientProfile />} />
                            <Route path="/medical/patient-registration" element={<PatientRegistration />} />
                            <Route path="/medical/prescription-creation" element={<PrescriptionCreation />} />
                            <Route path="/medical/prescription-management" element={<PrescriptionManagement />} />
                            <Route path="/medical/recommendations" element={<MedicalRecommendations />} />
                            <Route path="/medical/resource-detail" element={<ResourceDetailPage />} />
                            <Route path="/medical/symptom-tracker" element={<SymptomTracker />} />

                            {/* GrowFarms Routes */}
                            <Route path="/growfarms/add-grow-task" element={<AddGrowTask />} />
                            <Route path="/growfarms/add-plant-batch" element={<AddPlantBatch />} />
                            <Route path="/growfarms/alert-threshold" element={<AlertThresholdPage />} />
                            <Route path="/growfarms/batch" element={<BatchPage />} />
                            <Route path="/growfarms/dashboard" element={<GrowFarmDashboard />} />
                            <Route path="/growfarms/task-list" element={<GrowTaskList />} />
                            <Route path="/growfarms/plant-batch-details" element={<PlantBatchDetails />} />
                            <Route path="/growfarms/plant-batch-list" element={<PlantBatchList />} />
                            <Route path="/growfarms/grow-reports" element={<GrowReports />} />
                            <Route path="/growfarms/settings" element={<GrowFarmSettings />} />
                            <Route path="/growfarms/yield-prediction" element={<YieldPrediction />} />

                            {/* SeedBanks Routes */}
                            <Route path="/seedbanks/add-seed-batch" element={<AddSeedBatch />} />
                            <Route path="/seedbanks/dashboard" element={<SeedBankDashboard />} />
                            <Route path="/seedbanks/settings" element={<SeedBankSettings />} />
                            <Route path="/seedbanks/batch-details" element={<SeedBatchDetails />} />
                            <Route path="/seedbanks/batch-list" element={<SeedBatchList />} />
                            <Route path="/seedbanks/inventory" element={<SeedInventory />} />
                            <Route path="/seedbanks/reports" element={<SeedReports />} />
                            <Route path="/seedbanks/storage-conditions" element={<StorageConditions />} />

                            {/* // Add these routes
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/accounts" element={<Accounts />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/messaging" element={<Messaging />} />
                            <Route path="/help" element={<Help />} /> */}

                            {/* Fallback Route */}
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
