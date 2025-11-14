import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Pencil, Trash2, X, Save, CheckCircle, Eye } from "lucide-react";
import Sidebar from "./Sidebar";
import { toast } from "sonner";
import { AuthContext } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";

const ManageAbout = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [aboutData, setAboutData] = useState({
    title: "YOUR TRUSTED PARTNER IN LAUNDRY CARE",
    subtitle: "We are professional and committed to providing quality laundry and dry cleaning services.",
    description: "We are professional and committed to providing quality laundry and dry cleaning services.",
    image: null,
  });
  const [features, setFeatures] = useState([

  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [featureImagePreview, setFeatureImagePreview] = useState(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [tempSelectedFeatures, setTempSelectedFeatures] = useState([]);
  const { adminData } = useContext(AuthContext);

  const loadAboutItems = async () => {
    if (!adminData?.shop_id) return;
    setIsLoading(true);
    try {
      const res = await fetchApi(`/api/auth/get-shop-about/${adminData.shop_id}`);
      if (!res || res.success === false) {
        throw new Error(res?.message || "Failed to fetch about items");
      }

      const items = (res.data || []).map((i) => ({
        id: i.about_id,
        title: i.title,
        description: i.description,
        isDisplayed: i.is_displayed === "true",
      }));

      setFeatures(items);
    } catch (error) {
      console.error("ManageAbout - loadAboutItems error:", error);
      toast.error(error?.message || "Unable to load about items");
      setFeatures([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAboutItems();
  }, [adminData]);
  const [featureFormData, setFeatureFormData] = useState({
    title: "",
    description: "",
    icon: "CheckCircle",
    image: null,
    isDisplayed: false,
  });

  const handleFeatureChange = (event) => {
    const { name, value } = event.target;
    setFeatureFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeatureImageChange = (event) => {
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

      setFeatureFormData((prev) => ({ ...prev, image: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setFeatureImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const canSetDisplayed = (desired = true, editingFeatureId = null) => {
    if (!desired) return true;
 
    const displayedCount = features.filter(f => f.isDisplayed === true || f.isDisplayed === "true").length;
    if (editingFeatureId) {

      const currentlyDisplayed = features.some(
        f => f.id === editingFeatureId && (f.isDisplayed === true || f.isDisplayed === "true")
      );
      if (currentlyDisplayed) return true;
 
    }
    return displayedCount < 3;
  };

  const handleFeatureSubmit = async (event) => {
    event.preventDefault();

    if (!featureFormData.title || !featureFormData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      if (!adminData?.shop_id) {
        throw new Error("Shop information not available. Please reload or login.");
      }

      const wantDisplay = !!featureFormData.isDisplayed;
      const editingId = isEditMode && selectedFeature ? selectedFeature.id : null;
      if (!canSetDisplayed(wantDisplay, editingId)) {
        setFeatureFormData(prev => ({ ...prev, isDisplayed: false }));
        toast.error("Only 3 features can be displayed. Unselect another one first. This feature will be saved as Hidden.");
      }


      const payload = {
        title: featureFormData.title,
        description: featureFormData.description,
        is_displayed: featureFormData.isDisplayed ? "true" : "false",
      };

      let response;

      if (isEditMode && selectedFeature) {

        response = await fetchApi(`/api/auth/edit-shop-about/${selectedFeature.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {

        response = await fetchApi("/api/auth/insert-shop-about", {
          method: "POST",
          body: JSON.stringify({
            shop_id: adminData.shop_id,
            ...payload,
          }),
        });
      }

      if (!response || response.success === false) {
        const msg = response?.message || "Failed to save feature";
        toast.error(msg);
        throw new Error(msg);
      }

      const result = response.data || {};

      if (isEditMode && selectedFeature) {

        setFeatures((prev) =>
          prev.map((f) =>
            f.id === selectedFeature.id
              ? {
                ...f,
                title: payload.title,
                description: payload.description,
                isDisplayed: payload.is_displayed === "true",
              }
              : f
          )
        );
        toast.success("Feature updated successfully!");
      } else {
        
        const newFeature = {
          id: result.about_id ?? (features.length > 0 ? Math.max(...features.map(f => f.id)) + 1 : 1),
          title: payload.title,
          description: payload.description,
          isDisplayed: payload.is_displayed === "true",
        };
        setFeatures((prev) => [...prev, newFeature]);
        toast.success("Feature added successfully!");
      }

      setFeatureFormData({
        title: "",
        description: "",
        icon: "CheckCircle",
        image: null,
        isDisplayed: false,
      });
      setFeatureImagePreview(null);
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedFeature(null);
    } catch (error) {
      console.error("ManageAbout - handleFeatureSubmit error:", error);
      toast.error(error?.message || "Something went wrong while saving the feature");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditFeature = (feature) => {
    setSelectedFeature(feature);
    setFeatureFormData({
      title: feature.title,
      description: feature.description,
      icon: feature.icon || "CheckCircle",
      image: null,
      isDisplayed: feature.isDisplayed === true || feature.isDisplayed === "true",
    });
    setFeatureImagePreview(feature.image_url || null);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };


  const handleToggleSelection = (featureId) => {
    if (tempSelectedFeatures.includes(featureId)) {
      setTempSelectedFeatures(tempSelectedFeatures.filter(id => id !== featureId));
    } else {
      if (tempSelectedFeatures.length >= 3) {
        toast.error("You can only select 3 features to display");
        return;
      }
      setTempSelectedFeatures([...tempSelectedFeatures, featureId]);
    }
  };

  const handleSaveDisplaySettings = async () => {
    if (tempSelectedFeatures.length !== 3) {
      toast.error("Please select exactly 3 features to display");
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetchApi(`/api/auth/update-display-settings/${adminData.shop_id}`, {
        method: "PUT",
        body: JSON.stringify({ displayedFeatureIds: tempSelectedFeatures }),
      });

      if (!res || res.success === false) {
        throw new Error(res?.message || "Failed to update display settings");
      }

      // Update local state
      const updatedFeatures = features.map(f => ({
        ...f,
        isDisplayed: tempSelectedFeatures.includes(f.id)
      }));

      setFeatures(updatedFeatures);
      setIsSelectionMode(false);
      setTempSelectedFeatures([]);
      toast.success("Display settings saved successfully!");
    } catch (error) {
      console.error("handleSaveDisplaySettings error:", error);
      toast.error(error.message || "Failed to save display settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSelection = () => {
    // Initialize with currently displayed features
    const currentlyDisplayed = features.filter(f => f.isDisplayed !== false).map(f => f.id);
    setTempSelectedFeatures(currentlyDisplayed.slice(0, 3));
    setIsSelectionMode(true);
  };

  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setTempSelectedFeatures([]);
  };

  const openAddDialog = () => {
    setFeatureFormData({
      title: "",
      description: "",
      icon: "CheckCircle",
      image: null,
      isDisplayed: false,
    });
    setFeatureImagePreview(null);
    setIsEditMode(false);
    setSelectedFeature(null);
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
              <h1 className="text-3xl font-bold text-[#126280]">About Us</h1>
            </div>
            {/* View Content button removed */}
          </div>

          {/* Features Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Features</h2>
                {isSelectionMode && (
                  <span className="text-sm text-gray-600">
                    ({tempSelectedFeatures.length}/3 selected)
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
                      Add Feature
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No features added yet. Add your first feature!
                </div>
              ) : (
                features.map((feature) => {
                  const isSelected = tempSelectedFeatures.includes(feature.id);
                  return (
                    <Card
                      key={feature.id}
                      className={`border shadow-sm transition-all bg-white relative ${isSelectionMode
                        ? isSelected
                          ? 'border-green-500 border-2 shadow-lg cursor-pointer'
                          : 'border-gray-200 hover:border-[#0B6B87] cursor-pointer'
                        : 'border-gray-200 hover:shadow-md'
                        }`}
                      onClick={() => isSelectionMode && handleToggleSelection(feature.id)}
                    >
                      <CardContent className="p-6">
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
                              {feature.isDisplayed !== false ? (
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

                        <div className="flex items-start gap-3 mb-4 pr-20">
                          <CheckCircle className="h-6 w-6 text-[#0B6B87] flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-[#0B6B87] mb-3">
                              {feature.title}
                            </h3>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                        {!isSelectionMode && (
                          <div className="flex gap-3 mt-6">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditFeature(feature);
                              }}
                              className="flex-1 text-[#0B6B87] border-[#0B6B87] hover:bg-[#0B6B87] hover:text-white"
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* View About Content Dialog */}
      {showAboutDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl bg-white shadow-2xl rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b bg-[#0B6B87]">
              <h2 className="text-2xl font-bold text-white">About Us Content</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAboutDialog(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-8">
              {/* Main Image */}
              {imagePreview && (
                <div className="mb-6">
                  <img
                    src={imagePreview}
                    alt="About Us"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl font-bold text-[#0B6B87] mb-4">
                {aboutData.title}
              </h1>

              {/* Subtitle */}
              {aboutData.subtitle && (
                <p className="text-lg text-gray-700 mb-4">
                  {aboutData.subtitle}
                </p>
              )}

              {/* Description */}
              <p className="text-gray-600 mb-8 leading-relaxed">
                {aboutData.description}
              </p>

              {/* Features */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Features</h2>
                <div className="space-y-4">
                  {features.filter(f => f.isDisplayed !== false).map((feature) => (
                    <div key={feature.id} className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-[#0B6B87] flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-lg text-[#0B6B87] mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end mt-8 pt-6 border-t">
                <Button
                  onClick={() => setShowAboutDialog(false)}
                  className="bg-[#0B6B87] hover:bg-[#0B6B87]/90"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Feature Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl bg-white shadow-2xl rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-[#126280]">
                {isEditMode ? 'Edit Feature' : 'Add New Feature'}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsDialogOpen(false);
                  setIsEditMode(false);
                  setSelectedFeature(null);
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleFeatureSubmit} className="p-6 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Feature Image
                </label>
                <div className="flex flex-col items-center gap-4">
                  {featureImagePreview && (
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={featureImagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setFeatureImagePreview(null);
                          setFeatureFormData(prev => ({ ...prev, image: null }));
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
                      onChange={handleFeatureImageChange}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: JPG, PNG, GIF (Max 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature Title */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Feature Title *
                </label>
                <Input
                  name="title"
                  value={featureFormData.title}
                  onChange={handleFeatureChange}
                  placeholder="e.g., Personalized Experience, Quality, Convenience"
                  required
                  className="w-full"
                />
              </div>

              {/* Feature Description */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Description *
                </label>
                <Textarea
                  name="description"
                  value={featureFormData.description}
                  onChange={handleFeatureChange}
                  placeholder="Describe this feature..."
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
                  checked={featureFormData.isDisplayed}
                  onChange={(e) => {
                    const newValue = e.target.checked;
                    const displayedCount = features.filter(
                      f =>
                        (f.isDisplayed === true || f.isDisplayed === "true") &&
                        (!isEditMode || f.id !== selectedFeature?.id)
                    ).length;

                    if (!canSetDisplayed(newValue, selectedFeature?.id)) {
                      toast.error("You already have 3 displayed features. Uncheck another one first.");
                      return;
                    }
                    setFeatureFormData(prev => ({ ...prev, isDisplayed: newValue }));
                  }}

                  className="w-4 h-4 text-[#126280] border-gray-300 rounded focus:ring-[#126280]"
                />
                <label htmlFor="isDisplayed" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Display this feature in main content
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
                    setSelectedFeature(null);
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
                  {isLoading ? 'Saving...' : isEditMode ? 'Update Feature' : 'Add Feature'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAbout;
