import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckSquare } from 'lucide-react';
import images1 from '../../assets/bg1.jpg';
import { fetchApi } from '@/lib/api';

const DEFAULT_ABOUT_DATA = {
    shop_name: 'Laundry Shop',
    slug: 'laundry-shop',
    about: [
        {
            about_id: 1,
            title: 'Personalized Experience',
            description: 'You can always reach us for your laundry concerns. Call or message us — we are happy to help.'
        },
        {
            about_id: 2,
            title: 'Quality',
            description: 'We take care of your clothes. We segregate the whites and coloreds, use gentle detergents, and avoid damage to your garments.'
        },
        {
            about_id: 3,
            title: 'Convenience',
            description: 'None of your laundry will go missing. Every item is counted, and you\'ll receive automated message notifications for your convenience.'
        }
    ]
};

const About = () => {
    const { slug } = useParams();
    const [aboutData, setAboutData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAboutData = async () => {
            try {
                setLoading(true);

                if (slug === 'laundry-shop') {
                    setAboutData(DEFAULT_ABOUT_DATA);
                    setLoading(false);
                    return;
                }

                const response = await fetchApi(`/api/public/shop-about/${slug}`);
                

                if (!response || response.success === false) {
                    throw new Error(response.message || 'Failed to fetch about data');
                }

                if (response.success) {
                    setAboutData(response.data);
                } else {
                    throw new Error('Invalid response from server');
                }
            } catch (err) {
                console.error('Error fetching about data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchAboutData();
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

    if (!aboutData) {
        return (
            <div className="min-h-screen bg-[#A4DCF4] bg-opacity-80 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-700">No data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/laundry-logo.jpg')" }}>
            <div className="bg-[#A4DCF4] bg-opacity-80 min-h-screen pt-20">
                <section>
                    <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-10 px-4 md:px-10">
                        <div className="md:block hidden relative mt-10 md:mt-20 w-full md:w-auto flex justify-center">
                            <img
                                src={images1}
                                alt={aboutData.shop_name}
                                className="rounded-lg shadow-lg w-full max-w-md h-auto md:h-[400px]"
                            />
                        </div>

                        <div className="md:hidden relative mt-10 md:mt-20 w-full flex justify-center">
                            <img
                                src={images1}
                                alt={aboutData.shop_name}
                                className="rounded-full shadow-lg w-40 h-40 object-cover"
                            />
                        </div>

                        <div className="relative md:-ml-20 w-full md:w-[50%] z-10 mt-6 md:mt-0">
                            <div className="text-[18px]">
                                <h1 className="text-3xl md:text-4xl font-bold text-black mb-5 text-center md:text-left">
                                    YOUR TRUSTED PARTNER IN LAUNDRY CARE
                                </h1>
                                <p className="text-black mb-4 md:ml-8 text-center md:text-left">
                                    We are professional and committed to providing quality laundry and dry cleaning services.
                                </p>

                                {aboutData.about && aboutData.about.length > 0 ? (
                                    aboutData.about.map((item) => (
                                        <div key={item.about_id} className="mb-6">
                                            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-black justify-center md:justify-start">
                                                <CheckSquare className="w-6 h-6 text-black" />
                                                {item.title}
                                            </h2>
                                            <p className="text-black md:ml-8 mb-4 mt-2 text-center md:text-left">
                                                {item.description}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-600">No about information available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default About;