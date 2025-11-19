import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Pencil, Trash2, X, Save, Eye, CheckCircle, CreditCard, Upload, Banknote } from "lucide-react";
import Sidebar from "./Sidebar";
import { toast } from "sonner";
import { AuthContext } from "@/context/AuthContext";
import { fetchApi, fetchApiFormData } from "@/lib/api";

const PaymentMethod = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const STATIC_CASH = {
    id: 1,
    name: "Cash",
    accountName: "Cash Payment",
    accountNumber: "N/A",
    description: "Pay with cash upon delivery or pickup",
    isDisplayed: true,
    isStatic: true,
    qrCodeImage: null,
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [tempSelectedMethods, setTempSelectedMethods] = useState([]);
  const { adminData } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    accountName: "",
    accountNumber: "",
    description: "",
    isDisplayed: true,
    qrCodeImage: null,
  });
  const [qrCodePreview, setQrCodePreview] = useState(null);

  const loadPaymentMethodItems = async () => {
    if (!adminData?.shop_id) return;
    setIsLoading(true);
    try {
      const response = await fetchApi(`/api/auth/get-all-paymeth-methods/${adminData.shop_id}`);
      if (!response || response.success === false) {
        throw new Error(response?.message || "Failed to fetch paymenth method items");
      }

      const items = (response.data || []).map((i) => ({
        id: i.pm_id,
        name: i.pm_name,
        accountName: i.account_name,
        accountNumber: i.account_number,
        description: i.description,
        isDisplayed: i.is_displayed === "true",
        isStatic: i.is_static === "true",
        qrCodeImage: i.qrCode_image_url
      }));

      // REMOVE any API item that attempts to use id=1
      // const filteredAPIItems = items.filter(i => i.id !== 1);

      const finalPaymentMethods = [STATIC_CASH, ...items];

      setPaymentMethods(finalPaymentMethods);
    } catch (error) {
      console.error("PaymentMethod - loadPaymentMethodItems error:", error);
      toast.error(error?.message || "Unable to load payment method items");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPaymentMethodItems();
  }, [adminData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQrCodeUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setFormData((prev) => ({ ...prev, qrCodeImage: file }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setQrCodePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveQrCode = () => {
    setFormData((prev) => ({ ...prev, qrCodeImage: null }));
    setQrCodePreview(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name || !formData.accountName || !formData.accountNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (!adminData?.shop_id) {
        throw new Error("Shop information not available. Please reload or login.")
      }
      if (isEditMode) {
        setPaymentMethods(paymentMethods.map(m =>
          m.id === selectedMethod.id
            ? {
              ...m,
              name: formData.name,
              accountName: formData.accountName,
              accountNumber: formData.accountNumber,
              description: formData.description,
              isDisplayed: formData.isDisplayed,
              qrCodeImage: formData.qrCodeImage !== null ? formData.qrCodeImage : m.qrCodeImage
            }
            : m
        ));
        toast.success("Payment method updated successfully");
      } else {
        setIsLoading(true);
        const formDataToSend = new FormData();
        formDataToSend.append("shop_id", adminData.shop_id);
        formDataToSend.append("pm_name", formData.name);
        formDataToSend.append("account_name", formData.accountName);
        formDataToSend.append("account_number", formData.accountNumber);
        formDataToSend.append("description", formData.description);
        formDataToSend.append("is_displayed", formData.isDisplayed ? "true" : "false");
        formDataToSend.append("is_static", "false");

        if (formData.qrCodeImage) {
          formDataToSend.append("image", formData.qrCodeImage);
        }

        const res = await fetchApiFormData('/api/auth/add-payment-method', formDataToSend);

        const newMethod = {
          id: paymentMethods.length > 0 ? Math.max(...paymentMethods.map(m => m.id)) + 1 : 1,
          name: res.data.pm_name,
          accountName: res.data.account_name,
          accountNumber: res.data.account_number,
          description: res.data.description,
          isDisplayed: res.data.is_displayed === "true",
          isStatic: false,
          qrCodeImage: res.data.qrCode_image_url,
        };
        setPaymentMethods([...paymentMethods, newMethod]);
        toast.success("Payment method added successfully");
      }

      setFormData({
        name: "",
        accountName: "",
        accountNumber: "",
        description: "",
        isDisplayed: true,
        qrCodeImage: null,
      });
      setQrCodePreview(null);
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedMethod(null);
    } catch (error) {
      console.error("Add payment method error:", error);
      toast.error(error.message || "Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (method) => {
    if (method.isStatic) {
      toast.error("Cannot edit static payment methods");
      return;
    }
    setSelectedMethod(method);
    setFormData({
      name: method.name,
      accountName: method.accountName,
      accountNumber: method.accountNumber,
      description: method.description || "",
      isDisplayed: method.isDisplayed !== undefined ? method.isDisplayed : true,
      qrCodeImage: method.qrCodeImage || null,
    });
    setQrCodePreview(method.qrCodeImage || null);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleToggleSelection = (methodId) => {
    if (tempSelectedMethods.includes(methodId)) {
      setTempSelectedMethods(tempSelectedMethods.filter(id => id !== methodId));
    } else {
      if (tempSelectedMethods.length >= 3) {
        toast.error("You can only select 3 payment methods to display");
        return;
      }
      setTempSelectedMethods([...tempSelectedMethods, methodId]);
    }
  };

  const handleSaveDisplaySettings = () => {
    if (tempSelectedMethods.length !== 3) {
      toast.error("Please select exactly 3 payment methods to display");
      return;
    }

    const updatedMethods = paymentMethods.map(m => ({
      ...m,
      isDisplayed: tempSelectedMethods.includes(m.id)
    }));

    setPaymentMethods(updatedMethods);
    setIsSelectionMode(false);
    setTempSelectedMethods([]);
    toast.success("Display settings saved successfully!");
  };

  const handleStartSelection = () => {
    const currentlyDisplayed = paymentMethods.filter(m => m.isDisplayed !== false).map(m => m.id);
    setTempSelectedMethods(currentlyDisplayed.slice(0, 3));
    setIsSelectionMode(true);
  };

  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setTempSelectedMethods([]);
  };

  const openAddDialog = () => {
    setFormData({
      name: "",
      accountName: "",
      accountNumber: "",
      description: "",
      isDisplayed: true,
      qrCodeImage: null,
    });
    setQrCodePreview(null);
    setIsEditMode(false);
    setSelectedMethod(null);
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
              <h1 className="text-3xl font-bold text-[#126280]">Payment Methods</h1>
            </div>
            <Button
              onClick={() => setShowPaymentDialog(true)}
              className="bg-[#126280] hover:bg-[#126280]/80"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Content
            </Button>
          </div>

          {/* Payment Methods Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Available Payment Methods</h2>
                {isSelectionMode && (
                  <span className="text-sm text-gray-600">
                    ({tempSelectedMethods.length}/3 selected)
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
                    {paymentMethods.length < 3 && (
                      <Button
                        onClick={openAddDialog}
                        className="bg-[#0B6B87] hover:bg-[#0B6B87]/90 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Payment Method
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Payment Methods Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paymentMethods.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No payment methods added yet. Add your first payment method!
                </div>
              ) : (
                paymentMethods.map((method) => {
                  const isSelected = tempSelectedMethods.includes(method.id);
                  return (
                    <Card
                      key={method.id}
                      className={`border shadow-sm transition-all bg-white relative ${isSelectionMode
                        ? isSelected
                          ? 'border-green-500 border-2 shadow-lg cursor-pointer'
                          : 'border-gray-200 hover:border-[#0B6B87] cursor-pointer'
                        : 'border-gray-200 hover:shadow-md'
                        }`}
                      onClick={() => isSelectionMode && handleToggleSelection(method.id)}
                    >
                      <CardContent className="p-6">
                        {/* Display Status Badge or Selection Checkbox */}
                        <div className="absolute top-3 right-3 flex gap-2">
                          {method.isStatic && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                              Static
                            </span>
                          )}
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
                              {method.isDisplayed !== false ? (
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
                          {method.name === "Cash" ? (
                            <Banknote className="h-8 w-8 text-[#0B6B87] flex-shrink-0 mt-1" />
                          ) : (
                            <CreditCard className="h-8 w-8 text-[#0B6B87] flex-shrink-0 mt-1" />
                          )}
                          <div className="flex-1">
                            <h3 className="font-bold text-xl text-[#0B6B87] mb-2">
                              {method.name}
                            </h3>
                            <div className="space-y-1 text-sm text-gray-700">
                              <p><span className="font-medium">Account Name:</span> {method.accountName}</p>
                              <p><span className="font-medium">Account Number:</span> {method.accountNumber}</p>
                              {method.description && !method.qrCodeImage && (
                                <p className="text-gray-600 mt-2">{method.description}</p>
                              )}
                              {method.qrCodeImage && (
                                <div className="mt-3">
                                  <p className="font-medium mb-2">QR Code:</p>
                                  <img
                                    src={method.qrCodeImage}
                                    alt="QR Code"
                                    className="w-40 h-40 object-contain border-2 border-gray-200 rounded-lg"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {!isSelectionMode && (
                          <div className="flex gap-3 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(method);
                              }}
                              className={`flex-1 text-[#0B6B87] border-[#0B6B87] hover:bg-[#0B6B87] hover:text-white ${method.isStatic ? 'opacity-50 cursor-not-allowed' : ''}`}
                              disabled={method.isStatic}
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

      {/* View Payment Methods Content Dialog */}
      {showPaymentDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl bg-white shadow-2xl rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b bg-[#0B6B87]">
              <h2 className="text-2xl font-bold text-white">Payment Methods</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPaymentDialog(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-8">
              <h1 className="text-4xl font-bold text-[#0B6B87] mb-4">Payment Options</h1>
              <p className="text-gray-600 mb-8">Choose your preferred payment method below</p>

              {/* Payment Methods */}
              <div className="space-y-6">
                {paymentMethods.filter(m => m.isDisplayed !== false).map((method) => (
                  <div key={method.id} className="flex items-start gap-4 p-6 bg-gray-50 rounded-lg border-2 border-[#0B6B87]">
                    {method.name === "Cash" ? (
                      <Banknote className="h-8 w-8 text-[#0B6B87] flex-shrink-0 mt-1" />
                    ) : (
                      <CreditCard className="h-8 w-8 text-[#0B6B87] flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-2xl text-[#0B6B87] mb-3">
                        {method.name}
                      </h3>
                      <div className="space-y-2 text-gray-700">
                        <p className="text-lg">
                          <span className="font-semibold">Account Name:</span> {method.accountName}
                        </p>
                        <p className="text-lg">
                          <span className="font-semibold">Account Number:</span> {method.accountNumber}
                        </p>
                        {method.description && !method.qrCodeImage && (
                          <p className="text-gray-600 mt-3">{method.description}</p>
                        )}
                        {method.qrCodeImage && (
                          <div className="mt-4">
                            <p className="font-semibold mb-3 text-lg">QR Code:</p>
                            <img
                              src={method.qrCodeImage}
                              alt="Payment QR Code"
                              className="w-64 h-64 object-contain border-2 border-[#0B6B87] rounded-lg shadow-md"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Close Button */}
              <div className="flex justify-end mt-8 pt-6 border-t">
                <Button
                  onClick={() => setShowPaymentDialog(false)}
                  className="bg-[#0B6B87] hover:bg-[#0B6B87]/90"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Payment Method Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl bg-white shadow-2xl rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-[#126280]">
                {isEditMode ? 'Edit Payment Method' : 'Add New Payment Method'}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsDialogOpen(false);
                  setIsEditMode(false);
                  setSelectedMethod(null);
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Payment Method Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Payment Method Name *
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., GCash, PayMaya, Bank Transfer"
                  required
                  className="w-full"
                />
              </div>

              {/* Account Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Account Name *
                </label>
                <Input
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleChange}
                  placeholder="e.g., Laundry Shop"
                  required
                  className="w-full"
                />
              </div>

              {/* Account Number */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Account Number *
                </label>
                <Input
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="e.g., 09123456789 or 1234567890"
                  required
                  className="w-full"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Description / Instructions
                </label>
                <Input
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="e.g., Scan QR code or send to mobile number"
                  className="w-full"
                />
              </div>

              {/* QR Code Upload */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  QR Code Image (Optional)
                </label>
                <div className="space-y-3">
                  {qrCodePreview ? (
                    <div className="relative">
                      <img
                        src={qrCodePreview}
                        alt="QR Code Preview"
                        className="w-48 h-48 object-contain border-2 border-gray-300 rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveQrCode}
                        className="mt-2"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove QR Code
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#126280] transition-colors">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <label htmlFor="qr-upload" className="cursor-pointer">
                        <span className="text-sm text-gray-600">
                          Click to upload QR code image
                        </span>
                        <input
                          id="qr-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleQrCodeUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        PNG, JPG, or JPEG (Max 5MB)
                      </p>
                    </div>
                  )}
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
                  Display this payment method in main content
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
                    setSelectedMethod(null);
                    setQrCodePreview(null);
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
                  {isLoading ? 'Saving...' : isEditMode ? 'Update Payment Method' : 'Add Payment Method'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethod;
