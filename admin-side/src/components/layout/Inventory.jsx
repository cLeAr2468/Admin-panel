import React, { useState, useEffect, useContext } from 'react';
import Sidebar from './Sidebar';
import ItemDetails from './ItemDetails';
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
import { Search, Eye, Pencil, Save, X, Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import { AuthContext } from '@/context/AuthContext';

function Inventory() {
  const [timeRange, setTimeRange] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    inventoryId: "",
    shopId: "",
    itemName: "",
    description: "",
    quantity: "",
    unitPrice: "",
    reorderLevel: "",
  });
  const { adminData } = useContext(AuthContext);


  const [inventoryItems, setInventoryItems] = useState([
  ]);


  useEffect(() => {
    const fetchInventory = async () => {
      if (!adminData?.shop_id) {
        throw new Error("Shop information not available. Please reload or login.")
      }
      try {

        if (!adminData) {
          console.log('Waiting for admin data...');
          return;
        }

        const response = await fetchApi(`/api/auth/shop-inventory-items/${adminData.shop_id}`);

        if (response.success === false) {
          throw new Error(`Error fetching inventory items: ${response.message}`);
        }

        const items = response.data.map(item => {
          return {
            id: item.item_id,
            shopId: item.shop_id,
            itemName: item.item_name,
            description: item.item_description,
            quantity: parseInt(item.item_quantity, 10),
            unitPrice: parseFloat(item.item_uPrice),
            reorderLevel: parseFloat(item.item_reorderLevel, 10),
            dateAdded: item.date_added
          };
        });

        setInventoryItems(items);
      } catch (error) {
        console.error('Failed to fetch inventory items:', error);
        setInventoryItems([]);
      }
    };

    fetchInventory();
  }, [adminData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!adminData?.shop_id) {
      throw new Error("Shop information not available. Please reload or login.")
    }
    try {
      const response = await fetchApi('/api/auth/add-shop-inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: adminData.shop_id,
          item_name: formData.itemName,
          item_description: formData.description,
          item_quantity: formData.quantity,
          item_uPrice: formData.unitPrice,
          item_reoderLevel: formData.reorderLevel,
        }),
      });

      if (!response || response.success === false) {
        const msg = response?.message || 'Error adding item';
        toast.error(msg);
        throw new Error(msg);
      } else {
        toast.success("Item added successfully!");
        setIsDialogOpen(false);
        setFormData({
          inventoryId: "",
          itemName: "",
          description: "",
          quantity: "",
          unitPrice: "",
          reorderLevel: "",
        });

        const response = await fetchApi(`/api/auth/shop-inventory-items/${adminData.shop_id}`);

        if (response.success === false) {
          throw new Error(`Error fetching inventory items: ${response.message}`);
        }

        const items = response.data.map(item => {
          return {
            id: item.item_id,
            itemName: item.item_name,
            description: item.item_description,
            quantity: parseInt(item.item_quantity, 10),
            unitPrice: parseFloat(item.item_uPrice),
            reorderLevel: parseFloat(item.item_reoderLevel, 10),
            dateAdded: item.date_added
          };
        });
        console.log('Fetched inventory items:', items);
        setInventoryItems(items);
      }

    } catch (error) {
      console.error('Adding inventory item error:', error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong while adding the item';

      toast.error(msg);
    }

  };

  const handleView = (item) => {
    setSelectedItem(item);
    setIsViewMode(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      inventoryId: item.id,
      itemName: item.itemName,
      description: item.description,
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice.toString(),
      reorderLevel: item.reorderLevel.toString(),
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    if (!selectedItem) {
      toast.error("No item selected to update");
      return;
    }

    try {
      const updatePayload = {
        shop_id: adminData.shop_id,
        item_name: formData.itemName,
        item_description: formData.description,
        item_quantity: parseInt(formData.quantity, 10) || 0,
        item_uPrice: parseFloat(formData.unitPrice) || 0,
        item_reoderLevel: parseInt(formData.reorderLevel, 10) || 0,
      };

      console.log("Sending update payload:", updatePayload);

      const response = await fetchApi(
        `/api/auth/edit-inventory-item/${selectedItem.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!response || response.success === false) {
        const msg = response?.message || "Failed to update item";
        toast.error(msg);
        throw new Error(msg);
      }

      // Update local state so UI reflects change immediately
      setInventoryItems((prev) =>
        prev.map((it) =>
          it.id === selectedItem.id
            ? {
              ...it,
              itemName: formData.itemName,
              description: formData.description,
              quantity: parseInt(formData.quantity, 10) || 0,
              unitPrice: parseFloat(formData.unitPrice) || 0,
              reorderLevel: parseInt(formData.reorderLevel, 10) || 0,
            }
            : it
        )
      );

      toast.success("Item updated successfully!");

      // reset and close modal
      setFormData({
        inventoryId: "",
        itemName: "",
        description: "",
        quantity: "",
        unitPrice: "",
        reorderLevel: "",
      });
      setIsEditModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Updating inventory item error:", error);
      const msg =
        error?.response?.data?.message || error?.message || "Something went wrong while updating the item";
      toast.error(msg);
    }
  };

  const getStockBadgeColor = (quantity, reorderLevel) => {
    if (quantity <= reorderLevel) {
      return "bg-red-500 hover:bg-red-600";
    } else if (quantity <= reorderLevel * 1.5) {
      return "bg-yellow-500 hover:bg-yellow-600";
    }
    return "bg-green-500 hover:bg-green-600";
  };

  const getStockStatus = (quantity, reorderLevel) => {
    if (quantity <= reorderLevel) {
      return "LOW STOCK";
    } else if (quantity <= reorderLevel * 1.5) {
      return "MODERATE";
    }
    return "IN STOCK";
  };

  const getTimeThreshold = () => {
    const now = new Date();
    switch (timeRange) {
      case "daily":
        return new Date(now.setDate(now.getDate() - 1));
      case "weekly":
        return new Date(now.setDate(now.getDate() - 7));
      case "monthly":
        return new Date(now.setMonth(now.getMonth() - 1));
      case "yearly":
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return null;
    }
  };

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const threshold = getTimeThreshold();
    if (threshold === null) return true;

    const itemDate = new Date(item.dateAdded);
    return itemDate >= threshold;
  });

  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar />
      <div className="flex-1 p-6 md:p-10 overflow-auto bg-transparent relative">
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-wide">INVENTORY</h1>
            <div className="text-sm md:text-base">
              Date: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {/* Main Content Area */}
          {isViewMode && selectedItem ? (
            // Item Details View
            <div className="max-w-4xl mx-auto">
              <div className="mb-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsViewMode(false);
                    setSelectedItem(null);
                  }}
                  className="text-[#126280] hover:text-[#126280]/80"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Inventory
                </Button>
              </div>
              <ItemDetails item={selectedItem} />
            </div>
          ) : (
            <>
              {/* Search and Filters Section */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative w-full md:w-[300px]">
                    <Input
                      type="text"
                      placeholder="Search by item name or ID..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
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
                      <SelectItem value="daily">Today</SelectItem>
                      <SelectItem value="weekly">This week</SelectItem>
                      <SelectItem value="monthly">This month</SelectItem>
                      <SelectItem value="yearly">This year</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="default"
                    className="bg-[#126280] hover:bg-[#126280]/80"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto rounded-lg">
                <Table className="[&_tbody_tr:hover]:bg-white">
                  <TableHeader>
                    <TableRow className="bg-[#126280] hover:bg-[#126280]">
                      <TableHead className="text-white font-semibold">Item Name</TableHead>
                      <TableHead className="text-white font-semibold">Quantity</TableHead>
                      <TableHead className="text-white font-semibold">Unit Price</TableHead>
                      <TableHead className="text-white font-semibold">Reorder Level</TableHead>
                      <TableHead className="text-white font-semibold">Status</TableHead>
                      <TableHead className="text-white font-semibold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">No items found</TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item) => (
                        <TableRow key={item.id} className="bg-white">
                          <TableCell>{item.itemName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₱{parseFloat(item.unitPrice).toFixed(2)}</TableCell>
                          <TableCell>{item.reorderLevel}</TableCell>
                          <TableCell>
                            <Badge className={`${getStockBadgeColor(item.quantity, item.reorderLevel)} text-white`}>
                              {getStockStatus(item.quantity, item.reorderLevel)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 justify-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-[#126280] hover:text-[#126280]/80"
                                aria-label="View item"
                                title="View"
                                onClick={() => handleView(item)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-[#126280] hover:text-[#126280]/80"
                                aria-label="Edit item"
                                title="Edit"
                                onClick={() => handleEdit(item)}
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
                {filteredItems.length === 0 ? (
                  <div className="text-center p-4">No items found</div>
                ) : (
                  filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg p-4 shadow-md space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-[#126280]">{item.itemName}</h3>
                        <Badge className={`${getStockBadgeColor(item.quantity, item.reorderLevel)} text-white`}>
                          {getStockStatus(item.quantity, item.reorderLevel)}
                        </Badge>
                      </div>
                      <div className="text-sm space-y-2">
                        <p><span className="font-medium">ID:</span> {item.id}</p>
                        <p><span className="font-medium">Description:</span> {item.description}</p>
                        <p><span className="font-medium">Quantity:</span> {item.quantity}</p>
                        <p><span className="font-medium">Unit Price:</span> ₱{item.unitPrice.toFixed(2)}</p>
                        <p><span className="font-medium">Reorder Level:</span> {item.reorderLevel}</p>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-[#126280] hover:text-[#126280]/80"
                          aria-label="View item"
                          title="View"
                          onClick={() => handleView(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-[#126280] hover:text-[#126280]/80"
                          aria-label="Edit item"
                          title="Edit"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Item Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-2xl mx-4 bg-[#cdebf3] shadow-2xl rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-4">
              <h2 className="text-2xl font-bold text-slate-800">Add New Item</h2>
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
                      Item Name *
                    </label>
                    <Input
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleChange}
                      placeholder="Enter item name"
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Quantity in Stock *
                    </label>
                    <Input
                      name="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={handleChange}
                      placeholder="Enter quantity"
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Description *
                  </label>
                  <Input
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter item description"
                    required
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Unit Price *
                    </label>
                    <Input
                      name="unitPrice"
                      type="number"
                      step="0.01"
                      value={formData.unitPrice}
                      onChange={handleChange}
                      placeholder="Enter unit price"
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Reorder Level *
                    </label>
                    <Input
                      name="reorderLevel"
                      type="number"
                      value={formData.reorderLevel}
                      onChange={handleChange}
                      placeholder="Enter reorder threshold"
                      required
                      className="w-full"
                    />
                  </div>
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
                    Save Item
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {isEditModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-2xl mx-4 bg-[#cdebf3] shadow-2xl rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-4">
              <h2 className="text-2xl font-bold text-slate-800">Edit Item</h2>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedItem(null);
                  setFormData({
                    inventoryId: "",
                    itemName: "",
                    description: "",
                    quantity: "",
                    unitPrice: "",
                    reorderLevel: "",
                  });
                }}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 pt-0">
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Inventory ID
                  </label>
                  <div className="w-full bg-gray-100 text-gray-600 rounded-md px-4 py-3 shadow">
                    {selectedItem.id}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Item Name *
                    </label>
                    <Input
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleChange}
                      placeholder="Enter item name"
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Quantity in Stock *
                    </label>
                    <Input
                      name="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={handleChange}
                      placeholder="Enter quantity"
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Description *
                  </label>
                  <Input
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter item description"
                    required
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Unit Price *
                    </label>
                    <Input
                      name="unitPrice"
                      type="number"
                      step="0.01"
                      value={formData.unitPrice}
                      onChange={handleChange}
                      placeholder="Enter unit price"
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Reorder Level *
                    </label>
                    <Input
                      name="reorderLevel"
                      type="number"
                      value={formData.reorderLevel}
                      onChange={handleChange}
                      placeholder="Enter reorder threshold"
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setSelectedItem(null);
                      setFormData({
                        inventoryId: "",
                        itemName: "",
                        description: "",
                        quantity: "",
                        unitPrice: "",
                        reorderLevel: "",
                      });
                    }}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-slate-600 hover:bg-slate-700 px-6"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Update Item
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
