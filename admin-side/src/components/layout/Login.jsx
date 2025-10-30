import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [username, setUsername] = useState("admin");
    const [password, setPassword] = useState("password");
    const [error, setError] = useState("");
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetMessage, setResetMessage] = useState("");
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

    // Handle password reset submission
    const handleResetSubmit = (e) => {
        e.preventDefault();
        setResetMessage("");
        
        if (!resetEmail.trim()) {
            setResetMessage("Please enter your email address");
            return;
        }
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
            setResetMessage("Please enter a valid email address");
            return;
        }

        setResetMessage("If an account exists with this email, you will receive reset instructions.");
        setTimeout(() => {
            setShowForgotModal(false);
            setResetEmail("");
            setResetMessage("");
        }, 3000);
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
                                            className="text-blue-600 hover:underline"
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

            {/* Modal for Forgot Password */}
            {showForgotModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-[#126280]">Reset Password</h3>
                            <button
                                onClick={() => {
                                    setShowForgotModal(false);
                                    setResetEmail("");
                                    setResetMessage("");
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleResetSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm text-gray-600 mb-2">
                                    Enter your email address
                                </label>
                                <Input
                                    type="email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="bg-gray-100 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base h-10 md:h-12 w-full"
                                    required
                                />
                            </div>

                            {resetMessage && (
                                <p className="text-sm text-center mb-4 text-gray-600">
                                    {resetMessage}
                                </p>
                            )}

                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    className="flex-1 bg-[#126280] hover:bg-[#126280]/80 text-white rounded-full"
                                >
                                    Send Reset Link
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setShowForgotModal(false);
                                        setResetEmail("");
                                        setResetMessage("");
                                    }}
                                    className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-full"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;