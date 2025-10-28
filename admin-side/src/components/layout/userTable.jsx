import React, { use, useEffect, useState } from "react";
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
import { ArrowLeft, Search, Eye, Pencil, Save, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import UserDetailsModal from "./UserDetailsModal";
import UserEditModal from "./UserEditModal";
import { fetchApi } from "@/lib/api";
import { toast } from "react-hot-toast";

const UserTable = ({ embedded = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([
    // {
    //   id: 1,
    //   name: "John Doe",
    //   email: "john.doe@email.com",
    //   role: "admin",
    //   status: "active",
    //   dateRegistered: "9/11/2025",
    //   registerdby: "admin",
    // },
    // {
    //   id: 2,
    //   name: "Jane Smith",
    //   email: "jane.smith@email.com",
    //   role: "staff",
    //   status: "active",
    //   dateRegistered: "9/10/2025",
    //   registerdby: "admin",
    // },
    // {
    //   id: 3,
    //   name: "Mike Johnson",
    //   email: "mike.j@email.com",
    //   role: "Customer",
    //   status: "inactive",
    //   dateRegistered: "9/9/2025",
    //   registerdby: "admin",
    // },
    // {
    //   id: 4,
    //   name: "Sarah Wilson",
    //   email: "sarah.w@email.com",
    //   role: "staff",
    //   status: "active",
    //   dateRegistered: "9/8/2025",
    //   registerdby: "admin",
    // },
    // {
    //   id: 5,
    //   name: "Alex Brown",
    //   email: "alex.b@email.com",
    //   role: "Customer",
    //   status: "pending",
    //   dateRegistered: "9/7/2025",
    //   registerdby: "admin",
    // },
    // {
    //   id: 6,
    //   name: "James Brown",
    //   email: "James.b@email.com",
    //   role: "Customer",
    //   status: "pending",
    //   dateRegistered: "9/7/2025",
    //   registerdby: "admin",
    // },
  ]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetchApi('/api/auth/users');

        if (!response.success || !response.data) {
          throw new Error("Failed to fetch users");
        }

        const adminUsers = response.data.filter(user => user.registered_by === "Admin" || user.registered_by === "ADMIN" );
        const formattedUsers = adminUsers.map(user => {
          const parsedDate = user.date_registered ? new Date(user.date_registered) : null;
          const middleName = user.user_mName && user.user_mName !== "null" ? ` ${user.user_mName}` : "";
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
      }
    }
    fetchUsers();

    const interval = setInterval(fetchUsers, 5000); // fetch every 5 seconds
    return () => clearInterval(interval); // cleanup on unmount

  }, []);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    username: "",
    email: "",
    role: "",
    address: "",
    phoneNumber: "",
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      // Match the payload structure exactly as in Postman
      const response = await fetchApi(
        '/api/auth/register-user',
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_fName: formData.firstName,
            user_lName: formData.lastName,
            user_address: formData.address,
            username: `${formData.firstName}.${formData.lastName}`.toLowerCase(), // Add username
            contactNum: formData.phoneNumber,
            email: formData.email,
            role: formData.role,
            status: "active", // Add status field
            password: formData.password,
          }),
        }
      );

      
      
      if (response.success === true || response.success === "true" || response.message === "User registered successfully") {
        toast.success("User registered successfully");
        setFormData({
          firstName: "",
          lastName: "",
          middleName: "",
          username: "",
          email: "",
          role: "",
          address: "",
          phoneNumber: "",
          password: "",
          confirmPassword: "",
        });
        setIsDialogOpen(false);
        // Refresh user list
        const response = await fetchApi('/api/auth/users');

        if (response.success) {
          const adminUsers = response.data.filter(user => user.registered_by === "Admin" || user.registered_by === "ADMIN" );
          const formattedUsers = adminUsers.map(user => {
            const parsedDate = user.date_registered ? new Date(user.date_registered) : null;
            const middleName = user.user_mName && user.user_mName !== "null" ? ` ${user.user_mName}` : "";
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
        }
      } else {
        setError(response.message || "Failed to register user");
        toast.error(response.message || "Failed to register user");
      }
    } catch (error) {
      toast.error("Registration error: " + error.message);
      console.error("Registration error:", error);
      setError("Registration error.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-blue-500 hover:bg-blue-600";
      case "staff":
        return "bg-green-500 hover:bg-green-600";
      case "Customer":
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
      statusFilter === "all"
        ? true
        : (user.status || "").toLowerCase() === statusFilter;

    // Time range filter
    if (!statusOk) return false;
    const threshold = getTimeThreshold();
    if (threshold === null) return true;
    if (!user.registeredAt) return false;
    return user.registeredAt >= threshold;
  });

  return (
    <div
      className={embedded ? "" : "min-h-screen bg-cover bg-center"}
      style={embedded ? {} : { backgroundImage: "url('/laundry-logo.jpg')" }}
    >
      <div
        className={embedded ? "" : "bg-[#A4DCF4] bg-opacity-80 min-h-screen"}
      >
        {/* Top Bar */}
        {!embedded && (
          <div className="flex justify-between items-center px-4">
            <Link to="/dashboard">
              <ArrowLeft className="cursor-pointer text-[#126280] hover:text-[#126280]/80" />
            </Link>
          </div>
        )}

        {/* Search and Filters Section */}

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-4 py-4">
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
              <SelectTrigger className="w-full md:w-[180px]">
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
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="default"
              className="bg-[#126280] hover:bg-[#126280]/80"
              onClick={() => setIsDialogOpen(true)}
            >
              Add New User
            </Button>
            {isDialogOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="w-full max-w-2xl mx-4 bg-[#cdebf3] shadow-2xl rounded-lg">
                  <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-4">
                    <h2 className="text-2xl font-bold text-slate-800">
                      User Registration
                    </h2>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsDialogOpen(false)}
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-700 mb-2 block">
                            Password *
                          </label>
                          <Input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
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
                            onChange={handleChange}
                            placeholder="Confirm password"
                            required
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                          Role *
                        </label>
                        <Select
                          name="role"
                          value={formData.role}
                          onValueChange={handleRoleChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Customer">Customer</SelectItem>
                            <SelectItem value="Staff">Staff</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                          className="px-6"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-slate-600 hover:bg-slate-700 px-6"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save User
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        

        {/* Table Section */}
        <div className={embedded ? "p-0" : "px-4 pb-6"}>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-lg">
            <Table className="[&_tbody_tr:hover]:bg-white">
              <TableHeader>
                <TableRow className="bg-[#126280] hover:bg-[#126280]">
                  <TableHead className="text-white font-semibold">
                    Name
                  </TableHead>
                  <TableHead className="text-white font-semibold">
                    Email
                  </TableHead>
                  <TableHead className="text-white font-semibold">
                    Role
                  </TableHead>
                  <TableHead className="text-white font-semibold">
                    Status
                  </TableHead>
                  <TableHead className="text-white font-semibold">
                    Date Registered
                  </TableHead>
                  <TableHead className="text-white font-semibold">
                    Registered By
                  </TableHead>
                  <TableHead className="text-white font-semibold text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-red-500">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="bg-white">
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          className={`${getRoleBadgeColor(
                            user.role
                          )} text-white`}
                        >
                          {user.role.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getStatusBadgeColor(
                            user.status
                          )} text-white`}
                        >
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
                            onClick={() => navigate(`/dashboard/users/${user.id}`, { state: { user } })}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-[#126280] hover:text-[#126280]/80"
                            aria-label="Edit user"
                            title="Edit"
                            onClick={() => console.log('Edit user', user.id)}
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
                    <h3 className="font-semibold text-[#126280]">
                      {user.name}
                    </h3>
                    <Badge
                      className={`${getRoleBadgeColor(user.role)} text-white`}
                    >
                      {user.role.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm space-y-2">
                    <p>
                      <span className="font-medium">Email:</span> {user.email}
                    </p>
                    <p>
                      <span className="font-medium">Date Registered:</span>{" "}
                      {user.dateRegistered}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Badge
                      className={`${getStatusBadgeColor(
                        user.status
                      )} text-white`}
                    >
                      {user.status.toUpperCase()}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-[#126280] hover:text-[#126280]/80"
                        aria-label="View user"
                        title="View"
                        onClick={() =>
                          navigate(`/dashboard/users/${user.id}`, {
                            state: { user },
                          })
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-[#126280] hover:text-[#126280]/80"
                        aria-label="Edit user"
                        title="Edit"
                        onClick={() => console.log("Edit user", user.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Details Modal */}
        {isDetailsModalOpen && selectedUser && (
          <UserDetailsModal
            user={selectedUser}
            onClose={() => {
              setIsDetailsModalOpen(false);
              setSelectedUser(null);
            }}
          />
        )}

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

export default UserTable;
