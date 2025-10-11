import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const UserDetailsModal = ({ user, onClose }) => {
  const getRoleBadgeColor = (role) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-blue-500 hover:bg-blue-600";
      case "staff":
        return "bg-green-500 hover:bg-green-600";
      case "user":
        return "bg-purple-500 hover:bg-purple-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-emerald-500 hover:bg-emerald-600";
      case "inactive":
        return "bg-red-500 hover:bg-red-600";
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-2xl mx-4 bg-[#cdebf3] shadow-2xl rounded-lg">
        <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
          <h2 className="text-2xl font-bold text-slate-800">User Details</h2>
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
          <div className="space-y-6">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">Full Name</p>
                  <p className="text-slate-800">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Username</p>
                  <p className="text-slate-800">{user.username || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Email</p>
                  <p className="text-slate-800">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Phone Number</p>
                  <p className="text-slate-800">{user.phoneNumber || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-slate-600">Address</p>
                  <p className="text-slate-800">{user.address || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Account Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Account Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">Role</p>
                  <Badge className={`${getRoleBadgeColor(user.role)} text-white mt-1`}>
                    {user.role.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Status</p>
                  <Badge className={`${getStatusBadgeColor(user.status)} text-white mt-1`}>
                    {user.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Registration Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Registration Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">Date Registered</p>
                  <p className="text-slate-800">{user.dateRegistered}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Registered By</p>
                  <p className="text-slate-800">{user.registerdby}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;