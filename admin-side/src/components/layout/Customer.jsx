import React, { useState } from 'react';
import { UserPlus, Receipt, Database, ShieldCheck, ArrowLeft } from 'lucide-react';
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
        setRegistrationType('ADMIN'); // Default to ADMIN for the main registration button
        setShowRegistration(true);
        break;
      case 'receipt':
        setShowReceipt(true);
        break;
      case 'records':
        setShowCustomerRec(true);
        setShowUserTable(false);
        setShowCustomerTable(false);
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
    <div className="flex h-screen bg-transparent">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto bg-transparent relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #126280 2px, transparent 2px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Top Date Display */}
        <div className="relative z-10 flex justify-end mb-8">
          <Card className="bg-transparent shadow-sm border-0">
            <CardContent className="p-3">
              <div className="text-lg font-semibold text-slate-700">
                Date: April 4, 2025
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        {!showUserTable && !showCustomerTable && !showCustomerRec ? (
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
        ) : (
          <div className="relative z-10">
            <div className="mb-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowUserTable(false);
                  setShowCustomerTable(false);
                  setShowCustomerRec(false);
                }}
              >
                <ArrowLeft className="cursor-pointer text-[#126280] hover:text-[#126280]/80" />
              </Button>
            </div>
            <Card className="bg-white shadow-xl border-0">
              <CardContent className="p-4">
                {showUserTable && <UserTable embedded={true} />}
                {showCustomerTable && <Custb embedded={true} />}
                {showCustomerRec && <CustomerRec />}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Customer Registration Modal */}
      {showRegistration && (
        <CustomerRegistration
          onClose={() => {
            setShowRegistration(false);
            setRegistrationType(''); // Reset registration type when closing
          }}
          onSave={handleSaveCustomer}
          registeredBy={registrationType} // Pass the registration type as a prop
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
