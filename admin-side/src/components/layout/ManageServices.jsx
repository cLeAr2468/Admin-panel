import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Pencil, Trash2, X, Save, Eye, CheckCircle, Upload } from "lucide-react";
import Sidebar from "./Sidebar";
import { toast } from "sonner";
import { AuthContext } from "@/context/AuthContext";
import { fetchApiFormData } from "@/lib/api";

const ManageServices = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState([
    {
      id: 1,
      title: "Machine Wash",
      description: "Our state of the art machine washing service guarantees your clothes are thoroughly cleaned and gently cared for. Enjoy fresh, spotless laundry with every visit.",
      image_url: null,
      isDisplayed: true,
    },
    {
      id: 2,
      title: "Dry Cleaning",
      description: "Professional dry cleaning service for delicate fabrics and special garments. We use eco-friendly solvents to ensure your clothes look their best.",
      image_url: null,
      isDisplayed: true,
    },
    {
      id: 3,
      title: "Ironing Service",
      description: "Expert ironing and pressing service to make your clothes crisp and wrinkle-free. Perfect for business attire and special occasions.",
      image_url: null,
      isDisplayed: true,
    },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [tempSelectedServices, setTempSelectedServices] = useState([]);
  const { adminData } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
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

    if (!formData.title || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (!adminData?.shop_id) {
        throw new Error("Shop information not available. Please reload or login.");
      }

      if (isEditMode) {

        setServices(services.map(s =>
          s.id === selectedService.id
            ? {
              ...s,
              title: formData.title,
              description: formData.description,
              image_url: imagePreview || s.image_url,
              isDisplayed: formData.isDisplayed
            }
            : s
        ));
        toast.success("Service updated successfully");
      } else {

        setIsLoading(true);

        const formDataToSend = new FormData();
        formDataToSend.append("shop_id", adminData.shop_id);
        formDataToSend.append("service_name", formData.title);
        formDataToSend.append("description", formData.description);
        formDataToSend.append("is_displayed", formData.isDisplayed ? "true" : "false");

        if (formData.image) {
          formDataToSend.append("image", formData.image);
        }


        const result = await fetchApiFormData('/api/auth/add-service', formDataToSend);

        setServices((prev) => [
          ...prev,
          {
            id: result.data.service_id,
            title: result.data.service_name,
            description: result.data.description,
            image_url: result.data.image_url,
            isDisplayed: result.data.is_displayed === "true",
          },
        ]);

        toast.success("Service added successfully!");
      }


      setFormData({
        title: "",
        description: "",
        image: null,
        isDisplayed: true,
      });
      setImagePreview(null);
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedService(null);

    } catch (error) {
      console.error("Add service error:", error);
      toast.error(error.message || "Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (service) => {
    setSelectedService(service);
    setFormData({
      title: service.title,
      description: service.description || "",
      image: null,
      isDisplayed: service.isDisplayed !== undefined ? service.isDisplayed : true,
    });
    setImagePreview(service.image_url || null);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };


  const handleToggleSelection = (serviceId) => {
    if (tempSelectedServices.includes(serviceId)) {
      setTempSelectedServices(tempSelectedServices.filter(id => id !== serviceId));
    } else {
      if (tempSelectedServices.length >= 3) {
        toast.error("You can only select 3 services to display");
        return;
      }
      setTempSelectedServices([...tempSelectedServices, serviceId]);
    }
  };

  const handleSaveDisplaySettings = () => {
    if (tempSelectedServices.length !== 3) {
      toast.error("Please select exactly 3 services to display");
      return;
    }

    const updatedServices = services.map(s => ({
      ...s,
      isDisplayed: tempSelectedServices.includes(s.id)
    }));

    setServices(updatedServices);
    setIsSelectionMode(false);
    setTempSelectedServices([]);
    toast.success("Display settings saved successfully!");
  };

  const handleStartSelection = () => {
    const currentlyDisplayed = services.filter(s => s.isDisplayed !== false).map(s => s.id);
    setTempSelectedServices(currentlyDisplayed.slice(0, 3));
    setIsSelectionMode(true);
  };

  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setTempSelectedServices([]);
  };

  const openAddDialog = () => {
    setFormData({
      title: "",
      description: "",
      image: null,
      isDisplayed: true,
    });
    setImagePreview(null);
    setIsEditMode(false);
    setSelectedService(null);
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
              <h1 className="text-3xl font-bold text-[#126280]">Manage Services</h1>
            </div>
          </div>
          {/* Services Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Our Services</h2>
                {isSelectionMode && (
                  <span className="text-sm text-gray-600">
                    ({tempSelectedServices.length}/3 selected)
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
                      Add Service
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No services added yet. Add your first service!
                </div>
              ) : (
                services.map((service) => {
                  const isSelected = tempSelectedServices.includes(service.id);
                  return (
                    <Card
                      key={service.id}
                      className={`border shadow-sm transition-all bg-white relative ${isSelectionMode
                        ? isSelected
                          ? 'border-green-500 border-2 shadow-lg cursor-pointer'
                          : 'border-gray-200 hover:border-[#0B6B87] cursor-pointer'
                        : 'border-gray-200 hover:shadow-md'
                        }`}
                      onClick={() => isSelectionMode && handleToggleSelection(service.id)}
                    >
                      <CardContent className="p-0">
                        {/* Image Section */}
                        <div className="relative h-48 bg-gray-200">
                          {service.image_url ? (
                            <img
                              src={service.image_url}
                              alt={service.title}
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
                                {service.isDisplayed !== false ? (
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
                          <h3 className="text-xl font-bold text-[#0B6B87] mb-3">
                            {service.title}
                          </h3>
                          <p className="text-sm text-gray-700 leading-relaxed mb-4">
                            {service.description}
                          </p>

                          {!isSelectionMode && (
                            <div className="flex gap-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(service);
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


      {/* Add/Edit Service Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl bg-white shadow-2xl rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-[#126280]">
                {isEditMode ? 'Edit Service' : 'Add New Service'}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsDialogOpen(false);
                  setIsEditMode(false);
                  setSelectedService(null);
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Service Image
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

              {/* Service Title */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Service Title *
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Machine Wash, Dry Cleaning, Ironing"
                  required
                  className="w-full"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Description *
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe this service..."
                  required
                  rows={4}
                  className="w-full"
                />
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
                  Display this service in main content
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
                    setSelectedService(null);
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
                  {isLoading ? 'Saving...' : isEditMode ? 'Update Service' : 'Add Service'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageServices;
