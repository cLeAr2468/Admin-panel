import React, { useState } from 'react';
import { UserPlus, Receipt, Database, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import CustomerRegistration from './CustomerRegistration';
import CustomerReceipt from './CustomerReceipt';
import Sidebar from './Sidebar';

const Customer = () => {
  const [showRegistration, setShowRegistration] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  const handleCustomerAction = (action) => {
    console.log(`${action} clicked`);
    // Handle different customer actions
    switch (action) {
      case 'registration':
        setShowRegistration(true);
        break;
      case 'receipt':
        setShowReceipt(true);
        break;
      case 'records':
        // Handle view customer records
        alert('View Customer Records functionality coming soon!');
        break;
      case 'admin-register':
        setShowRegistration(true);
        break;
      case 'customer-register':
        setShowRegistration(true);
        break;
      default:
        break;
    }
  };

  const handleSaveCustomer = (customerData) => {
    console.log('Saving customer:', customerData);
    setShowRegistration(false);
    // Here you would typically send the data to your backend
    alert('Customer saved successfully!');
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto bg-slate-50 relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #126280 2px, transparent 2px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Top Date Display */}
        <div className="relative z-10 flex justify-end mb-8">
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-3">
              <div className="text-lg font-semibold text-slate-700">
                Date: April 4, 2025
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="relative z-10 flex justify-center items-center min-h-[60vh]">
          <div className="flex gap-8">
            {/* Primary Content Block - Left */}
            <Card className="bg-[#688ce4] text-white shadow-xl border-0 w-80">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-center text-white">
                  Customer Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="secondary"
                  className="w-full h-16 text-slate-900 font-semibold text-lg hover:bg-white/90 transition-all duration-200"
                  onClick={() => handleCustomerAction('registration')}
                >
                  <UserPlus className="h-6 w-6 mr-3" />
                  CUSTOMER REGISTRATION
                </Button>
                
                <Button
                  variant="secondary"
                  className="w-full h-16 text-slate-900 font-semibold text-lg hover:bg-white/90 transition-all duration-200"
                  onClick={() => handleCustomerAction('receipt')}
                >
                  <Receipt className="h-6 w-6 mr-3" />
                  CUSTOMER RECEIPT
                </Button>
                
                <Button
                  variant="secondary"
                  className="w-full h-16 text-slate-900 font-semibold text-lg hover:bg-white/90 transition-all duration-200"
                  onClick={() => handleCustomerAction('records')}
                >
                  <Database className="h-6 w-6 mr-3" />
                  VIEW CUSTOMER RECORDS
                </Button>
              </CardContent>
            </Card>

            {/* Secondary Content Block - Right */}
            <Card className="bg-[#688ce4] text-white shadow-xl border-0 w-80">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-center text-white">
                  Registration Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="secondary"
                  className="w-full h-16 text-slate-900 font-semibold text-lg hover:bg-white/90 transition-all duration-200"
                  onClick={() => handleCustomerAction('admin-register')}
                >
                  <ShieldCheck className="h-6 w-6 mr-3" />
                  REGISTER BY ADMIN
                </Button>
                
                <Button
                  variant="secondary"
                  className="w-full h-16 text-slate-900 font-semibold text-lg hover:bg-white/90 transition-all duration-200"
                  onClick={() => handleCustomerAction('customer-register')}
                >
                  <UserPlus className="h-6 w-6 mr-3" />
                  REGISTER BY CUSTOMER
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Customer Registration Modal */}
      {showRegistration && (
        <CustomerRegistration
          onClose={() => setShowRegistration(false)}
          onSave={handleSaveCustomer}
        />
      )}

      {/* Customer Receipt Modal */}
      {showReceipt && (
        <CustomerReceipt
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
};

export default Customer;
