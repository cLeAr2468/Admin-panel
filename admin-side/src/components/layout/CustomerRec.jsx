import React, { useState, useEffect, useContext } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";

export default function CustomerRec() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const { adminData } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);

  const parseDateTime = (isoString) => {
    if (!isoString) {
      return {
        rawDate: 'N/A',
        rawTime: 'N/A',
        localDateTime: 'N/A',
        localTime: 'N/A'
      };
    }

    const parts = isoString.split('T');
    const datePart = parts[0];
    const timePart = parts[1] ? parts[1].split('.')[0] : '00:00:00';
    const dateObject = new Date(isoString);

    const localTimeFormatted = dateObject.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const localDateTimeFormatted = dateObject.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return {
      rawDate: datePart,
      rawTime: timePart,
      localTime: localTimeFormatted,
      localDateTime: localDateTimeFormatted
    };
  };

  const loadCustomerRec = async () => {
    if (!adminData?.shop_id) return;
    try {
      setIsLoading(true);
      const response = await fetchApi(`/api/auth/get-customer-records/${adminData.shop_id}`);
      if (!response || response === false) {
        throw new Error(response?.message || "Failed to fetch customer records");
      }

      const cusRecord = (response.data || []).map((i) => {
        const parsedDates = parseDateTime(i.created_at);
        return {
          name: i.cus_name,
          address: i.cus_address,
          visit: i.batch,
          items: i.num_items,
          status: i.status,
          date: parsedDates.rawDate,
          time: parsedDates.localTime,
        }
      });
      setData(cusRecord);
    } catch (error) {
      setData([]);
      console.error("CustomerRec - loadCustomerRec error:", error);
      toast.error(error?.message || "Unable to load customer records");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerRec();
  }, [adminData]);


  useEffect(() => {
    let filtered = data;
    // Apply status filter first
    if (statusFilter !== "All") {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Then apply search filter
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        Object.values(item).some((value) =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredData(filtered);
  }, [data, searchTerm, statusFilter]);

  const handleStatusChange = (index, newStatus) => {
    const newData = [...data];
    newData[index].status = newStatus;
    setData(newData);
  };

  const handleSendSMS = (customer) => {
    // TODO: Implement SMS sending functionality
    alert(`SMS sent to ${customer.name}`);
  };

  const handleUpdate = (customer) => {
    // TODO: Implement update functionality
    alert(`Updating record for ${customer.name}`);
  };

  return (
    <div className="p-6 bg-sky-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#126280] mb-4">Customer Records</h2>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-600 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search by name, ID, or status..."
                className="w-[350px] pl-10 pr-4 py-2 rounded-full border-sky-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <p className="text-sky-700 font-medium bg-sky-50 px-4 py-2 rounded-lg border border-sky-200">
            Date: <span className="font-semibold">September 16, 2025</span>
          </p>
        </div>
      </div>

      {/* Table */}
      <Table className="border">
        <TableHeader>
          <TableRow className="bg-sky-200">
            <TableHead className="border font-semibold text-sky-900">NAME</TableHead>
            <TableHead className="border font-semibold text-sky-900">ADDRESS</TableHead>
            <TableHead className="border font-semibold text-sky-900 text-center">VISITS</TableHead>
            <TableHead className="border font-semibold text-sky-900 text-center">ITEMS</TableHead>
            <TableHead className="border font-semibold text-sky-900">
              <div className="flex items-center justify-between">
                <span>STATUS</span>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="h-8 w-8 p-0 bg-transparent items-center justify-center">
                  </SelectTrigger>
                  <SelectContent side="bottom" align="end">
                    <SelectItem value="All" className="font-medium">
                      All Status
                    </SelectItem>
                    <SelectItem value="On Service" className="text-sky-700">
                      On Service
                    </SelectItem>
                    <SelectItem value="Ready to pick up" className="text-yellow-700">
                      Ready to pick up
                    </SelectItem>
                    <SelectItem value="Laundry Done" className="text-green-700">
                      Laundry Done
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TableHead>
            <TableHead className="border font-semibold text-sky-900">DATE/TIME</TableHead>
            <TableHead className="border font-semibold text-sky-900 text-center">SEND SMS</TableHead>
            <TableHead className="border font-semibold text-sky-900 text-center">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">Loading...</TableCell>
            </TableRow>
          ) : (
            filteredData.map((row, index) => (
              <TableRow
                key={index}
                className="bg-white"
              >
                <TableCell className="border font-medium">{row.name}</TableCell>
                <TableCell className="border">{row.address}</TableCell>
                <TableCell className="border text-center">{row.visit}</TableCell>
                <TableCell className="border text-center">{row.items}</TableCell>
                <TableCell className="border">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${row.status === 'Laundry Done' ? 'bg-green-100 text-green-700' :
                    row.status === 'Ready to pick up' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-sky-100 text-sky-700'
                    }`}>
                    {row.status}
                  </span>
                </TableCell>
                <TableCell className="border">
                  <div className="text-sm">
                    <div className="font-medium">{row.date}</div>
                    <div className="text-sky-600">{row.time}</div>
                  </div>
                </TableCell>
                <TableCell className="border text-center">
                  <Button
                    variant="secondary"
                    className="bg-sky-300 hover:bg-sky-400 text-sky-900 font-medium"
                    onClick={() => handleSendSMS(row)}
                  >
                    SEND
                  </Button>
                </TableCell>
                <TableCell className="border text-center">
                  <Button
                    variant="outline"
                    className="bg-orange-300 hover:bg-orange-400 text-orange-900 font-medium"
                    onClick={() => handleUpdate(row)}
                  >
                    UPDATE
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
