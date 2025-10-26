import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, FileText, Hash, DollarSign, AlertCircle, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const ItemDetails = ({ item }) => {
  if (!item) return null;

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center space-x-4 py-2">
      <Icon className="h-5 w-5 text-slate-500" />
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-base font-medium">{value}</p>
      </div>
    </div>
  );

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

  return (
    <Card className="p-6 bg-white shadow-md">
      <div className="space-y-6">
        {/* Item Header */}
        <div className="flex flex-col items-center space-y-4">
          <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center">
            <Package className="h-16 w-16 text-slate-400" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold">{item.itemName}</h3>
            <p className="text-sm text-slate-500 mt-1">{item.id}</p>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <Badge className={`${getStockBadgeColor(item.quantity, item.reorderLevel)} text-white`}>
                {getStockStatus(item.quantity, item.reorderLevel)}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Item Information */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-4">
            Item Information
          </h4>
          <Card className="p-4 space-y-2">
            <InfoRow icon={FileText} label="Description" value={item.description} />
            <InfoRow icon={Hash} label="Quantity in Stock" value={item.quantity} />
            <InfoRow icon={DollarSign} label="Unit Price" value={`₱${item.unitPrice.toFixed(2)}`} />
            <InfoRow icon={AlertCircle} label="Reorder Level" value={item.reorderLevel} />
          </Card>
        </div>

        {/* Additional Information */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-4">
            Additional Information
          </h4>
          <Card className="p-4 space-y-2">
            <InfoRow
              icon={Calendar}
              label="Date Added"
              value={new Date(item.dateAdded).toLocaleDateString(undefined, { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            />
            <InfoRow
              icon={DollarSign}
              label="Total Value"
              value={`₱${(item.quantity * item.unitPrice).toFixed(2)}`}
            />
          </Card>
        </div>
      </div>
    </Card>
  );
};

export default ItemDetails;
