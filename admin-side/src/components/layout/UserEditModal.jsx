import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save } from "lucide-react";
import { toast } from 'sonner';
import { fetchApi } from "@/lib/api";

const UserEditModal = ({ user, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    role: "",
    status: "",
    address: "",
    phoneNumber: "",
  });

  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !user.id) return;
      
      try {
        setIsLoading(true);
        // Fetch all users and find the specific user by ID
        const response = await fetchApi('/api/auth/users');

        if (response.success === false) {
          throw new Error("Failed to fetch user data");
        }

        const userData = response.data.find(u => u.user_id === user.id);

        if (!userData) {
          throw new Error("User not found");
        }

        // Format role: all uppercase (CUSTOMER, STAFF)
        const formattedRole = userData.role?.toUpperCase() || "";
        
        // Format status: first letter uppercase, rest lowercase (Active, Inactive, Pending)
        const formattedStatus = userData.status 
          ? userData.status.charAt(0).toUpperCase() + userData.status.slice(1).toLowerCase()
          : "";

        const updatedFormData = {
          firstName: userData.user_fName || "",
          lastName: userData.user_lName || "",
          middleName: userData.user_mName && userData.user_mName !== "null" ? userData.user_mName : "",
          username: userData.username || "",
          email: userData.email || "",
          role: formattedRole,
          status: formattedStatus,
          address: userData.user_address || "",
          phoneNumber: userData.contactNum || "",
        };

        setFormData(updatedFormData);
        setSelectedRole(formattedRole);
        setSelectedStatus(formattedStatus);

        console.log('Fetched user data:', updatedFormData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
        // Fallback to user prop data if API fails
        const nameParts = user.name?.split(", ") || [];
        const lastName = nameParts[0] || "";
        const firstAndMiddle = nameParts[1] || "";
        const nameParts2 = firstAndMiddle.split(" ");
        const firstName = nameParts2[0] || "";
        const middleName = nameParts2.length > 1 ? nameParts2.slice(1).join(" ") : (user.middleName || "");

        const formattedRole = user.role?.toUpperCase() || "";
        const formattedStatus = user.status 
          ? user.status.charAt(0).toUpperCase() + user.status.slice(1).toLowerCase()
          : "";

        const fallbackFormData = {
          firstName,
          lastName,
          middleName,
          username: user.username || "",
          email: user.email || "",
          role: formattedRole,
          status: formattedStatus,
          address: user.address || "",
          phoneNumber: user.phoneNumber || user.contact || "",
        };

        setFormData(fallbackFormData);
        setSelectedRole(formattedRole);
        setSelectedStatus(formattedStatus);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const updatePayload = {
        cus_fName: formData.firstName,
        cus_lName: formData.lastName,
        cus_eMail: formData.email,
        cus_role: formData.role || user.role?.toUpperCase(), 
        cus_status: formData.status || user.status?.toUpperCase(), 
        cus_phoneNum: formData.phoneNumber,
        cus_address: formData.address,
        cus_username: formData.username
      };

      console.log('Sending update payload:', updatePayload);

      const response = await fetchApi(`/api/auth/edit-user/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload)
      });

      if (response.success === false) {
        throw new Error(response.message || 'Failed to update customer');
      }

      const updatedUser = {
        id: user.id,
        name: `${formData.lastName}, ${formData.firstName}`,
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        role: formData.role || user.role?.toUpperCase(), 
        status: formData.status || user.status?.toUpperCase(),
        dateRegistered: user.dateRegistered,
        registerdby: user.registerdby,
        registeredAt: user.registeredAt
      };

      onUpdate(updatedUser);
      toast.success('Customer updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error(error.message || 'Failed to update customer');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-2xl mx-4 bg-[#cdebf3] shadow-2xl rounded-lg">
        <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
          <h2 className="text-2xl font-bold text-slate-800">Edit User</h2>
          <Button
            variant="outline"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 pt-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  First Name *
                </label>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
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
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  required
                  className="w-full"
                />
              </div>
            </div>

            {/* Username field */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Username *
              </label>
              <Input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                required
                className="w-full"
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Email *
                </label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                  className="w-full"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Address *
              </label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
                required
                className="w-full"
              />
            </div>

            {/* Role and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Role *
                </label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, role: value }));
                    setSelectedRole(value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role">
                      {formData.role || "Select role"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STAFF">STAFF</SelectItem>
                    <SelectItem value="CUSTOMER">CUSTOMER</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Status *
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, status: value }));
                    setSelectedStatus(value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status">
                      {formData.status}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                    <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
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
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserEditModal;