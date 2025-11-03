import React, { useContext, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Search, Eye, Pencil } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import UserEditModal from "./UserEditModal";
import UserPersonalInfo from "./UserPersonalInfo";
import { fetchApi } from "@/lib/api";
import { AuthContext } from "@/context/AuthContext";

const Custb = ({ embedded = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const { adminData } = useContext(AuthContext);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetchApi('/api/auth/users');

        if (!response.success) {
          throw new Error("Failed to fetch users");
        }

        console.log("API response:", response);
        
        const adminUsers = response.data.filter(user => user.registered_by === "Customer" && user.shop_id === adminData.shop_id);
        const formattedUsers = adminUsers.map(user => {
          const parsedDate = user.date_registered ? new Date(user.date_registered) : null;
          const middleName = user.user_mName && user.user_mName !== "null" ? ` ${user.user_mName}` : "";
          console.log(adminUsers)
          return {
            id: user.user_id,
            name: `${user.user_lName}, ${user.user_fName}${middleName}`,
            email: user.email,
            contact: user.contactNum,
            role: user.role,
            status: user.status,
            dateRegistered: parsedDate && !isNaN(parsedDate) ? parsedDate.toLocaleDateString() : '-',
            registeredAt: parsedDate && !isNaN(parsedDate) ? parsedDate.getTime() : null,
            registerdby: user.registered_by,
            firstName: user.user_fName,
            lastName: user.user_lName,
            middleName: user.user_mName,
            phoneNumber: user.contactNum,
            address: user.user_address,
            username: user.username
          };
        });
        setUsers(formattedUsers);
      } catch (error) {
        console.error('Fetch error:', error);
        setError(error.message);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();

    // Set up polling every 30 seconds
    const interval = setInterval(fetchUsers, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const nextId = users.length
      ? Math.max(...users.map((user) => user.id)) + 1
      : 1;

    const newUser = {
      id: nextId,
      name: formData.name,
      email: formData.email,
      role: formData.role || "Customer",
      status: "active",
    };

    setUsers((prev) => [...prev, newUser]);

    setFormData({
      name: "",
      email: "",
      role: "",
      password: "",
      confirmPassword: "",
    });
    setIsDialogOpen(false);
  };

  const getRoleBadgeColor = (role) => {
    switch (role.toLowerCase()) {
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
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "bg-emerald-500 hover:bg-emerald-600";
      case "INACTIVE":
        return "bg-red-500 hover:bg-red-600";
      case "PENDING":
        return "bg-yellow-500 hover:bg-yellow-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  // Filters
  const [timeRange, setTimeRange] = useState("all"); // all | weekly | monthly | yearly
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive

  const getTimeThreshold = () => {
    const now = Date.now();
    switch (timeRange) {
      case "weekly":
        return now - 7 * 24 * 60 * 60 * 1000;
      case "monthly":
        return now - 30 * 24 * 60 * 60 * 1000;
      case "yearly":
        return now - 365 * 24 * 60 * 60 * 1000;
      default:
        return null;
    }
  };

  const filteredUsers = users.filter((user) => {
    // Status filter
    const statusOk =
      statusFilter === "all" ? true : (user.status || "").toLowerCase() === statusFilter.toLowerCase();
    // Time range filter
    if (!statusOk) return false;
    const threshold = getTimeThreshold();
    if (threshold === null) return true;
    if (!user.registeredAt) return false;
    return user.registeredAt >= threshold;
  });

  return (
    <div className={embedded ? "w-full h-full" : "min-h-screen bg-cover bg-center"} style={embedded ? {} : { backgroundImage: "url('/laundry-logo.jpg')" }}>
      <div className={embedded ? "bg-white w-full h-full rounded-lg shadow-sm" : "bg-[#A4DCF4] bg-opacity-80 min-h-screen"}>
        {/* Top Bar */}
        {!embedded && (
          <div className="flex justify-between items-center px-4">
            {showUserInfo ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="p-0"
                  onClick={() => {
                    setShowUserInfo(false);
                    setSelectedUser(null);
                  }}
                >
                  <ArrowLeft className="cursor-pointer text-[#126280] hover:text-[#126280]/80" />
                </Button>
                <span className="text-[#126280] font-semibold">Back to Customer List</span>
              </div>
            ) : (
              <Link to="/dashboard">
                <ArrowLeft className="cursor-pointer text-[#126280] hover:text-[#126280]/80" />
              </Link>
            )}
          </div>
        )}

        {/* Search and Filters Section - Hidden when viewing user info */}
        {!showUserInfo && (
          <div className={`flex flex-col md:flex-row justify-between items-center gap-4 ${embedded ? 'p-2' : 'px-4 py-4'}`}>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-[300px]">
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  className="pl-8"
                />
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="weekly">This week</SelectItem>
                  <SelectItem value="monthly">This month</SelectItem>
                  <SelectItem value="yearly">This year</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {!embedded && (
                <Button
                  variant="default"
                  className="bg-[#126280] hover:bg-[#126280]/80"
                  onClick={() => navigate('/dashboard/register')}
                >
                  Add New User
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className={embedded ? "p-0" : "px-4 pb-6"}>
          {showUserInfo && selectedUser ? (
            <div className="bg-white rounded-lg shadow-sm">
              <UserPersonalInfo
                user={selectedUser}
                onClose={() => {
                  setShowUserInfo(false);
                  setSelectedUser(null);
                }}
              />
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto rounded-lg">
                <Table className="[&_tbody_tr:hover]:bg-white">
                  <TableHeader>
                    <TableRow className="bg-[#126280] hover:bg-[#126280]">
                      <TableHead className="text-white font-semibold">Name</TableHead>
                      <TableHead className="text-white font-semibold">Email</TableHead>
                      <TableHead className="text-white font-semibold">Role</TableHead>
                      <TableHead className="text-white font-semibold">Status</TableHead>
                      <TableHead className="text-white font-semibold">Date Registered</TableHead>
                      <TableHead className="text-white font-semibold">Registered By</TableHead>
                      <TableHead className="text-white font-semibold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">Loading...</TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-red-500">{error}</TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">No users found</TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id} className="bg-white">
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge className={`${getRoleBadgeColor(user.role)} text-white`}>
                              {user.role.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusBadgeColor(user.status)} text-white`}>
                              {user.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.dateRegistered}</TableCell>
                          <TableCell>{user.registerdby}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 justify-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-[#126280] hover:text-[#126280]/80"
                                aria-label="View user"
                                title="View"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowUserInfo(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-[#126280] hover:text-[#126280]/80"
                                aria-label="Edit user"
                                title="Edit"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsEditModalOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {isLoading ? (
                  <div className="text-center p-4">Loading...</div>
                ) : error ? (
                  <div className="text-center text-red-500 p-4">{error}</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center p-4">No users found</div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="bg-white rounded-lg p-4 shadow-md space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-[#126280]">{user.name}</h3>
                        <Badge className={`${getRoleBadgeColor(user.role)} text-white`}>
                          {user.role.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm space-y-2">
                        <p><span className="font-medium">Email:</span> {user.email}</p>
                        <p><span className="font-medium">Date Registered:</span> {user.dateRegistered}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <Badge className={`${getStatusBadgeColor(user.status)} text-white`}>
                          {user.status.toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-[#126280] hover:text-[#126280]/80"
                            aria-label="View user"
                            title="View"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserInfo(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-[#126280] hover:text-[#126280]/80"
                            aria-label="Edit user"
                            title="Edit"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* User Edit Modal */}
        {isEditModalOpen && selectedUser && (
          <UserEditModal
            user={selectedUser}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedUser(null);
            }}
            onUpdate={(updatedUser) => {
              setUsers(users.map((u) => 
                u.id === updatedUser.id ? updatedUser : u
              ));
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Custb;