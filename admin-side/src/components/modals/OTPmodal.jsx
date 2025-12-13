import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import icon from "../../../public/password-access.png"

const OTPModal = ({
    open,
    onClose,
    onSubmit,
    onResend,
    resendDisabled,
    resendTimer,
    title = "Account Verification",
    message = "Please enter the OTP sent to your email.",
    icon = "../../../public/password-access.png"
}) => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const inputsRef = useRef([]);

    if (!open) return null;

    const handleChange = (e, idx) => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        if (value.length > 1) return;

        const newOtp = [...otp];
        newOtp[idx] = value;
        setOtp(newOtp);

        if (value && idx < 5) {
            inputsRef.current[idx + 1].focus();
        }
    };

    const handleKeyDown = (e, idx) => {
        if (e.key === "Backspace" && !otp[idx] && idx > 0) {
            inputsRef.current[idx - 1].focus();
        }
    };

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData("text").slice(0, 6).split("");
        const updated = paste.map(char => char.replace(/[^0-9]/g, ""));

        const newOtp = [...otp];
        updated.forEach((digit, idx) => {
            newOtp[idx] = digit;
        });

        setOtp(newOtp);
        e.preventDefault();

        const lastIndex = updated.length - 1;
        if (inputsRef.current[lastIndex]) {
            inputsRef.current[lastIndex].focus();
        }
    };

    const isComplete = otp.every(v => v !== "");

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                <div className="flex justify-center mb-2">
                    <img src={icon} className="w-14 h-14" />
                </div>

                <h3 className="text-lg font-bold mb-2 text-center text-[#126280]">
                    {title}
                </h3>

                <p className="text-sm text-gray-600 mb-4 text-center">
                    {message}
                </p>

                <div className="flex justify-center gap-2 mb-4" onPaste={handlePaste}>
                    {otp.map((digit, idx) => (
                        <input
                            key={idx}
                            ref={el => inputsRef.current[idx] = el}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(e, idx)}
                            onKeyDown={(e) => handleKeyDown(e, idx)}
                            className="w-10 h-12 text-center text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-100"
                        />
                    ))}
                </div>

                <div className="flex gap-2 mb-2">
                    <Button
                        className="w-full bg-[#126280] hover:bg-[#126280]/80 text-white rounded-full font-semibold"
                        disabled={!isComplete}
                        onClick={() => isComplete && onSubmit(otp.join(""))}
                    >
                        Submit
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full rounded-full"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                </div>

                <div className="text-center mt-2">
                    <Button
                        variant="ghost"
                        className="text-blue-600 font-semibold"
                        disabled={resendDisabled}
                        onClick={onResend}
                    >
                        {resendDisabled ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default OTPModal;
