import React, { useState } from 'react';
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

function Inventory() {
  const [timeRange, setTimeRange] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    inventoryId: "",
    itemName: "",
    description: "",
    quantity: "",
    unitPrice: "",
    reorderLevel: "",
  });

  // Static inventory data
  const [inventoryItems, setInventoryItems] = useState([
    {
      id: "INV001",
      itemName: "Laundry Detergent",
      description: "Heavy-duty detergent for commercial use",
      quantity: 150,
      unitPrice: 25.50,
      reorderLevel: 50,
      dateAdded: "2024-10-15",
    },
    {
      id: "INV002",
      itemName: "Fabric Softener",
      description: "Premium fabric softener",
      quantity: 80,
      unitPrice: 18.75,
      reorderLevel: 30,
      dateAdded: "2024-10-20",
    },
    {
      id: "INV003",
      itemName: "Bleach",
      description: "Industrial strength bleach",
      quantity: 45,
      unitPrice: 15.00,
      reorderLevel: 20,
      dateAdded: "2024-10-22",
    },
    {
      id: "INV004",
      itemName: "Stain Remover",
      description: "Professional stain remover spray",
      quantity: 30,
      unitPrice: 22.00,
      reorderLevel: 25,
      dateAdded: "2024-10-25",
    },
    {
      id: "INV005",
      itemName: "Dryer Sheets",
      description: "Anti-static dryer sheets",
      quantity: 200,
      unitPrice: 8.50,
      reorderLevel: 75,
      dateAdded: "2024-10-18",
    },
  ]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    const newItem = {
      id: `INV${String(inventoryItems.length + 1).padStart(3, '0')}`,
      itemName: formData.itemName,
      description: formData.description,
      quantity: parseInt(formData.quantity),
      unitPrice: parseFloat(formData.unitPrice),
      reorderLevel: parseInt(formData.reorderLevel),
      dateAdded: new Date().toISOString().split('T')[0],
    };

    setInventoryItems((prev) => [...prev, newItem]);
    
    setFormData({
      inventoryId: "",
      itemName: "",
      description: "",
      quantity: "",
      unitPrice: "",
      reorderLevel: "",
    });
    
    setIsDialogOpen(false);
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

  const handleEditSubmit = (event) => {
    event.preventDefault();
    
    const updatedItem = {
      ...selectedItem,
      itemName: formData.itemName,
      description: formData.description,
      quantity: parseInt(formData.quantity),
      unitPrice: parseFloat(formData.unitPrice),
      reorderLevel: parseInt(formData.reorderLevel),
    };

    setInventoryItems((prev) => 
      prev.map((item) => item.id === selectedItem.id ? updatedItem : item)
    );
    
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
                      <TableCell>₱{item.unitPrice.toFixed(2)}</TableCell>
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


