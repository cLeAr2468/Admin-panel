import React, { useState, useEffect, useCallback, useContext } from "react";
import { X, Search, Calculator, Printer, ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import image from "../../../public/laundry-logo.jpg";
import debounce from "lodash/debounce";
import { format } from "date-fns";
import { toast } from 'sonner';
import { fetchApi } from "@/lib/api";
import { AuthContext } from "@/context/AuthContext";

const CustomerReceipt = ({ onClose }) => {
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [laundryId, setLaundryId] = useState(null);
  const [formData, setFormData] = useState({
    cus_id: '',
    name: '',
    cus_phoneNum: '',
    cus_address: '',
    batch: '',
    laundryId: '',
    shirts: '',
    pants: '',
    jeans: '',
    shorts: '',
    towel: '',
    pillowCase: '',
    bedSheets: '',
    kl: '',
    washing: true,
    totalAmount: "0.00",
    itemCount: "0",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { adminData } = useContext(AuthContext);

  const fetchCustomerData = async (user_id) => {
    try {
      if (!user_id?.trim()) return null;
      if (!adminData?.shop_id) throw new Error("Missing shop_id");

      const response = await fetchApi(`/api/auth/users/search/${adminData.shop_id}/${user_id}`);

      if (!response.success) {
        toast.error(response.message || 'Customer not found');
        return null;
      }

      const customerData = Array.isArray(response.data) ? response.data[0] : response.data;
      console.log(response.data)
      if (!customerData?.user_fName || !customerData?.user_lName) {
        toast.error('Invalid customer data received');
        return null;
      }

      return customerData;
    } catch (error) {
      console.error('Error fetching customer:', error);
      toast.error('Customer not found!');
      return null;
    }
  };


  const handleInputChange = async (e) => {
    const { name, value, type, checked } = e.target;

    // Update the form immediately for better UX
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Handle the cus_id field specially
    if (name === 'cus_id' && value.trim() === '') {
      setFormData(prev => ({
        ...prev,
        name: '',
        cus_phoneNum: '',
        cus_address: ''
      }));
      return;
    }

    // Original handling for other fields
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else if (type === "number") {
      // Prevent negative numbers
      const numValue = parseFloat(value);
      if (numValue < 0) {
        return; // Don't update if negative
      }
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleEnterKey = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const user_id = formData.cus_id.trim();
      if (user_id) {
        const customerData = await fetchCustomerData(user_id);
        if (customerData) {
          setFormData(prev => ({
            ...prev,
            name: `${customerData.user_fName} ${customerData.user_lName}`,
            cus_phoneNum: customerData.contactNum || '',
            cus_address: customerData.user_address || ''
          }));
          toast.success('Customer data loaded');
        } else {
          setFormData(prev => ({
            ...prev,
            name: '',
            cus_phoneNum: '',
            cus_address: ''
          }));
        }
      }
    }
  };


  const calculateTotal = () => {
    const items = [
      "shirts",
      "pants",
      "jeans",
      "shorts",
      "towel",
      "pillowCase",
      "bedSheets",
    ];

    let total = 0;
    let count = 0;

    items.forEach((item) => {
      const quantity = parseInt(formData[item]) || 0;
      const price = getItemPrice(item);
      total += quantity * price;
      count += quantity;
    });

    setFormData((prev) => ({
      ...prev,
      totalAmount: total.toFixed(2),
      itemCount: count.toString(),
    }));
  };

  const getItemPrice = (item) => {
    const prices = {
      shirts: 15.0,
      pants: 20.0,
      jeans: 25.0,
      shorts: 18.0,
      towel: 12.0,
      pillowCase: 10.0,
      bedSheets: 30.0,
    };
    return prices[item] || 0;
  };

  const handlePrint = () => {
    setShowPrintPreview(true);
    setTimeout(() => {
      window.print();
      setShowPrintPreview(false);
    }, 100);
  };

  const submitLaundryRecord = async () => {
    try {
      // Prepare the payload from formData
      const payload = {
        shop_id: adminData.shop_id,
        userId: formData.cus_id,
        batch: formData.batch,
        shirts: parseInt(formData.shirts) || 0,
        pants: parseInt(formData.pants) || 0,
        jeans: parseInt(formData.jeans) || 0,
        shorts: parseInt(formData.shorts) || 0,
        towels: parseInt(formData.towel) || 0,
        pillow_case: parseInt(formData.pillowCase) || 0,
        bed_sheets: parseInt(formData.bedSheets) || 0,
        washing: formData.washing,
        kg: formData.kl,
        num_items: parseInt(formData.itemCount) || 0,
        total_amount: parseFloat(formData.totalAmount) || 0
      };

      const response = await fetchApi('/api/customers/laundry-record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.success === false) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (response.success) {
        toast.success('Laundry record saved successfully!');
        // Clear form or close modal after successful submission
        onClose();
        setLaundryId(response.laundryId);
      } else {
        toast.error(response.message || 'Failed to save laundry record');
      }

    } catch (error) {
      console.error('Error submitting laundry record:', error);
      toast.error('' + error);
    }
  };

  // Update the handleSubmit function to use submitLaundryRecord
  const handleSubmit = async () => {
    // Calculate totals first
    calculateTotal();

    // Submit the record
    await submitLaundryRecord();
  };

  const fetchCustomers = async () => {
    try {
      if (!adminData?.shop_id) {
        console.warn("No sho_id found in adminData");
        return;
      }
      setIsLoading(true);
      setError(null);
      const response = await fetchApi(`/api/auth/users/search/${adminData.shop_id}`);

      if (response.success === false) {
        throw new Error("Failed to fetch customers");
      }

      if (response.success && Array.isArray(response.data)) {
        setCustomers(response.data);
        setFilteredCustomers(response.data);
      } else {
        throw new Error("Invalid data format");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching customers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = useCallback(
    debounce((query) => {
      if (!query.trim()) {
        setFilteredCustomers(customers);
        return;
      }

      const searchTerm = query.toLowerCase();
      const filtered = customers.filter(
        (customer) =>
          customer.user_id.toLowerCase().includes(searchTerm) ||
          customer.user_fName.toLowerCase().includes(searchTerm) ||
          customer.user_lName.toLowerCase().includes(searchTerm)
      );
      setFilteredCustomers(filtered);
    }, 300),
    [customers]
  );

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCustomerSelect = (customer) => {
    setFormData((prev) => ({
      ...prev,
      cus_id: customer.user_id,
      name: `${customer.user_fName} ${customer.user_lName}`,
      cus_phoneNum: customer.contactNum,
      cus_address: customer.user_address,
    }));

    setSearchQuery("");
    setFilteredCustomers([]);
  };

  const today = new Date();
  const formattedDate = format(today, "MMMM dd, yyyy");

  if (showPrintPreview) {
    return (
      <div className="fixed inset-0 bg-white z-50 p-8 print:p-0">
        <div className="text-center mb-8 print:mb-4 gap-20">
          <div className="relative mb-4">
            {/* Left-aligned image */}
            <div className="absolute ml-20">
              <img
                src={image}
                alt="Laundry Shop"
                className="rounded-full shadow-lg w-20 h-20 object-cover"
              />
            </div>

            {/* Centered text */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-blue-800">
                WASH WISE LAUNDRY SHOP
              </h1>
              <p className="text-gray-600">Professional Laundry Services</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-blue-800 mb-2">
            CUSTOMER RECEIPT
          </h2>
          <p className="text-lg text-gray-700">
            Date: {formattedDate}
          </p>
        </div>

        {/* Receipt Content */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  CUS_ID:
                </label>
                <div className="border-b-2 border-gray-300 pb-1">
                  {formData.cus_id}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Name:
                </label>
                <div className="border-b-2 border-gray-300 pb-1">
                  {formData.name}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Phone number:
                </label>
                <div className="border-b-2 border-gray-300 pb-1">
                  {formData.cus_phoneNum}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  BATCH:
                </label>
                <div className="border-b-2 border-gray-300 pb-1">
                  {formData.batch}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  KL:
                </label>
                <div className="border-b-2 border-gray-300 pb-1">
                  {formData.kl}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  TOTAL AMOUNT:
                </label>
                <div className="border-b-2 border-gray-300 pb-1">
                  ₱{formData.totalAmount}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  #ITEMS:
                </label>
                <div className="border-b-2 border-gray-300 pb-1">
                  {formData.itemCount}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  LAUNDRY ID:
                </label>
                {laundryId && (<div className="border-b-2 border-gray-300 pb-1">{laundryId}</div>)}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  SHIRTS:
                </label>
                <div className="border-b-2 border-gray-300 pb-1">
                  {formData.shirts}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  PANTS:
                </label>
                <div className="border-b-2 border-gray-300 pb-1">
                  {formData.pants}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  JEANS:
                </label>
                <div className="border-b-2 border-gray-300 pb-1">
                  {formData.jeans}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  SHORTS:
                </label>
                <div className="border-b-2 border-gray-300 pb-1">
                  {formData.shorts}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  TOWEL:
                </label>
                <div className="border-b-2 border-gray-300 pb-1">
                  {formData.towel}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  PILLOW CASE:
                </label>
                <div className="border-b-2 border-gray-300 pb-1">
                  {formData.pillowCase}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  BED SHEETS:
                </label>
                <div className="border-b-2 border-gray-300 pb-1">
                  {formData.bedSheets}
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.washing}
                  readOnly
                  className="mr-2"
                />
                <label className="text-sm font-semibold text-gray-700">
                  WASHING
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <p className="text-gray-600">
              Thank you for choosing WASH WISE LAUNDRY SHOP!
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Please keep this receipt for your records
            </p>
          </div>
        </div>

        {/* Print Button */}
        <div className="text-center mt-8 print:hidden">
          <Button onClick={() => setShowPrintPreview(false)} className="mr-4">
            Back to Form
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-[#126280] hover:bg-[#126280]"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl bg-[#cdebf3] shadow-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold text-slate-800">
            CUSTOMER RECEIPT
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="text-lg font-semibold text-slate-700">
              Date: {formattedDate}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 bg-[#cdebf3]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 bg-[#cdebf3]">
          {/* Search Bar and Results Table */}
          <div className="mb-6">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                placeholder="Search customers by ID or name..."
                className="pl-10 bg-slate-100 border-slate-300 rounded-full"
              />
            </div>

            {/* Results Table */}
            {searchQuery && (
              <div className="max-h-60 overflow-y-auto border rounded-lg bg-white">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-slate-600">
                        Customer ID
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-slate-600">
                        Full Name
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan="2"
                          className="px-4 py-2 text-center text-slate-500"
                        >
                          Loading...
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td
                          colSpan="2"
                          className="px-4 py-2 text-center text-red-500"
                        >
                          {error}
                        </td>
                      </tr>
                    ) : filteredCustomers.length === 0 ? (
                      <tr>
                        <td
                          colSpan="2"
                          className="px-4 py-2 text-center text-slate-500"
                        >
                          No customer found.
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <tr
                          key={customer.user_id}
                          onClick={() => handleCustomerSelect(customer)}
                          className="hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-2 text-sm text-slate-800">
                            {customer.user_id}
                          </td>
                          <td className="px-4 py-2 text-sm text-slate-800">
                            {`${customer.user_fName} ${customer.user_lName}`}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              CUS_ID:
            </label>
            <Input
              name="cus_id"
              value={formData.cus_id}
              onKeyDown={handleEnterKey}
              onChange={handleInputChange}
              placeholder="Enter Customer ID"
              className="bg-white text-slate-900"
            />
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Name"
                  className="bg-white text-slate-900 border-slate-300 placeholder-slate-500"
                />
              </div>
              <div>
                <Input
                  name="batch"
                  value={formData.batch}
                  onChange={handleInputChange}
                  placeholder="BATCH"
                  className="bg-white text-slate-900 border-slate-300 placeholder-slate-500"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Input
                  name="cus_phoneNum"
                  type="number"
                  min="0"
                  value={formData.cus_phoneNum}
                  onChange={handleInputChange}
                  placeholder="Phone number"
                  className="bg-white text-slate-900 border-slate-300 placeholder-slate-500"
                />
              </div>
              <div>
                <Input
                  name="cus_address"
                  value={formData.cus_address}
                  onChange={handleInputChange}
                  placeholder="Address"
                  className="bg-white text-slate-900 border-slate-300 placeholder-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Item Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Item Details
            </h3>

            {/* First Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Input
                  name="shirts"
                  type="number"
                  min="0"
                  value={formData.shirts}
                  onChange={handleInputChange}
                  placeholder="SHIRTS"
                  className="bg-white text-slate-900 border-slate-300 placeholder-slate-500"
                />
              </div>
              <div>
                <Input
                  name="pants"
                  type="number"
                  min="0"
                  value={formData.pants}
                  onChange={handleInputChange}
                  placeholder="PANTS"
                  className="bg-white text-slate-900 border-slate-300 placeholder-slate-500"
                />
              </div>
              <div>
                <Input
                  name="jeans"
                  type="number"
                  min="0"
                  value={formData.jeans}
                  onChange={handleInputChange}
                  placeholder="JEANS"
                  className="bg-white text-slate-900 border-slate-300 placeholder-slate-500"
                />
              </div>
              <div>
                <Input
                  name="shorts"
                  type="number"
                  min="0"
                  value={formData.shorts}
                  onChange={handleInputChange}
                  placeholder="SHORTS"
                  className="bg-white text-slate-900 border-slate-300 placeholder-slate-500"
                />
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Input
                  name="towel"
                  type="number"
                  min="0"
                  value={formData.towel}
                  onChange={handleInputChange}
                  placeholder="TOWEL"
                  className="bg-white text-slate-900 border-slate-300 placeholder-slate-500"
                />
              </div>
              <div>
                <Input
                  name="pillowCase"
                  type="number"
                  min="0"
                  value={formData.pillowCase}
                  onChange={handleInputChange}
                  placeholder="PILLOW CASE"
                  className="bg-white text-slate-900 border-slate-300 placeholder-slate-500"
                />
              </div>
              <div>
                <Input
                  name="bedSheets"
                  type="number"
                  min="0"
                  value={formData.bedSheets}
                  onChange={handleInputChange}
                  placeholder="BED SHEETS"
                  className="bg-white text-slate-900 border-slate-300 placeholder-slate-500"
                />
              </div>
              <div>
                <div className="relative">
                  <Input
                    name="kl"
                    value={formData.kl}
                    onChange={handleInputChange}
                    placeholder="KL"
                    className="bg-white text-slate-900 border-slate-300 pr-8 placeholder-slate-500"
                  />
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-500 h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Service and Totals */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="washing"
                checked={formData.washing}
                onChange={handleInputChange}
                className="mr-2 h-4 w-4 text-slate-600"
              />
              <label className="text-sm font-semibold text-slate-800">
                WASHING
              </label>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-slate-800">
                TOTAL AMOUNT: ₱{formData.totalAmount}
              </div>
              <div className="text-lg font-semibold text-slate-800">
                #ITEMS: {formData.itemCount}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mb-4">
            <Button
              onClick={calculateTotal}
              className="bg-[#126280] hover:bg-blue-700 text-white px-8 py-3 rounded-full"
            >
              <Calculator className="h-5 w-5 mr-2" />
              CALCULATE
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-[#126280] hover:bg-blue-700 text-white px-8 py-3 rounded-full"
            >
              SUBMIT
            </Button>
          </div>

          {/* Print Link */}
          <div className="text-center">
            <button
              onClick={handlePrint}
              className="text-slate-800 font-semibold hover:text-slate-600 underline cursor-pointer"
            >
              PRINT
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerReceipt;
