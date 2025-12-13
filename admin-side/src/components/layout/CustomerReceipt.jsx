import React, { useState, useEffect, useCallback, useContext } from "react";
import { X, Search, Calculator, Printer, ChevronDown, Check } from "lucide-react";
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
    services: true,
    totalAmount: "0.00",
    itemCount: "0",
    payNow: false,
    payLater: false,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { adminData } = useContext(AuthContext);
  const [itemTypes, setItemTypes] = useState([]);
  const [itemType, setItemType] = useState(null);
  const [serviceItems, setServiceItems] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [showPrintButton, setShowPrintButton] = useState(false);

  const shopName = localStorage.getItem("selectedShopName")

  const [inventoryItems, setInventoryItems] = useState([]); // raw items from API, includes item_quantity, item_uPrice
  const [selectedInventory, setSelectedInventory] = useState([]); // { item_id, name, unitPrice, qty, subtotal, stockBefore }
  const [inventorySearchQuery, setInventorySearchQuery] = useState(""); // search query for inventory items
  const [filteredInventoryItems, setFilteredInventoryItems] = useState([]); // filtered inventory items

  useEffect(() => {
    const fetchServiceItems = async () => {
      if (!adminData?.shop_id) return;
      try {
        const res = await fetchApi(`/api/auth/displayed-services/${adminData.shop_id}`);
        if (!res || res.success === false) {
          console.error(res?.message || "Failed to fetch items for services");
          throw new Error(res?.message || "Failed to fetch items for services");
        }

        const items = (res.data || []).map((i) => ({
          id: i.service_id,
          name: i.service_name.replace(/['"]+/g, ''),
        }));

        setServiceItems(items);
      } catch (error) {
        console.error("Error fetching service items:", error);
      }
    };
    fetchServiceItems();

    const fetchPriceItemTypes = async () => {
      if (!adminData?.shop_id) return;
      try {
        const res = await fetchApi(`/api/auth/displayed-prices/${adminData.shop_id}`);
        if (!res || res.success === false) {
          throw new Error(res?.message || "Failed to fetch items for pricing!");
        }

        const items = (res.data || []).map((i) => ({
          pricing_id: i.pricing_id,
          categories: i.categories,
          description: i.description,
          price: i.price,
          pricing_label: i.pricing_label,
        }));

        setItemTypes(items);

      } catch (error) {
        console.error("Failed to fetch item types", error);
      }
    };

    fetchPriceItemTypes();
  }, [adminData]);

  const getPaymentStatus = () => {
    if (formData.payNow) return "PAID";
    if (formData.payLater) return "PENDING";
    return null;
  };

  useEffect(() => {
    const fetchInventory = async () => {
      if (!adminData?.shop_id) return;
      try {
        const res = await fetchApi(`/api/auth/shop-inventory-items/${adminData.shop_id}`);
        if (!res || res.success === false) {
          console.error("Failed to fetch inventory items", res?.message);
          setInventoryItems([]);
          setFilteredInventoryItems([]);
          return;
        }
        // Normalize unit price to number
        const items = (res.data || []).map(i => ({
          ...i,
          item_uPrice: parseFloat(i.item_uPrice) || 0
        }));
        setInventoryItems(items);
        setFilteredInventoryItems(items);
      } catch (err) {
        console.error("Error fetching inventory:", err);
        setInventoryItems([]);
        setFilteredInventoryItems([]);
      }
    };

    fetchInventory();
  }, [adminData]);

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'payNow' && checked) {
      setFormData(prev => ({
        ...prev,
        payNow: true,
        payLater: false,
      }));
      return;
    }

    if (name === 'payLater' && checked) {
      setFormData(prev => ({
        ...prev,
        payNow: false,
        payLater: true,
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (type === 'checkbox' && name !== 'other_static_checkbox') {

      setSelectedServices(prevServices => {
        let newServices;

        if (checked) {
          newServices = [...prevServices, name];
        } else {
          newServices = prevServices.filter(serviceName => serviceName !== name);
        }
        return newServices;
      });
    }
    let updates = {};

    if (type === 'checkbox') {
      updates[name] = checked;
    } else if (type === "number") {
      const numValue = parseFloat(value);
      if (numValue < 0) {
        return;
      }
      updates[name] = value;
    } else {
      updates[name] = value;
    }

    if (name === 'batch') {
      const batchValue = parseFloat(value);
      if (!isNaN(batchValue) && batchValue >= 0) {
        const klValue = (batchValue * 7).toString();
        updates.kl = klValue;
      } else if (value.trim() === '') {
        updates.kl = '';
      }
    }

    if (name === 'cus_id' && value.trim() === '') {
      updates = {
        ...updates,
        name: '',
        cus_phoneNum: '',
        cus_address: ''
      };
    }
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
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

  const handleToggleInventoryItem = (item) => {
    const exists = selectedInventory.find(si => si.item_id === item.item_id);
    if (exists) {
      setSelectedInventory(prev => prev.filter(si => si.item_id !== item.item_id));
    } else {
      const newSelected = {
        item_id: item.item_id,
        name: item.item_name,
        unitPrice: parseFloat(item.item_uPrice) || 0,
        qty: 1,
        subtotal: parseFloat(item.item_uPrice) || 0,
        stockBefore: item.item_quantity
      };
      setSelectedInventory(prev => [...prev, newSelected]);
    }
  };

  // NEW: update qty for selected inventory item
  const handleInventoryQtyChange = (item_id, qtyStr) => {
    const qty = parseInt(qtyStr) || 0;
    setSelectedInventory(prev => prev.map(si => {
      if (si.item_id !== item_id) return si;
      const newQty = qty < 0 ? 0 : qty;
      return {
        ...si,
        qty: newQty,
        subtotal: +(newQty * si.unitPrice).toFixed(2)
      };
    }));
  };

  // Filter inventory items based on search query
  const handleInventorySearch = (query) => {
    setInventorySearchQuery(query);
    if (!query.trim()) {
      setFilteredInventoryItems(inventoryItems);
      return;
    }
    const searchTerm = query.toLowerCase();
    const filtered = inventoryItems.filter(item =>
      item.item_name.toLowerCase().includes(searchTerm)
    );
    setFilteredInventoryItems(filtered);
  };

  // Recalculate totals including inventory items
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

    const selectedItem = itemType;
    const batchQuantity = parseFloat(formData.batch) || 0;

    let total = 0;
    let count = 0;

    items.forEach((item) => {
      const quantity = parseInt(formData[item]) || 0;
      count += quantity;
    });
    if (selectedItem && selectedItem.price) {
      const price = parseFloat(selectedItem.price);
      total += batchQuantity * price;
    }

    const inventoryTotal = selectedInventory.reduce((acc, si) => acc + (si.subtotal || 0), 0);
    const inventoryCount = selectedInventory.reduce((acc, si) => acc + (parseInt(si.qty) || 0), 0);

    total += inventoryTotal;
    count += inventoryCount;

    setFormData((prev) => ({
      ...prev,
      totalAmount: total.toFixed(2),
      itemCount: count.toString(),
    }));
  };

  const handlePrint = () => {
    setShowPrintPreview(true);
    setTimeout(() => {
      window.print();
      setShowPrintPreview(false);
      onClose();
    }, 1000);
  };

  const updateInventoryBulk = async (items) => {
    return await fetchApi(`/api/auth/update-inventory-items`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
  };


  const submitLaundryRecord = async () => {
    try {
      // Validate customer fields
      if (!formData.cus_id) {
        toast.error('Customer ID is required');
        return;
      }

      // Validate inventory qty against stock BEFORE sending
      for (const si of selectedInventory) {
        const inventoryItem = inventoryItems.find(i => i.item_id === si.item_id);
        const available = inventoryItem ? parseInt(inventoryItem.item_quantity) : 0;
        if (si.qty <= 0) {
          toast.error(`Quantity for ${si.name} must be at least 1`);
          return;
        }
        if (si.qty > available) {
          toast.error(`Not enough stock for ${si.name}. Available: ${available}, requested: ${si.qty}`);
          return;
        }
      }

      const itemPayload = {
        items: selectedInventory.map(si => ({
          item_id: si.item_id,
          name: si.name,
          qty: parseInt(si.qty),
          unit_price: parseFloat(si.unitPrice),
          subtotal: parseFloat(si.subtotal)
        }))
      }

      const transformedString = itemPayload.items
        .map(item => `${item.name.trim()}-${item.qty}`)
        .join(' | ');

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
        service: selectedServices.join(', '),
        kg: formData.kl,
        num_items: parseInt(formData.itemCount) || 0,
        cleaning_products: transformedString,
        total_amount: parseFloat(formData.totalAmount) || 0,
        payment_status: getPaymentStatus(),
        process_by: "ADMIN"
      };

      const response = await fetchApi('/api/customers/laundry-record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.success === false) {
        throw new Error(response.message || `HTTP error! status: ${response.status}`);
      }

      if (response.success) {
        toast.success('Laundry record saved successfully!');
        setTimeout(() => {
          setShowPrintButton(true);
        }, 1500);
        setLaundryId(response.laundryId);

        // Build bulk update payload
        const bulkItems = selectedInventory.map((si) => {
          const inventoryItem = inventoryItems.find(i => i.item_id === si.item_id);
          const newStock = (parseInt(inventoryItem?.item_quantity || 0) - si.qty);

          return {
            item_id: si.item_id,
            item_quantity: newStock < 0 ? 0 : newStock,
            item_reorderLevel: si.qty  // How many customer buys (you required this)
          };
        });

        try {
          const updateResponse = await updateInventoryBulk(bulkItems);

          if (!updateResponse.success) {
            toast.error("Failed to update inventory!");
            console.error(updateResponse.message);
          } else {
            // Update your local state
            setInventoryItems(prev =>
              prev.map(inv => {
                const updated = bulkItems.find(u => u.item_id === inv.item_id);
                return updated ? { ...inv, item_quantity: updated.item_quantity } : inv;
              })
            );
          }
        } catch (err) {
          console.error("Error updating one or more inventory items after record creation:", err);
          toast.error("Record saved but failed to update some inventory items. Check logs.");
        }

      } else {
        toast.error(response.message || 'Failed to save laundry record');
      }

    } catch (error) {
      console.error('Error submitting laundry record:', error);
      toast.error('' + error);
    }
  };

  const handleSubmit = async () => {

    // 1. Validate item type
    if (!itemType) {
      toast.error("Please select an item type before submitting.");
      return;
    }

    // 2. Validate item details (all empty or zero)
    const manualItems = [
      formData.shirts,
      formData.pants,
      formData.jeans,
      formData.shorts,
      formData.towel,
      formData.pillowCase,
      formData.bedSheets
    ];

    const allManualEmpty = manualItems.every(val => !val || parseInt(val) === 0);

    if (allManualEmpty && selectedInventory.length === 0) {
      toast.error("Please enter at least one item or select an inventory item.");
      return;
    }

    if (!formData.payNow && !formData.payLater) {
      toast.error("Please select a payment method.");
      return;
    }

    if (!formData.cus_id) {
      toast.error("Customer ID is required.");
      return;
    }

    calculateTotal();
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

  // Show print preview (kept from your original component)
  if (showPrintPreview) {
    return (
      <div className="fixed inset-0 bg-white z-50 p-8 print:p-0">
        <div className="text-center mb-8 print:mb-4 gap-20">
          <div className="relative mb-4">
            <div className="absolute ml-20">
              <img
                src={image}
                alt="Laundry Shop"
                className="rounded-full shadow-lg w-20 h-20 object-cover"
              />
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-blue-800">
                {shopName}
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

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 gap-8 mb-8">
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
              <div>
                <h3 className="font-semibold text-lg text-slate-800 mt-4">Payment</h3>
                <div><p className="text-sm">PAY NOW:</p> {formData.payNow ? <Check /> : "X"}</div>
                <div><p className="text-sm">PAY LATER:</p> {formData.payLater ? <Check /> : "X"}</div>
              </div>
            </div>
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
              {selectedInventory.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-lg text-slate-800 mb-2">Items Used</h3>
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Qty</th>
                        <th>Unit</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInventory.map(si => (
                        <tr key={si.item_id}>
                          <td>{si.name}</td>
                          <td>{si.qty}</td>
                          <td>₱{si.unitPrice}</td>
                          <td>₱{si.subtotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="w-full">
                <h3 className="font-semibold text-lg text-slate-800 mb-3">Available Services</h3>

                {serviceItems.length === 0 ? (
                  <p className="text-gray-500">No services found for this shop.</p>
                ) : (
                  <div className="space-y-3">
                    {serviceItems.map((service) => (
                      <div key={service.id} className="flex items-center">
                        <input
                          type="checkbox"
                          name={service.name}
                          checked={formData[service.name] ?? false}
                          onChange={handleInputChange}
                          className="mr-2 h-4 w-4 text-slate-600 rounded"
                        />
                        <label
                          htmlFor={service.name}
                          className="text-sm font-semibold text-slate-800 cursor-pointer"
                        >
                          {service.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600">
              Thank you for choosing {shopName}!
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Please keep this receipt for your records
            </p>
          </div>
        </div>

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
            <div className="space-y-4">
              <div>
                <Input
                  disabled
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

            <div className="space-y-4">
              <div>
                <Input
                  disabled
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
                  disabled
                  name="cus_address"
                  value={formData.cus_address}
                  onChange={handleInputChange}
                  placeholder="Address"
                  className="bg-white text-slate-900 border-slate-300 placeholder-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Item Types */}
          <div className="w-full mb-4">
            <h2 className="font-semibold text-lg text-slate-800 mb-4">Select Item Type</h2>

            {itemTypes.length === 0 ? (
              <p className="text-gray-500 text-sm">Loading item types...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {itemTypes.map((type) => (
                  <div
                    key={type.pricing_id}
                    onClick={() => setItemType(type)}
                    className={`cursor-pointer border rounded-xl p-4 text-center transition ${itemType?.pricing_id === type.pricing_id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-400 shadow-md hover:bg-gray-100"
                      }`}
                  >
                    <p className="font-medium text-slate-800 mb-2">{type.categories}</p>
                    <p className="text-xs font-semibold">₱{type.price} {type.pricing_label}</p>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Item Details
            </h3>

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

          <div className="mb-6 border rounded-lg bg-white p-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Shop Inventory Items</h3>

            {/* Search Input for Inventory */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                value={inventorySearchQuery}
                onChange={(e) => handleInventorySearch(e.target.value)}
                placeholder="Search inventory items..."
                className="pl-10 bg-slate-50 border-slate-300"
              />
            </div>

            {inventoryItems.length === 0 ? (
              <p className="text-gray-500">No inventory items found.</p>
            ) : filteredInventoryItems.length === 0 ? (
              <p className="text-gray-500">No items match your search.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredInventoryItems.map(item => {
                  const isSelected = !!selectedInventory.find(si => si.item_id === item.item_id);
                  const selectedObj = selectedInventory.find(si => si.item_id === item.item_id);
                  return (
                    <div key={item.item_id} className="flex items-center justify-between border p-3 rounded-md">
                      <div>
                        <div className="font-semibold">{item.item_name}</div>
                        <div className="text-sm text-gray-600">Stock: {item.item_quantity}</div>
                        <div className="text-sm text-gray-700">Unit: ₱{item.item_uPrice.toFixed ? item.item_uPrice.toFixed(2) : item.item_uPrice}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleInventoryItem(item)}
                          className="h-4 w-4 cursor-pointer"
                        />

                        {isSelected && (
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-600">Quantity:</label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="1"
                                value={selectedObj.qty}
                                onChange={(e) => handleInventoryQtyChange(item.item_id, e.target.value)}
                                className="w-20 h-8"
                                placeholder="Qty"
                              />
                              <div className="text-sm font-semibold text-green-700">₱{(selectedObj.subtotal || 0).toFixed(2)}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Service and Totals */}
          <div className="flex justify-between items-center mb-6">
            <div className="w-full">
              <h3 className="font-semibold text-lg text-slate-800 mb-3">Available Services</h3>

              {serviceItems.length === 0 ? (
                <p className="text-gray-500">No services found for this shop.</p>
              ) : (
                <div className="space-y-3">
                  {serviceItems.map((service) => (
                    <div key={service.id} className="flex items-center">
                      <input
                        type="checkbox"
                        name={service.name}
                        checked={formData[service.name] ?? false}
                        onChange={handleInputChange}
                        className="mr-2 h-4 w-4 text-slate-600 rounded"
                      />
                      <label
                        htmlFor={service.name}
                        className="text-sm font-semibold text-slate-800 cursor-pointer"
                      >
                        {service.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-3 mt-5">
                <h3 className="font-semibold text-lg text-slate-800">Payment</h3>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="payNow"
                    checked={formData.payNow}
                    onChange={handleInputChange}
                    className="mr-2 h-4 w-4 text-green-600 cursor-pointer"
                  />
                  <label className="text-xs sm:text-sm font-semibold text-green-700 cursor-pointer">
                    PAY NOW
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="payLater"
                    checked={formData.payLater}
                    onChange={handleInputChange}
                    className="mr-2 h-4 w-4 text-amber-600 cursor-pointer"
                  />
                  <label className="text-xs sm:text-sm font-semibold text-amber-700 cursor-pointer">
                    PAY LATER
                  </label>
                </div>

              </div>

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

          {showPrintButton ? (<div className="text-center">
            <button
              onClick={handlePrint}
              className="text-slate-800 font-semibold hover:text-slate-600 underline cursor-pointer"
            >
              PRINT
            </button>
          </div>) : (null)}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerReceipt;
