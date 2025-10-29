import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [username, setUsername] = useState("admin");
    const [password, setPassword] = useState("password");
    const [error, setError] = useState("");
    const [showForgotModal, setShowForgotModal] = useState(false); // added for modal
    const [forgotEmail, setForgotEmail] = useState(""); // email input for modal
    const [forgotMessage, setForgotMessage] = useState(""); // feedback for modal
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        setError("");

        // Simple hardcoded authentication
        if (username === "admin" && password === "password") {
            // Navigate to dashboard on successful login
            navigate("/dashboard");
        } else {
            setError("Invalid username or password. Use admin/password");
        }
    };

    // New: simple email validation
    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleForgotSubmit = (e) => {
        e.preventDefault();
        setForgotMessage("");
        if (!forgotEmail.trim()) {
            setForgotMessage("Please enter your email.");
            return;
        }
        if (!isValidEmail(forgotEmail)) {
            setForgotMessage("Please enter a valid email address.");
            return;
        }

        // Simulate sending reset link (replace with API call as needed)
        setForgotMessage("If an account exists for that email, a reset link has been sent.");
        setTimeout(() => {
            setShowForgotModal(false);
            setForgotEmail("");
            setForgotMessage("");
        }, 2500);
    };

    return (
        <div className="min-h-screen bg-cover bg-center"
            style={{
                backgroundImage: "url('/laundry-logo.jpg')",

            }}
        >
            <div className='bg-[#A4DCF4] bg-opacity-80 min-h-screen pt-10 md:pt-20'>
                <div className='container flex flex-col md:flex-row items-center justify-center min-h-[500px] gap-16 mx-auto px-4 md:px-[15%]'>
                    {/* Left Side - Image */}
                    <div className="hidden md:block">
                        <img
                            src="/laundry-logo.jpg"
                            alt="Login Visual"
                            className="w-[200px] md:w-[250px] h-[240px] md:h-[300px] rounded-[20%]"
                            style={{
                                boxShadow: "12px 0 20px -2px rgba(0, 0, 0, 0.6)"
                            }}
                        />
                    </div>

                    <div className="w-full md:w-[440px]">
                        <Card className="w-full shadow-lg bg-[#E4F4FC]/80">
                            <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6">
                                <div className="flex items-center justify-center mb-2 md:mb-4">
                                    <img
                                        src="/user.jpg"
                                        alt="Login Visual"
                                        className="w-[70px] md:w-[90px] h-[70px] md:h-[90px] rounded-[100%]"
                                    />
                                </div>

                                <h2 className="text-xl md:text-2xl font-bold text-center">Login</h2>
                                
                                {error && (
                                    <p className="text-red-500 text-sm text-center font-semibold">
                                        {error}
                                    </p>
                                )}

                                <form onSubmit={handleLogin}>
                                    <div className="space-y-2">
                                        <Input
                                            id="username"
                                            type="text"
                                            placeholder="Username/Email"
                                            className="bg-gray-300 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base h-10 md:h-12"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2 mt-2">
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Password"
                                            className="bg-gray-300 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base h-10 md:h-12"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <p className="text-sm md:text-md text-gray-600 mt-2 md:mt-4 text-right font-semibold">
                                        <button
                                            type="button"
                                            onClick={() => setShowForgotModal(true)}
                                            className="text-blue-600 hover:underline focus:outline-none"
                                        >
                                            Forgot password
                                        </button>
                                    </p>

                                    <Button 
                                        type="submit"
                                        className="w-full mt-2 md:mt-4 bg-[#126280] hover:bg-[#126280]/80 h-10 md:h-12 text-sm md:text-base text-white"
                                    >
                                        Login
                                    </Button>
                                </form>

                                <p className="text-sm md:text-md text-center text-gray-600 mt-2 md:mt-4">
                                    <a href="/" className="text-blue-600 font-semibold hover:underline">Back to Home</a>
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
                    <div className="w-full max-w-md">
                        <Card className="shadow-lg">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <h3 className="text-lg font-semibold">Forgot Password</h3>
                                    <button
                                        onClick={() => { setShowForgotModal(false); setForgotMessage(""); }}
                                        aria-label="Close"
                                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <p className="text-sm text-gray-600 mt-2">Enter your email to receive a password reset link.</p>

                                <form onSubmit={handleForgotSubmit} className="mt-4 space-y-3">
                                    <Input
                                        id="forgot-email"
                                        type="email"
                                        placeholder="Email address"
                                        className="bg-gray-100 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 h-10"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        required
                                    />

                                    {forgotMessage && (
                                        <p className="text-sm text-center text-gray-700">
                                            {forgotMessage}
                                        </p>
                                    )}

                                    <div className="flex gap-2">
                                        <Button type="submit" className="flex-1 bg-[#126280] hover:bg-[#126280]/90 text-white h-10">
                                            Send Reset Link
                                        </Button>
                                        <Button type="button" onClick={() => { setShowForgotModal(false); setForgotMessage(""); }} className="flex-1 bg-gray-200 text-gray-800 h-10">
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;