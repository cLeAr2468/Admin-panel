import React, { useState, useEffect, useContext } from "react";
import { ArrowLeft, Save, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from 'sonner';
import { Card, CardContent } from "@/components/ui/card"; 
import { fetchApi } from "@/lib/api";
import { AuthContext } from "@/context/AuthContext";

// OTP Modal Component
const OTPModal = ({ open, onClose, onSubmit, onResend, resendDisabled, resendTimer }) => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const inputsRef = React.useRef([]);

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
        const newOtp = [...otp];
        paste.forEach((char, idx) => {
            if (idx < 6) newOtp[idx] = char.replace(/[^0-9]/g, "");
        });
        setOtp(newOtp);
        const lastIdx = paste.length - 1;
        if (inputsRef.current[lastIdx]) {
            inputsRef.current[lastIdx].focus();
        }
        e.preventDefault();
    };

    const isOtpComplete = otp.every(d => d !== "");

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
              <div className="flex justify-center mb-2">
                    <img
                        src="/password-access.png"
                        alt="OTP Icon"
                        className="w-14 h-14"
                    />
                </div>
                <h3 className="text-lg font-bold mb-2 text-center text-[#126280]">Account Verification</h3>
                <p className="text-sm text-gray-600 mb-4 text-center">Please enter the OTP sent to your email.</p>
                <div className="flex justify-center gap-2 mb-4" onPaste={handlePaste}>
                    {otp.map((digit, idx) => (
                        <input
                            key={idx}
                            ref={el => inputsRef.current[idx] = el}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={e => handleChange(e, idx)}
                            onKeyDown={e => handleKeyDown(e, idx)}
                            className="w-10 h-12 text-center text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-100"
                        />
                    ))}
                </div>
                <div className="flex gap-2 mb-2">
                    <Button
                        className="w-full bg-[#126280] hover:bg-[#126280]/80 text-white rounded-full font-semibold"
                        onClick={() => isOtpComplete && onSubmit(otp.join(""))}
                        disabled={!isOtpComplete}
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
                        onClick={onResend}
                        disabled={resendDisabled}
                    >
                        Resend OTP {resendDisabled && resendTimer > 0 ? `(${resendTimer}s)` : ""}
                    </Button>
                </div>
            </div>
        </div>
    );
};

const CustomerRegistration = ({ onClose, onSave, registeredBy }) => {
  const [formData, setFormData] = useState({
    cus_fName: "",
    cus_lName: "",
    cus_mName: "",
    cus_eMail: "",
    cus_role: "CUSTOMER",
    cus_phoneNum: "",
    cus_address: "",
    cus_username: "",
    password: "",
    confirmPassword: "",
    registeredBy: registeredBy
  });
  const { adminData } = useContext(AuthContext);
  // Add useEffect to update registeredBy when prop changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      registeredBy: registeredBy
    }));
  }, [registeredBy]);

  // OTP Modal state
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Timer effect for resend button
  useEffect(() => {
      let timer;
      if (resendDisabled && resendTimer > 0) {
          timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      } else if (resendTimer === 0) {
          setResendDisabled(false);
      }
      return () => clearTimeout(timer);
  }, [resendDisabled, resendTimer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const response = await fetchApi(
        '/api/auth/register-user',
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            {
              shop_id: adminData.shop_id,
              user_fName: formData.cus_fName,
              user_lName: formData.cus_lName,
              user_mName: formData.cus_mName,
              user_address: formData.cus_address,
              username: formData.cus_username || `${formData.cus_lName}.${formData.cus_fName}`.toLowerCase(),
              contactNum: formData.cus_phoneNum,
              email: formData.cus_eMail,
              role: formData.cus_role,
              status: "ACTIVE",
              password: formData.password,
              registered_by: "CUSTOMER"
            }
          ),
        }
      );
      console.log(adminData.shop_id);
      if (response.success === false) {
        throw new Error(response.message || "Failed to register customer");
      }

      setFormData({
        cus_fName: "",
        cus_lName: "",
        cus_mName: "",
        cus_eMail: "",
        cus_role: "CUSTOMER",
        cus_phoneNum: "",
        cus_address: "",
        cus_username: "",
        password: "",
        confirmPassword: "",
        registeredBy: registeredBy
      });

      if (onSave) {
        onSave(response);
      }

      // onClose();

      toast.success("Customer registered successfully!");

      // Show OTP modal after successful registration
      setShowOTPModal(true);
      setResendDisabled(true);
      setResendTimer(30); // 30 seconds cooldown
    } catch (error) {
      console.error("Error registering customer:", error);
      toast.error(error.message || "Failed to register customer");
    }
  };

  // Dummy OTP submit handler
  const handleOTPSubmit = (otp) => {
      // Add OTP verification logic here
      setShowOTPModal(false);
      toast.success("OTP verified successfully!");
      onClose();
  };

  // Dummy resend OTP handler
  const handleResendOTP = () => {
      // Add resend OTP logic here
      setResendDisabled(true);
      setResendTimer(30); // 30 seconds cooldown
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-2xl mx-4 bg-[#cdebf3] shadow-2xl rounded-lg">
        <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-4">
          <h2 className="text-2xl font-bold text-slate-800">Customer Registration</h2>
          <Button
            variant="outline"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  First Name *
                </label>
                <Input
                  name="cus_fName"
                  value={formData.cus_fName}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Last Name *
                </label>
                <Input
                  name="cus_lName"
                  value={formData.cus_lName}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Middle Name *
                </label>
                <Input
                  name="cus_mName"
                  value={formData.cus_mName}
                  onChange={handleInputChange}
                  placeholder="Enter middle name"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Username *
                </label>
                <Input
                  name="cus_username"
                  value={formData.cus_username}
                  onChange={handleInputChange}
                  placeholder="Enter username"
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Email *
                </label>
                <Input
                  name="cus_eMail"
                  type="email"
                  value={formData.cus_eMail}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Phone Number *
                </label>
                <Input
                  name="cus_phoneNum"
                  type="tel"
                  value={formData.cus_phoneNum}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Address *
              </label>
              <Input
                name="cus_address"
                value={formData.cus_address}
                onChange={handleInputChange}
                placeholder="Enter address"
                required
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Password *
                </label>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Confirm Password *
                </label>
                <Input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm password"
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-slate-600 hover:bg-slate-700 px-6"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Customer
              </Button>
            </div>
          </form>
        </div>
      </div>

      <OTPModal
          open={showOTPModal}
          onClose={() => setShowOTPModal(false)}
          onSubmit={handleOTPSubmit}
          onResend={handleResendOTP}
          resendDisabled={resendDisabled}
          resendTimer={resendTimer}
      />
    </div>
  );
};

export default CustomerRegistration;
