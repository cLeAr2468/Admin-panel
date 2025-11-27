import { useState, useEffect } from 'react';
import { Button } from '../ui/button.jsx';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { fetchApi } from '@/lib/api.js';

// Default/Static shop when no localStorage is set
const DEFAULT_SHOP = {
  shop_name: 'Laundry Shop',
  slug: 'laundry-shop',
  shop_id: 'LMSS-00000'
};

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [shops, setShops] = useState([]);
  const [loadingShops, setLoadingShops] = useState(true);
  const [selectedShop, setSelectedShop] = useState(null);
  const { slug } = useParams();
  const navigate = useNavigate();

  
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await fetchApi('/api/public/shop-name-slug');

        if (response.success && response.data) {
          const shopsWithSlug = response.data.filter(shop => shop.slug && shop.slug.trim() !== '');
          setShops(shopsWithSlug);

          if (!slug) {
            localStorage.removeItem('selectedShop');
            localStorage.removeItem('selectedShopId');
            setSelectedShop(DEFAULT_SHOP);
            return;
          }

          if (slug) {
            const shop = shopsWithSlug.find(s => s.slug === slug);
            setSelectedShop(shop || DEFAULT_SHOP);

            if (shop) {
              localStorage.setItem('selectedShop', shop.slug);
              localStorage.setItem('selectedShopId', shop.shop_id);
            }
          } else {
            const savedSlug = localStorage.getItem('selectedShop');
            const savedId = localStorage.getItem('selectedShopId');

            if (savedSlug && savedId) {
              const shop = shopsWithSlug.find(s => s.slug === savedSlug);
              setSelectedShop(shop || DEFAULT_SHOP);
            } else {
              setSelectedShop(DEFAULT_SHOP);
            }
          }
        }
      } catch (err) {
        console.error(err);
        setShops([]);
        setSelectedShop(DEFAULT_SHOP);
      } finally {
        setLoadingShops(false);
      }
    };

    fetchShops();
  }, [slug]);

  const handleShopChange = (shop) => {
    setSelectedShop(shop);
    localStorage.setItem('selectedShop', shop.slug);
    localStorage.setItem('selectedShopId', shop.shop_id);
  };

  const currentShop = selectedShop || DEFAULT_SHOP;

  return (
    <header className="bg-[#126280] p-4 text-white fixed top-0 left-0 right-0 z-50">
      <div className="flex justify-between items-center px-4 md:px-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {/* Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                  <img src="/laundry-logo.jpg" className="w-10 h-10 rounded-full" alt="Laundry Shop" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 z-50">
                <DropdownMenuLabel>Select Shop</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {loadingShops ? (
                  <div className="px-2 py-1.5 text-sm text-gray-500">Loading shops...</div>
                ) : shops.length > 0 ? (
                  shops.map(shop => (
                    <DropdownMenuItem key={shop.slug} asChild>
                      <Link
                        to={`/${shop.slug}`}
                        onClick={() => handleShopChange(shop)}
                        className="cursor-pointer"
                      >
                        {shop.shop_name}
                      </Link>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-gray-500">No shops available</div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to={`/${currentShop?.slug}`} className="text-2xl font-bold hover:opacity-80">
              {currentShop?.shop_name || 'Laundry Shop'}
            </Link>
          </div>
        </div>

        <nav className="hidden md:flex justify-between items-center gap-10">
          <ul className="flex gap-6 font-semibold">
            <li>
              <Link to={currentShop ? `/${currentShop.slug}` : '/'} className="hover:underline">
                HOME
              </Link>
            </li>
            <li>
              <Link
                to={currentShop ? `/${currentShop.slug}/about` : '/about'}
                className="hover:underline"
              >
                ABOUT
              </Link>
            </li>
            <li>
              <Link to={currentShop ? `/${currentShop.slug}/services` : '/services'} className="hover:underline">
                SERVICES
              </Link>
            </li>
            <li>
              <Link to={currentShop ? `/${currentShop.slug}/prices` : '/prices'} className="hover:underline">
                PRICES
              </Link>
            </li>
          </ul>
          <Link to="/login">
            <Button
              variant="outline"
              size="sm"
              className="text-white border-[#126280] bg-[#126280] hover:bg-white hover:text-slate-900 font-bold"
            >
              LOGIN
            </Button>
          </Link>
        </nav>

        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="text-white hover:bg-slate-800"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </Button>
        </div>
      </div>

      {isOpen && (
        <Card className="md:hidden mt-4 mx-4 bg-slate-800 border-0">
          <CardContent className="p-4">
            <ul className="flex flex-col gap-4 font-semibold mb-4">
              <li>
                <select
                  value={currentShop?.slug || ''}
                  onChange={(e) => {
                    const shop = shops.find(s => s.slug === e.target.value);
                    if (shop) {
                      handleShopChange(shop);
                      navigate(`/${shop.slug}`);
                    }
                  }}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded hover:bg-slate-600"
                >
                  <option value="">Select a Shop</option>
                  {shops.map((shop) => (
                    <option key={shop.slug} value={shop.slug}>
                      {shop.shop_name}
                    </option>
                  ))}
                </select>
              </li>
              <li><Link to={currentShop ? `/${currentShop.slug}` : '/'} className="hover:underline">HOME</Link></li>
              <li><Link to={currentShop ? `/${currentShop.slug}/about` : '/about'} className="hover:underline">ABOUT</Link></li>
              <li><Link to={currentShop ? `/${currentShop.slug}/services` : '/services'} className="hover:underline">SERVICES</Link></li>
              <li><Link to={currentShop ? `/${currentShop.slug}/prices` : '/prices'} className="hover:underline">PRICES</Link></li>
            </ul>
            <Link to="/login" className="w-full">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-white border-white hover:bg-white hover:text-slate-900"
              >
                LOGIN
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </header>
  );
};

export default Header;