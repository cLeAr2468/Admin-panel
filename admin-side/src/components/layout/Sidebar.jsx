import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Menu, BarChart3, Users, Package, FileText, CreditCard, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuItems = [
    { name: 'DASHBOARD', icon: BarChart3, path: '/dashboard' },
    { name: 'CUSTOMER', icon: Users, path: '/customer' },
    { name: 'INVENTORY', icon: Package, path: '/inventory' },
    { name: 'REPORTS', icon: FileText, path: '/reports' },
    { name: 'PAYMENT METHOD', icon: CreditCard, path: '/payment' },
    { name: 'LOG OUT', icon: LogOut, path: '/logout' },
  ];

  const handleNavigation = (path) => {
    if (path === '/logout') {

      localStorage.clear();
      navigate('/login');
    } else if (path !== location.pathname) {

      navigate(path);
    }
  };

  return (
    <Card className="w-64 h-screen rounded-none border-r-0 bg-[#688ce4] text-white font-bold shadow-lg print:hidden">
      <CardContent className="p-4 h-full">
        
        <h2 className="text-lg font-bold mb-6 text-white">MENU</h2>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.name}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start text-left h-12 ${
                  isActive 
                    ? 'bg-slate-800 text-white font-bold hover:bg-slate-600 border-0' 
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white border-0'
                }`}
                onClick={() => handleNavigation(item.path)}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </Button>
            );
          })}
        </nav>
      </CardContent>
    </Card>
  );
};

export default Sidebar;
