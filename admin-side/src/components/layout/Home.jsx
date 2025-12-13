import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useParams } from 'react-router-dom';
import { fetchApi } from "@/lib/api";

const DEFAULT_SHOP_NAME = 'Wise Wash Intelligence';

const Home = () => {
    const { slug } = useParams();
    const [servicesData, setServicesData] = useState(null);
    const [loading, setLoading] = useState(true);

    const shopName = slug ? slug : DEFAULT_SHOP_NAME;

    const DEFAULT_SERVICES_DATA = {
        shop_name: 'Wash Wise Intelligence',
        slug: 'wash-wise-intelligence',
        services: [
            {
                service_id: 1,
                service_name: "Wash & Fold",
                service_description: "Professional washing and folding service with premium care for your garments",
            },
            {
                service_id: 2,
                service_name: "Dry Cleaning",
                service_description: "Professional dry cleaning service for delicate fabrics and special garments. We use eco-friendly solvents to ensure your clothes look their best.",
            },
            {
                service_id: 3,
                service_name: "Ironing Service",
                service_description: "Expert ironing and pressing service to make your clothes crisp and wrinkle-free. Perfect for business attire and special occasions.",
            }
        ]
    }

    useEffect(() => {
        const fetchServicesData = async () => {
            setLoading(true);

            try {
                if (!slug || slug === DEFAULT_SERVICES_DATA.slug) {
                    setServicesData(DEFAULT_SERVICES_DATA);
                    return;
                }

                const response = await fetchApi(`/api/public/shop-services/${slug}`);

                if (!response?.success) {
                    setServicesData(DEFAULT_SERVICES_DATA);
                    return;
                }

                setServicesData(response.data);
            } catch (error) {
                console.error("Error fetching services:", error);
                setServicesData(DEFAULT_SERVICES_DATA);
            } finally {
                setLoading(false);
            }
        };

        fetchServicesData();
    }, [slug]);

    return (
        <div className="min-h-screen bg-cover bg-center"
            style={{
                backgroundImage: "url('/laundry-logo.jpg')",
                backgroundSize: 'contain',
                backgroundRepeat: 'repeat'
            }}
        >
            <div className='bg-[#A4DCF4] bg-opacity-80 min-h-screen'>
                {/* Hero Section */}
                <div className="container mx-auto pt-20 px-4">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold text-[#126280] mb-4">
                            Welcome to  {shopName ? shopName.replace(/-/g, ' ') : 'Our Shop'}
                        </h1>
                        <p className="text-xl text-gray-700 mb-8">
                            Professional Laundry & Dry Cleaning Services
                        </p>
                        <Link to="/dashboard">
                            <Button className="bg-[#126280] text-white px-8 py-6 text-lg hover:bg-[#126280]/90">
                                Go to Dashboard
                            </Button>
                        </Link>
                    </div>

                    {/* Services Section */}
                    {servicesData?.services?.length > 0 ? (
                        <div className="grid md:grid-cols-3 gap-8 mb-16">
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

                    {/* Features Section */}
                    <div className="bg-white/80 rounded-xl p-8 mb-16">
                        <h2 className="text-3xl font-bold text-[#126280] text-center mb-8">
                            Why Choose Us?
                        </h2>
                        <div className="grid md:grid-cols-4 gap-6 text-center">
                            <FeatureItem
                                title="Quality Service"
                                description="Premium cleaning solutions"
                            />
                            <FeatureItem
                                title="Fast Turnaround"
                                description="24-hour service available"
                            />
                            <FeatureItem
                                title="Affordable Rates"
                                description="Competitive pricing"
                            />
                            <FeatureItem
                                title="Expert Staff"
                                description="Professional handling"
                            />
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="text-center pb-8">
                        <h2 className="text-2xl font-bold text-[#126280] mb-4">
                            Visit Us Today
                        </h2>
                        <p className="text-gray-700 mb-2">123 Laundry Street, Your City</p>
                        <p className="text-gray-700 mb-2">Phone: (123) 456-7890</p>
                        <p className="text-gray-700">Open Hours: Mon-Sun 7:00 AM - 9:00 PM</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ServiceCard = ({ service }) => {

    const cleanServiceName = service.service_name?.replace(/"/g, '') || 'Service';
    const cleanDescription = service.service_description?.replace(/"/g, '') || '';

    return (
        <div className="bg-white/80 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
            <h3 className="text-xl font-bold text-[#126280] mb-3">{cleanServiceName}</h3>
            <p className="text-gray-600 mb-4">{cleanDescription}</p>
            {/* <p className="text-2xl font-bold text-[#126280]">{price}</p> */}
        </div>
    )
};

const FeatureItem = ({ title, description }) => (
    <div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

export default Home;