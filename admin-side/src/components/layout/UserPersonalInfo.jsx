
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, CalendarDays, UserCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const UserPersonalInfo = ({ user }) => {
  if (!user) return null;

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center space-x-4 py-2">
      <Icon className="h-5 w-5 text-slate-500" />
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-base font-medium">{value}</p>
      </div>
    </div>
  );

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-blue-500 hover:bg-blue-600";
      case "staff":
        return "bg-green-500 hover:bg-green-600";
      case "customer":
        return "bg-purple-500 hover:bg-purple-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
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
    <Card className="p-6 bg-white shadow-md">
      <div className="space-y-6">
          {/* User Profile Header */}
          <div className="flex flex-col items-center space-y-4">
            <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center">
              <UserCircle2 className="h-16 w-16 text-slate-400" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <Badge className={`${getRoleBadgeColor(user.role)} text-white`}>
                  {user.role?.toUpperCase()}
                </Badge>
                <Badge className={`${getStatusBadgeColor(user.status)} text-white`}>
                  {user.status?.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-4">
              Contact Information
            </h4>
            <Card className="p-4 space-y-2">
              <InfoRow icon={Mail} label="Email" value={user.email} />
              <InfoRow icon={Phone} label="Phone" value={user.phoneNumber} />
              <InfoRow icon={MapPin} label="Address" value={user.address} />
            </Card>
          </div>

          {/* Account Information */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-4">
              Account Information
            </h4>
            <Card className="p-4 space-y-2">
              <InfoRow
                icon={UserCircle2}
                label="Username"
                value={user.username}
              />
              <InfoRow
                icon={CalendarDays}
                label="Registered Date"
                value={user.dateRegistered}
              />
              <InfoRow
                icon={UserCircle2}
                label="Registered By"
                value={user.registerdby}
              />
            </Card>
          </div>
        </div>
    </Card>
  );
};

export default UserPersonalInfo;