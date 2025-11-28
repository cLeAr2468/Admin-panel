import React, { useEffect, useState } from 'react';
import images from '../../assets/img1.jpg';
import image from '../../assets/img2.jpg';
import { useParams } from 'react-router-dom';
import { fetchApi } from '@/lib/api';

const DEFAULT_PRICES_DATA = {
    shop_name: 'Wash Wise Intelligence',
    slug: 'wash-wise-intelligence',
    pricing: [
        {
            pricing_id: 1,
            categories: "CLOTHES",
            price: "₱140",
            pricing_label: "7kg (per load)",
            description: "Shirts, shorts, pants etc.",
            image_url: images,
            is_displayed: "true"
        },
        {
            pricing_id: 2,
            categories: "BEDDINGS",
            price: "₱140",
            pricing_label: "7kg (per load)",
            description: "Bed sheets, pillow cases, towels, etc.",
            image_url: image,
            is_displayed: "true"
        },
        {
            pricing_id: 3,
            categories: "BEDDINGS",
            price: "₱140",
            pricing_label: "7kg (per load)",
            description: "Bed sheets, pillow cases, towels, etc.",
            image_url: image,
            is_displayed: "true"
        },
    ]
}
const Prices = () => {
    const { slug } = useParams();
    const [pricesData, setPricesData] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();

    useEffect(() => {
        const fetchPricesData = async () => {
            try {
                setLoading(true);

                if (slug === 'wash-wise-intelligence') {
                    setPricesData(DEFAULT_PRICES_DATA);
                    setLoading(false);
                    return;
                }

                const response = await fetchApi(`/api/public/shop-pricing/${slug}`);

                if (!response || response.success === false) {
                    throw new Error(data.message || 'Failed to fetch prices data');
                }

                if (response.success) {
                    setPricesData(response.data);
                } else {
                    throw new Error('Invalid response from server');
                }
            } catch (error) {
                console.error('Error fetching prices data: ', error);
                setError(error.message);
            } finally {
                setLoading(false)
            }
        };

        if (slug) {
            fetchPricesData();
        }

    }, [slug])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#A4DCF4] bg-opacity-80 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-700">Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#A4DCF4] bg-opacity-80 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!pricesData) {
        return (
            <div className="min-h-screen bg-[#A4DCF4] bg-opacity-80 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-700">No data available</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed overflow-hidden"
            style={{
                backgroundImage: "url('./public/laundry-logo.jpg')",
            }}
        >
            <div className="bg-[#A4DCF4] bg-opacity-80 min-h-screen">
                <div className="container mx-auto px-4 py-10">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl sm:text-4xl font-bold text-center text-black mb-4 mt-10">
                            {pricesData.shop_name}
                        </h1>
                        <h2 className="text-2xl sm:text-3xl font-bold text-center text-black mb-6">
                            FRIENDLY PRICES
                        </h2>

                        {pricesData.pricing && pricesData.pricing.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                {pricesData.pricing.map((price) => (
                                    <PriceCard
                                        key={price.pricing_id}
                                        price={price}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-xl text-gray-600">No services available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const PriceCard = ({ price }) => {
    const cleanPriceName = price.categories?.replace(/"/g, '') || 'Price';
    const cleanDescription = price.description?.replace(/"/g, '') || '';

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="relative w-full h-48 overflow-hidden bg-gray-200">
                <img
                    src={price.image_url}
                    alt={cleanPriceName}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                        e.target.src = '/assets/pic1.jpg';
                    }}
                />
            </div>
            <div className="p-6">
                <h3 className="text-xl sm:text-2xl font-bold text-center text-black">
                    {cleanPriceName}
                </h3>
                <p className="text-black text-center text-base sm:text-lg">
                    {cleanDescription}
                </p>
                <p className="text-black text-center text-lg sm:text-xl">
                    {price.price_label}
                </p>
                <p className="text-black font-extrabold text-center text-2xl sm:text-3xl">
                    ₱{price.price}
                </p>
            </div>
        </div>
    )
}

export default Prices;
