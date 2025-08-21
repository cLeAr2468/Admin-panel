import React from 'react';
import image from '../../assets/pic1.jpg';

const Services = () => {
    return (
        <div
            className="min-h-screen bg-cover bg-center"
            style={{
                backgroundImage: "url('./public/laundry-logo.jpg')",
            }}
        >
            <div className="bg-[#A4DCF4] bg-opacity-80 min-h-screen pt-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-black">
                        Wash Wise Intelligence Laundry Shop
                    </h1>


                    <div className="flex justify-center mt-10 sm:mt-12 md:mt-16">
                        <img
                            src={image}
                            alt="Laundry Shop"
                            className="rounded-lg shadow-lg w-60 sm:w-72 md:w-[300px] h-auto"
                        />
                    </div>


                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-black mt-6 sm:mt-8 mb-3 sm:mb-5">
                        Machine wash
                    </h1>


                    <p className="text-black text-center text-base sm:text-lg md:text-[20px] font-semibold mb-8 px-4 sm:px-16 md:px-[30%]">
                        Our state of the art machine washing service guarantees your clothes are thoroughly cleaned and gently cared for.
                        Enjoy fresh, spotless laundry with every visit.
                    </p>
                </div>
            </div>
        </div>
    );
};

const ServiceCard = ({ title, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">{title}</h2>
        <p className="text-gray-600">{description}</p>
    </div>
);

export default Services;
