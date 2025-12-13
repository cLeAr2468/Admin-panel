import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import image from '../../assets/pic1.jpg';
import { fetchApi } from '@/lib/api';

const DEFAULT_SERVICES_DATA = {
    shop_name: 'Wash Wise Intelligence',
    slug: 'wash-wise-intelligence',
    services: [
        {
            service_id: 1,
            service_name: "Machine Washing",
            service_description: "Our state of the art machine washing service guarantees your clothes are thoroughly cleaned and gently cared for. Enjoy fresh, spotless laundry with every visit.",
            image_url: image,
            is_displayed: "true"
        },
        {
            service_id: 2,
            service_name: "Dry Cleaning",
            service_description: "Professional dry cleaning service for delicate fabrics and special garments. We use eco-friendly solvents to ensure your clothes look their best.",
            image_url: image,
            is_displayed: "true"
        },
        {
            service_id: 3,
            service_name: "Ironing Service",
            service_description: "Expert ironing and pressing service to make your clothes crisp and wrinkle-free. Perfect for business attire and special occasions.",
            image_url: image,
            is_displayed: "true"
        }
    ]
}

const Services = () => {
    const { slug } = useParams();
    const [servicesData, setServicesData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchServicesData = async () => {
            try {
                setLoading(true);

                if (slug === 'wash-wise-intelligence') {
                    setServicesData(DEFAULT_SERVICES_DATA);
                    setLoading(false);
                    return;
                }

                const response = await fetchApi(`/api/public/shop-services/${slug}`);

                if (!response || response.success === false) {
                    throw new Error(data.message || 'Failed to fetch services data');
                }

                if (response.success) {
                    setServicesData(response.data);
                } else {
                    throw new Error('Invalid response from server');
                }
            } catch (error) {
                console.error('Error fetching services data:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchServicesData();
        }
    }, [slug]);

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

    if (!servicesData) {
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
            className="min-h-screen bg-cover bg-center"
            style={{
                backgroundImage: "url('/laundry-logo.jpg')",
            }}
        >
            <div className="bg-[#A4DCF4] bg-opacity-80 min-h-screen pt-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-black mb-12">
                        {servicesData.shop_name}
                    </h1>

                    {servicesData.services && servicesData.services.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                            {servicesData.services.map((service) => (
                                <ServiceCard
                                    key={service.service_id}
                                    service={service}
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
    );
};

const ServiceCard = ({ service }) => {

    const cleanServiceName = service.service_name?.replace(/"/g, '') || 'Service';
    const cleanDescription = service.service_description?.replace(/"/g, '') || '';

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">

            <div className="relative w-full h-48 overflow-hidden bg-gray-200">
                <img
                    src={service.image_url}
                    alt={cleanServiceName}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                        e.target.src = '/assets/pic1.jpg';
                    }}
                />
            </div>

            <div className="p-6">
                <h2 className="text-2xl font-bold mb-3 text-[#126280]">
                    {cleanServiceName}
                </h2>
                <p className="text-gray-600 text-base leading-relaxed">
                    {cleanDescription}
                </p>
            </div>
        </div>
    );
};

export default Services;