import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleResetSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        // Add password reset logic here
        navigate("/login");
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
                            alt="Reset Password Visual"
                            className="w-[200px] md:w-[250px] h-[240px] md:h-[300px] rounded-[20%]"
                            style={{
                                boxShadow: "12px 0 20px -2px rgba(0, 0, 0, 0.6)"
                            }}
                        />
                    </div>

                    <div className="w-full md:w-[440px]">
                        <Card className="w-full shadow-lg bg-[#E4F4FC]/80">
                            <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6">
                                <h2 className="text-xl md:text-2xl font-bold text-center">Reset Password</h2>
                                
                                {error && (
                                    <p className="text-red-500 text-sm text-center font-semibold">
                                        {error}
                                    </p>
                                )}

                                <form onSubmit={handleResetSubmit}>
                                    <div className="space-y-2">
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            placeholder="New Password"
                                            className="bg-gray-300 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base h-10 md:h-12"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2 mt-2">
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="Confirm Password"
                                            className="bg-gray-300 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base h-10 md:h-12"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <Button 
                                        type="submit"
                                        className="w-full mt-6 bg-[#126280] hover:bg-[#126280]/80 h-10 md:h-12 text-sm md:text-base text-white"
                                    >
                                        Reset Password
                                    </Button>
                                </form>

                                <p className="text-sm md:text-md text-center text-gray-600 mt-2 md:mt-4">
                                    <a href="/login" className="text-blue-600 font-semibold hover:underline">Back to Login</a>
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;