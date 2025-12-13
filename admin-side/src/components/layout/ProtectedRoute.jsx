import { DEFAULT_SHOP, verifySlug } from "@/lib/shop";
import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { slug } = useParams();
  const [selectedShop, setSelectedShop] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const load = async () => {
      const shop = await verifySlug(slug);
      setSelectedShop(shop);
      setLoading(false);
    };
    load();
  }, [slug]);

  if (loading) return null;

  const currentShop = selectedShop || DEFAULT_SHOP;

  if (!token) {
    return <Navigate to={`/${currentShop.slug}/login`} replace />;
  }

  return children;
};

export default ProtectedRoute;
