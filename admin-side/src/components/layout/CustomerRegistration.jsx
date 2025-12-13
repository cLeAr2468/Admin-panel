import React, { useState, useEffect, useContext } from "react";
import { ArrowLeft, Save, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from 'sonner';
import { Card, CardContent } from "@/components/ui/card";
import { fetchApi } from "@/lib/api";
import { AuthContext } from "@/context/AuthContext";
import { formatPHNumber } from "@/lib/phoneFormatter";
import OTPModal from "@/components/modals/OTPModal";

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

  const [showOTPModal, setShowOTPModal] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [sendingOTP, setSendingOTP] = useState(false);

useEffect(() => {
  let interval;

  if (resendDisabled && resendTimer > 0) {
    interval = setInterval(() => {
      setResendTimer(prev => prev - 1);
    }, 1000);
  } else if (resendDisabled && resendTimer === 0) {
    setResendDisabled(false); // enable button when timer reaches 0
  }

  return () => clearInterval(interval);
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

    const formattedNumber = formatPHNumber(formData.cus_phoneNum);
    if (!formattedNumber) {
      toast.error("Invalid Philippine phone number!");
      return;
    }

    try {
      setSendingOTP(true);
      const response = await fetchApi("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.cus_eMail })
      });

      if (!response.success) throw new Error(response.message || "Something went wrong");

      setShowOTPModal(true);
      setResendDisabled(true);
      setResendTimer(30); // 3 mins

    } catch (err) {
      console.error("API error:", err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setSendingOTP(false);
    }
  };


  const handleOTPSubmit = async (otp) => {
    try {
      const verify = await fetchApi("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.cus_eMail, otp })
      });

      if (!verify.success) {
        toast.error("Invalid OTP");
        return;
      }
      const formattedNumber = formatPHNumber(formData.cus_phoneNum);

      const register = await fetchApi("/api/auth/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop_id: adminData.shop_id,
          user_fName: formData.cus_fName,
          user_lName: formData.cus_lName,
          user_mName: formData.cus_mName,
          user_address: formData.cus_address,
          username: formData.cus_username,
          contactNum: formattedNumber,
          email: formData.cus_eMail,
          role: formData.cus_role,
          status: "ACTIVE",
          password: formData.password,
          registered_by: "CUSTOMER"
        })
      });

      if (!register.success) {
        toast.error(register.message || "Failed to register customer");
        return;
      }

      toast.success(register.message || "Customer registered successfully!");
      setShowOTPModal(false);
      onSave?.("SUCCESS");
      onClose();

    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong");
    }
  };


  const handleResendOTP = async () => {
    try {
      setResendDisabled(true);
      setResendTimer(30);
      toast("Resending OTP...");

      const response = await fetchApi("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.cus_eMail })
      });

      if (!response.success) throw new Error(response.message || "Failed to resend OTP");

      toast.success("OTP resent successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to resend OTP");
      setResendDisabled(false);
    }
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
                disabled={sendingOTP}
              >
                {sendingOTP ? "Sending OTP..." : <><Save className="h-4 w-4 mr-2" />Save Customer</>}
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
