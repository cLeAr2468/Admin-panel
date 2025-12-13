import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Menu, BarChart3, Users, Package, FileText, CreditCard, DollarSign, Info, Wrench, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { DEFAULT_SHOP, verifySlug } from '@/lib/shop';
import { AuthContext } from '@/context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedShop, setSelectedShop] = useState(null);
  const { slug } = useParams();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    const load = async () => {
      const shop = await verifySlug(slug);
      setSelectedShop(shop);
    };
    load();
  }, [slug]);

  const currentShop = selectedShop || DEFAULT_SHOP;


  const menuItems = [
    { name: 'DASHBOARD', icon: BarChart3, path: currentShop ? `/${currentShop.slug}/dashboard` : '/dashboard' },
    { name: 'CUSTOMER', icon: Users, path: currentShop ? `/${currentShop.slug}/customer` : '/customer' },
    { name: 'INVENTORY', icon: Package, path: currentShop ? `/${currentShop.slug}/inventory` : '/inventory' },
    { name: 'REPORTS', icon: FileText, path: currentShop ? `/${currentShop.slug}/reports` : '/reports' },
    { name: 'MANAGE PRICE', icon: DollarSign, path: currentShop ? `/${currentShop.slug}/manage-price` : '/manage-price' },
    { name: 'MANAGE SERVICES', icon: Wrench, path: currentShop ? `/${currentShop.slug}/manage-services` : '/manage-services' },
    { name: 'MANAGE ABOUT', icon: Info, path: currentShop ? `/${currentShop.slug}/manage-about` : '/manage-about' },
    { name: 'PAYMENT METHOD', icon: CreditCard, path: currentShop ? `/${currentShop.slug}/payment` : '/payment' },
    { name: 'LOG OUT', icon: LogOut, path: '/logout' },
  ];


  const handleNavigation = (path) => {
    if (path === '/logout') {

      localStorage.clear();
      logout();
      navigate(`/${currentShop?.slug}`);
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
                className={`w-full justify-start text-left h-12 ${isActive
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
