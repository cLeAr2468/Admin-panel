import { fetchApi } from "./api";

export const DEFAULT_SHOP = {
  shop_name: "Wash Wise Intelligence",
  slug: "wash-wise-intelligence",
  shop_id: "LMSS-00000",
};

export async function verifySlug(slug) {
  try {
    if (!slug) {
      localStorage.removeItem("selectedShopName");
      localStorage.removeItem("selectedShop");
      localStorage.removeItem("selectedShopId");
      return DEFAULT_SHOP;
    }

    const response = await fetchApi(`/api/public/shop-slug/${slug}`);

    if (!response || response.success === false) {
      localStorage.removeItem("selectedShopName");
      localStorage.removeItem("selectedShop");
      localStorage.removeItem("selectedShopId");
      return DEFAULT_SHOP;
    }

    localStorage.setItem("selectedShopName", response.data.shop_name);
    localStorage.setItem("selectedShop", response.data.slug);
    localStorage.setItem("selectedShopId", response.data.shop_id);
    return response.data;
  } catch (err) {
    console.error("Slug check failed:", err);
    localStorage.removeItem("selectedShopName");
    localStorage.removeItem("selectedShop");
    localStorage.removeItem("selectedShopId");
    return DEFAULT_SHOP;
  }
}
