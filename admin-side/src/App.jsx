import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
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
        {shouldShowHeader && <Header />}
        <Routes>
          {/* Public Routes */}
          <Route path="/:slug" element={<Home />} />
          <Route path="/:slug/about" element={<About />} />
          <Route path="/:slug/services" element={<Services />} />
          <Route path="/prices" element={<Prices />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customer" element={<Customer />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/userTable" element={<UserTable />} />
          <Route path="/Custb" element={<Custb />} />
          <Route path="/manage-price" element={<ManagePrice />} />
          <Route path="/manage-services" element={<ManageServices />} />
          <Route path="/manage-about" element={<ManageAbout />} />
          <Route path="/payment" element={<PaymentMethod />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      {/* <Toaster position="top-right" /> */}
      <SonnerToaster position="top-right" richColors />
      <AppContent />
    </Router>
  );
}

export default App;
