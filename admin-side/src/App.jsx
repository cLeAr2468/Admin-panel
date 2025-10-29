import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/layout/header';
import Home from './components/layout/home';
import About from './components/layout/about';
import Services from './components/layout/services';
import Prices from './components/layout/prices';
import Register from './components/layout/register';
import Login from './components/layout/Login';
import Dashboard from './components/layout/Dashboard';
import Customer from './components/layout/Customer';
import Inventory from './components/layout/Inventory';
import Reports from './components/layout/Reports';
import UserTable from './components/layout/userTable';
import Custb from './components/layout/Custb';
import ResetPassword from './components/layout/resetPass';
function AppContent() {
  const location = useLocation();

  // Routes that should not display the header
  const hideHeaderRoutes = [
    '/register',
    '/login',
    '/dashboard',
    '/customer',
    '/inventory',
    '/reports',
    '/userTable',
    '/Custb',
    '/resetPass',
  ];

  // Check if current path should hide header
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/laundry-logo.jpg')" }}>
      <div className='bg-[#A4DCF4] bg-opacity-80 min-h-screen'>
        {!shouldHideHeader && <Header />}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/prices" element={<Prices />} />
          <Route path="/login" element={<Login />} />
          <Route path="/resetPass" element={<ResetPassword />} />
          
          {/* Protected Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customer" element={<Customer />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/userTable" element={<UserTable />} />
          <Route path="/Custb" element={<Custb />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <AppContent />
    </Router>
  );
}

export default App;