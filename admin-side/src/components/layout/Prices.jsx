import React from 'react';
import images from '../../assets/img1.jpg';
import image from '../../assets/img2.jpg';

const Prices = () => {
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
                            Wash Wise Intelligence Laundry Shop
                        </h1>
                        <h2 className="text-2xl sm:text-3xl font-bold text-center text-black mb-6">
                            FRIENDLY PRICES
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">

                            <div className="p-4 sm:p-6 transform hover:scale-105 transition-transform">
                                <div className="aspect-video mb-4">
                                    <img
                                        src={images}
                                        alt="Clothes Laundry"
                                        className="rounded-lg shadow w-full h-full object-cover"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl sm:text-2xl font-bold text-center text-black">
                                        CLOTHES
                                    </h3>
                                    <p className="text-black text-center text-base sm:text-lg">
                                        Shirts, shorts, pants etc.
                                    </p>
                                    <p className="text-black text-center text-lg sm:text-xl">
                                        7kg (per load)
                                    </p>
                                    <p className="text-black font-extrabold text-center text-2xl sm:text-3xl">
                                        ₱140
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6 transform hover:scale-105 transition-transform">
                                <div className="aspect-video mb-4">
                                    <img
                                        src={image}
                                        alt="Beddings Laundry"
                                        className="rounded-lg shadow w-full h-full object-cover"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl sm:text-2xl font-bold text-center text-black">
                                        BEDDINGS
                                    </h3>
                                    <p className="text-black text-center text-base sm:text-lg">
                                        Bed sheets, pillow cases, towels, etc.
                                    </p>
                                    <p className="text-black text-center text-lg sm:text-xl">
                                        7kg (per load)
                                    </p>
                                    <p className="text-black font-extrabold text-center text-2xl sm:text-3xl">
                                        ₱140
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Prices;
