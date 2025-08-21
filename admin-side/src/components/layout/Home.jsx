import React from "react";
import { Button } from "@/components/ui/button";

const Home = () => {
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
                            Welcome to Wash Wise Intelligence
                        </h1>
                        <p className="text-xl text-gray-700 mb-8">
                            Professional Laundry & Dry Cleaning Services
                        </p>
                        <Button className="bg-[#126280] text-white px-8 py-6 text-lg hover:bg-[#126280]/90">
                            Book Now
                        </Button>
                    </div>

                    {/* Services Section */}
                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        <ServiceCard
                            title="Wash & Fold"
                            description="Professional washing and folding service with premium care for your garments"
                            price="₱140/load"
                        />
                        <ServiceCard
                            title="Dry Cleaning"
                            description="Expert dry cleaning for your delicate and special garments"
                            price="₱180/item"
                        />
                        <ServiceCard
                            title="Express Service"
                            description="Same-day service for urgent laundry needs"
                            price="₱200/load"
                        />
                    </div>

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

const ServiceCard = ({ title, description, price }) => (
    <div className="bg-white/80 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
        <h3 className="text-xl font-bold text-[#126280] mb-3">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <p className="text-2xl font-bold text-[#126280]">{price}</p>
    </div>
);

const FeatureItem = ({ title, description }) => (
    <div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

export default Home;