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

const DEFAULT_SHOP = {
  shop_name: 'Wash Wise Intelligence',
  slug: 'wash-wise-intelligence',
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
    const verifySlug = async () => {
      try {

        if (!slug) {
          localStorage.removeItem('selectedShop');
          localStorage.removeItem('selectedShopId');
          setSelectedShop(DEFAULT_SHOP);
          return;
        }

        const response = await fetchApi(`/api/public/shop-slug/${slug}`);

        if (!response.success) {
          localStorage.removeItem('selectedShop');
          localStorage.removeItem('selectedShopId');
          setSelectedShop(DEFAULT_SHOP);
          return;
        }

        localStorage.setItem('selectedShop', response.data.slug);
        localStorage.setItem('selectedShopId', response.data.shop_id);
        setSelectedShop(response.data);

      } catch (err) {
        console.error("Slug check failed:", err);
        setSelectedShop(DEFAULT_SHOP);
        localStorage.removeItem('selectedShop');
        localStorage.removeItem('selectedShopId');
      }
    };

    verifySlug();
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
          <Link to={currentShop ? `/${currentShop.slug}/login` : '/login'}>
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