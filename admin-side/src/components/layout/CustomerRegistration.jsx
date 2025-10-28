import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, X } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { toast } from 'react-hot-toast';

const CustomerRegistration = ({ onClose, onSave, registeredBy }) => {
  const [formData, setFormData] = useState({
    cus_fName: "",
    cus_lName: "",
    cus_eMail: "",
    cus_role: "CUSTOMER",
    cus_phoneNum: "",
    cus_address: "",
    cus_username: "",
    password: "",
    confirmPassword: "",
    registeredBy: registeredBy 
  });

  // Add useEffect to update registeredBy when prop changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      registeredBy: registeredBy
    }));
  }, [registeredBy]);

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
      const postData = await fetch(
        'http://localhost:3000/api/auth/register-user',
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await postData.json();

      if (!postData.ok) {
        throw new Error(result.message || "Failed to register customer");
      }

      setFormData({
        cus_fName: "",
        cus_lName: "",
        cus_eMail: "",
        cus_phoneNum: "",
        cus_address: "",
        cus_username: "",
        password: "",
        confirmPassword: "",
        registeredBy: ""
      });

      if (onSave) {
        onSave(result);
      }

      onClose();
      
      toast.success("Customer registered successfully!");
    } catch (error) {
      console.error("Error registering customer:", error);
      toast.error(error.message || "Failed to register customer");
    }
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   if (onSave) {
  //     onSave(formData);
  //   }
  //   console.log('Customer data:', formData);
  //   // Here you would typically send the data to your backend
  // };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 bg-[#cdebf3] shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold text-slate-800">
            Customer Registration
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
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
                  Phone *
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
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerRegistration;
