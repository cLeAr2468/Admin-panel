        import React from 'react';
        import image from '../../../public/laundry-logo.jpg';
        import { CheckSquare } from 'lucide-react';
        import images1 from '../../assets/bg1.jpg';

        const About = () => {
            return (
                    <div
                        className="min-h-screen bg-cover bg-center"
                        style={{
                            backgroundImage: "url('./public/laundry-logo.jpg')",
                        }}
                    >
                    <div className="bg-[#A4DCF4] bg-opacity-80 min-h-screen pt-20">
                        <section>
                            <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-10 px-4 md:px-10">
                                <div className="md:block hidden relative mt-10 md:mt-20 w-full md:w-auto flex justify-center">
                                    <img
                                        src={images1}
                                        alt="Laundry Shop"
                                        className="rounded-lg shadow-lg w-full max-w-md h-auto md:h-[400px]"
                                    />
                                </div>

                                <div className="md:hidden relative mt-10 md:mt-20 w-full flex justify-center">
                                    <img
                                        src={image}
                                        alt="Laundry Shop"
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

                                        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-black justify-center md:justify-start">
                                            <CheckSquare className="w-6 h-6 text-black" />
                                            Personalized Experience
                                        </h1>
                                        <p className="text-black md:ml-8 mb-4 mt-2 text-center md:text-left">
                                            You can always reach us for your laundry concerns. Call or message us — we are happy to help.
                                        </p>

                                        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-black justify-center md:justify-start">
                                            <CheckSquare className="w-6 h-6 text-black" />
                                            Quality
                                        </h1>
                                        <p className="text-black md:ml-8 mb-4 mt-2 text-center md:text-left">
                                            We take care of your clothes. We segregate the whites and coloreds, use gentle detergents,
                                            and avoid damage to your garments.
                                        </p>

                                        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-black justify-center md:justify-start">
                                            <CheckSquare className="w-6 h-6 text-black" />
                                            Convenience
                                        </h1>
                                        <p className="text-black md:ml-8 mb-4 mt-2 text-center md:text-left">
                                            None of your laundry will go missing. Every item is counted, and you'll receive automated
                                            message notifications for your convenience.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            );
        };

        export default About;
