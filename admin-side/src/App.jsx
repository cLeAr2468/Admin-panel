import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { Toaster as SonnerToaster } from "sonner";
import Header from "./components/layout/header";
import Home from "./components/layout/home";
import About from "./components/layout/about";
import Services from "./components/layout/services";
import Prices from "./components/layout/prices";
import Register from "./components/layout/register";
import Login from "./components/layout/Login";
import Dashboard from "./components/layout/Dashboard";
import Customer from "./components/layout/Customer";
import Inventory from "./components/layout/Inventory";
import Reports from "./components/layout/Reports";
import UserTable from "./components/layout/userTable";
import Custb from "./components/layout/Custb";
import ManagePrice from "./components/layout/ManagePrice";
import ManageServices from "./components/layout/ManageServices";
import ManageAbout from "./components/layout/ManageAbout";
import PaymentMethod from "./components/layout/PaymentMethod";
import ResetPassword from "./components/layout/ResetPassword";
import PublicLayout from "./components/layout/PublicLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";

function AppContent() {
  const location = useLocation();

  // Routes that should not display the header
  const hideHeaderRoutes = [
    "/register",
    "/login",
    "/dashboard",
    "/customer",
    "/inventory",
    "/reports",
    "/userTable",
    "/Custb",
    "/manage-price",
    "/manage-services",
    "/manage-about",
    "/payment",
    "/reset-password",
  ];

  const shouldShowHeader = !hideHeaderRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/laundry-logo.jpg')" }}
    >
      <div className="bg-[#A4DCF4] bg-opacity-80 min-h-screen">
        {/* {shouldShowHeader && <Header />} */}
        <Routes>
          {/* Public Pages with Header */}
          <Route element={<PublicLayout />}>
            <Route path="/:slug?" element={<Home />} />
            <Route path="/:slug?/about" element={<About />} />
            <Route path="/:slug?/services" element={<Services />} />
            <Route path="/:slug?/prices" element={<Prices />} />
            <Route path="/:slug?/login" element={<Login />} />
            <Route path="/:slug?/reset-password" element={<ResetPassword />} />

          </Route>

          {/* Protected Routes */}
          <Route path="/:slug?/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/:slug?/register" element={<ProtectedRoute><Register /></ProtectedRoute>} />
          <Route path="/:slug?/customer" element={<ProtectedRoute><Customer /></ProtectedRoute>} />
          <Route path="/:slug?/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
          <Route path="/:slug?/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/:slug?/userTable" element={<ProtectedRoute><UserTable /></ProtectedRoute>} />
          <Route path="/:slug?/Custb" element={<ProtectedRoute><Custb /></ProtectedRoute>} />
          <Route path="/:slug?/manage-price" element={<ProtectedRoute><ManagePrice /></ProtectedRoute>} />
          <Route path="/:slug?/manage-services" element={<ProtectedRoute><ManageServices /></ProtectedRoute>} />
          <Route path="/:slug?/manage-about" element={<ProtectedRoute><ManageAbout /></ProtectedRoute>} />
          <Route path="/:slug?/payment" element={<ProtectedRoute><PaymentMethod /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      {/* <Toaster position="top-right" /> */}
      <Toaster position="top-right" richColors />
      <AppContent />
    </Router>
  );
}

export default App;
