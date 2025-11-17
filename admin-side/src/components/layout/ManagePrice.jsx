import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Pencil, Trash2, X, Save, Eye, CheckCircle, Upload } from "lucide-react";
import Sidebar from "./Sidebar";
import { toast } from "sonner";
import { AuthContext } from "@/context/AuthContext";
import { fetchApiFormData } from "@/lib/api";

const ManagePrice = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [prices, setPrices] = useState([
    {
      id: 1,
      category: "CLOTHES",
      description: "Shirts, shorts, pants etc.",
      price: "140",
      unit: "per load",
      image_url: null,
      isDisplayed: true,
    },
    {
      id: 2,
      category: "BEDDINGS",
      description: "Bed sheets, pillow cases, towels, etc.",
      price: "140",
      unit: "per load",
      image_url: null,
      isDisplayed: true,
    },
    {
      id: 3,
      category: "CURTAINS",
      description: "Window curtains and drapes",
      price: "160",
      unit: "per load",
      image_url: null,
      isDisplayed: true,
    },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPriceDialog, setShowPriceDialog] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [tempSelectedPrices, setTempSelectedPrices] = useState([]);
  const { adminData } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    price: "",
    unit: "per load",
    image: null,
    isDisplayed: true,
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.category || !formData.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (!adminData?.shop_id) {
        throw new Error("Shop information not available. Please reload or login.");
      }

      if (isEditMode) {
        setPrices(prices.map(p =>
          p.id === selectedPrice.id
            ? { ...p, category: formData.category, description: formData.description, price: formData.price, unit: formData.unit, image_url: imagePreview || p.image_url, isDisplayed: formData.isDisplayed }
            : p
        ));
        toast.success("Price updated successfully");
      } else {
        setIsLoading(true);
        const formDataToSend = new FormData();
        formDataToSend.append("shop_id", adminData.shop_id);
        formDataToSend.append("categories", formData.category);
        formDataToSend.append("description", formData.description)
        formDataToSend.append("price", formData.price);
        formDataToSend.append("pricing_label", formData.unit);
        formDataToSend.append("is_displayed", formData.isDisplayed ? "true" : "false");

        if (formData.image) {
          formDataToSend.append("image", formData.image);
        }

        const response = await fetchApiFormData('/api/auth/add-price', formDataToSend);

        const newPrice = {
          id: prices.length > 0 ? Math.max(...prices.map(p => p.id)) + 1 : 1,
          category: response.data.category,
          description: response.data.description,
          price: response.data.price,
          unit: response.data.pricing_label,
          image_url: response.data.image_url,
          isDisplayed: response.data.is_displayed === "true",
        };
        setPrices([...prices, newPrice]);
        toast.success("Price added successfully");
      }

      setFormData({
        category: "",
        description: "",
        price: "",
        unit: "per load",
        image: null,
        isDisplayed: true,
      });
      setImagePreview(null);
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedPrice(null);
    } catch (error) {
      console.error("Add pricing error:", error);
      toast.error(error.message || "Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (price) => {
    setSelectedPrice(price);
    setFormData({
      category: price.category,
      description: price.description || "",
      price: price.price,
      unit: price.unit || "per load",
      image: null,
      isDisplayed: price.isDisplayed !== undefined ? price.isDisplayed : true,
    });
    setImagePreview(price.image_url || null);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };



  const handleToggleSelection = (priceId) => {
    if (tempSelectedPrices.includes(priceId)) {
      setTempSelectedPrices(tempSelectedPrices.filter(id => id !== priceId));
    } else {
      if (tempSelectedPrices.length >= 3) {
        toast.error("You can only select 3 prices to display");
        return;
      }
      setTempSelectedPrices([...tempSelectedPrices, priceId]);
    }
  };

  const handleSaveDisplaySettings = () => {
    if (tempSelectedPrices.length !== 3) {
      toast.error("Please select exactly 3 prices to display");
      return;
    }

    const updatedPrices = prices.map(p => ({
      ...p,
      isDisplayed: tempSelectedPrices.includes(p.id)
    }));

    setPrices(updatedPrices);
    setIsSelectionMode(false);
    setTempSelectedPrices([]);
    toast.success("Display settings saved successfully!");
  };

  const handleStartSelection = () => {
    const currentlyDisplayed = prices.filter(p => p.isDisplayed !== false).map(p => p.id);
    setTempSelectedPrices(currentlyDisplayed.slice(0, 3));
    setIsSelectionMode(true);
  };

  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setTempSelectedPrices([]);
  };

  const openAddDialog = () => {
    setFormData({
      category: "",
      description: "",
      price: "",
      unit: "per load",
      image: null,
      isDisplayed: true,
    });
    setImagePreview(null);
    setIsEditMode(false);
    setSelectedPrice(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="text-[#126280] hover:text-[#126280]/80"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold text-[#126280]">Manage Prices</h1>
            </div>

          </div>

          {/* Prices Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Price Categories</h2>
                {isSelectionMode && (
                  <span className="text-sm text-gray-600">
                    ({tempSelectedPrices.length}/3 selected)
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                {isSelectionMode ? (
                  <>
                    <Button
                      onClick={handleCancelSelection}
                      variant="outline"
                      className="border-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveDisplaySettings}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Display Settings
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleStartSelection}
                      variant="outline"
                      className="border-[#0B6B87] text-[#0B6B87] hover:bg-[#0B6B87] hover:text-white"
                    >
                      Select 3 to Display
                    </Button>
                    <Button
                      onClick={openAddDialog}
                      className="bg-[#0B6B87] hover:bg-[#0B6B87]/90 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Price
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Prices Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prices.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No prices added yet. Add your first price!
                </div>
              ) : (
                prices.map((price) => {
                  const isSelected = tempSelectedPrices.includes(price.id);
                  return (
                    <Card
                      key={price.id}
                      className={`border shadow-sm transition-all bg-white relative ${isSelectionMode
                        ? isSelected
                          ? 'border-green-500 border-2 shadow-lg cursor-pointer'
                          : 'border-gray-200 hover:border-[#0B6B87] cursor-pointer'
                        : 'border-gray-200 hover:shadow-md'
                        }`}
                      onClick={() => isSelectionMode && handleToggleSelection(price.id)}
                    >
                      <CardContent className="p-0">
                        {/* Image Section */}
                        <div className="relative h-48 bg-gray-200">
                          {price.image_url ? (
                            <img
                              src={price.image_url}
                              alt={price.category}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Upload className="h-12 w-12" />
                            </div>
                          )}

                          {/* Display Status Badge or Selection Checkbox */}
                          <div className="absolute top-3 right-3">
                            {isSelectionMode ? (
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected
                                ? 'bg-green-500 border-green-500'
                                : 'bg-white border-gray-300'
                                }`}>
                                {isSelected && (
                                  <CheckCircle className="h-4 w-4 text-white" />
                                )}
                              </div>
                            ) : (
                              <>
                                {price.isDisplayed !== false ? (
                                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                    Displayed
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                    Hidden
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-[#0B6B87] mb-2">
                            {price.category}
                          </h3>
                          {price.description && (
                            <p className="text-sm text-gray-600 mb-3">{price.description}</p>
                          )}
                          <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-3xl font-bold text-[#0B6B87]">
                              ₱{price.price}
                            </span>
                            <span className="text-sm text-gray-500">{price.unit}</span>
                          </div>

                          {!isSelectionMode && (
                            <div className="flex gap-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(price);
                                }}
                                className="flex-1 text-[#0B6B87] border-[#0B6B87] hover:bg-[#0B6B87] hover:text-white"
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>



      {/* Add/Edit Price Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl bg-white shadow-2xl rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-[#126280]">
                {isEditMode ? 'Edit Price' : 'Add New Price'}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsDialogOpen(false);
                  setIsEditMode(false);
                  setSelectedPrice(null);
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Category Image
                </label>
                <div className="flex flex-col items-center gap-4">
                  {imagePreview && (
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, image: null }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="w-full">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: JPG, PNG, GIF (Max 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Category Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Category Name *
                </label>
                <Input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., Clothes, Beddings, Curtains"
                  required
                  className="w-full"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Description
                </label>
                <Input
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="e.g., Shirts, shorts, pants etc."
                  className="w-full"
                />
              </div>

              {/* Price and Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Price (₱) *
                  </label>
                  <Input
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="140"
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Unit
                  </label>
                  <Input
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    placeholder="per load"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Display in Main Content */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="isDisplayed"
                  checked={formData.isDisplayed}
                  onChange={(e) => setFormData(prev => ({ ...prev, isDisplayed: e.target.checked }))}
                  className="w-4 h-4 text-[#126280] border-gray-300 rounded focus:ring-[#126280]"
                />
                <label htmlFor="isDisplayed" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Display this price in main content
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setIsEditMode(false);
                    setSelectedPrice(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#126280] hover:bg-[#126280]/80"
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : isEditMode ? 'Update Price' : 'Add Price'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePrice;
