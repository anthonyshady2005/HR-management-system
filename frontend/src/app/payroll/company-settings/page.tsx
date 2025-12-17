"use client";

import { useEffect, useState } from "react";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

import { useAuth } from "@/providers/auth-provider";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types
interface CompanySettings {
  _id: string;
  payDate: string | Date;
  timeZone: string;
  currency: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CompanySettingsFormData {
  payDate: string;
  timeZone: string;
  currency: string;
}

// Common time zones
const TIME_ZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Africa/Cairo",
];

// Common currencies
const CURRENCIES = [
  { code: "EGP", name: "Egyptian Pound" },
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "AED", name: "UAE Dirham" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "AUD", name: "Australian Dollar" },
];

export default function CompanySettingsPage() {
  const { currentRole } = useAuth();

  if (currentRole !== "System Admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h1 className="text-3xl font-bold text-slate-200 mb-4">Unauthorized</h1>
        <p className="text-slate-400 max-w-md">
          You do not have permission to access this resource. Required role: System Admin.
        </p>
      </div>
    );
  }

  const [settings, setSettings] = useState<CompanySettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<CompanySettings | null>(null);

  // Form states
  const [formData, setFormData] = useState<CompanySettingsFormData>({
    payDate: "",
    timeZone: "",
    currency: "EGP",
  });

  // Fetch Company Settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/payroll-configuration/company-settings");
      setSettings(res.data);
    } catch (error) {
      console.error("Failed to fetch company settings:", error);
      toast.error("Failed to fetch company settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Handlers
  const handleCreate = async () => {
    if (!formData.payDate || !formData.timeZone || !formData.currency) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await api.post("/payroll-configuration/company-settings", {
        payDate: new Date(formData.payDate),
        timeZone: formData.timeZone,
        currency: formData.currency,
      });
      toast.success("Company Settings created successfully");
      setIsCreateOpen(false);
      resetForm();
      fetchSettings();
    } catch (error) {
      console.error("Failed to create company settings:", error);
      toast.error("Failed to create company settings");
    }
  };

  const handleUpdate = async () => {
    if (!selectedSetting || !formData.payDate || !formData.timeZone || !formData.currency) return;

    try {
      await api.patch(`/payroll-configuration/company-settings/${selectedSetting._id}`, {
        payDate: new Date(formData.payDate),
        timeZone: formData.timeZone,
        currency: formData.currency,
      });
      toast.success("Company Settings updated successfully");
      setIsEditOpen(false);
      resetForm();
      fetchSettings();
    } catch (error) {
      console.error("Failed to update company settings:", error);
      toast.error("Failed to update company settings");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete these company settings?")) return;

    try {
      await api.delete(`/payroll-configuration/company-settings/${id}`);
      toast.success("Company Settings deleted successfully");
      fetchSettings();
    } catch (error) {
      console.error("Failed to delete company settings:", error);
      toast.error("Failed to delete company settings");
    }
  };

  const openEdit = (setting: CompanySettings) => {
    setSelectedSetting(setting);
    const payDate = setting.payDate 
      ? new Date(setting.payDate).toISOString().split("T")[0]
      : "";
    setFormData({
      payDate,
      timeZone: setting.timeZone,
      currency: setting.currency,
    });
    setIsEditOpen(true);
  };

  const openView = async (setting: CompanySettings) => {
    try {
      const res = await api.get(`/payroll-configuration/company-settings/${setting._id}`);
      setSelectedSetting(res.data);
      setIsViewOpen(true);
    } catch (error) {
      setSelectedSetting(setting);
      setIsViewOpen(true);
    }
  };

  const resetForm = () => {
    setFormData({
      payDate: "",
      timeZone: "",
      currency: "EGP",
    });
    setSelectedSetting(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Company Settings
          </h1>
          <p className="text-slate-400 mt-1">
            Manage your company-wide payroll settings and configurations
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-lg shadow-emerald-900/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Settings
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Skeleton / Loading State
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-48 animate-pulse bg-white/5 border-white/10" />
          ))
        ) : settings.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            No company settings found. Create one to get started.
          </div>
        ) : (
          settings.map((setting) => (
            <Card
              key={setting._id}
              className="group backdrop-blur-xl bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold text-white truncate pr-4">
                  Company Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Pay Date</p>
                    <div className="text-lg font-semibold text-slate-200">
                      {setting.payDate 
                        ? new Date(setting.payDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Not set"}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Time Zone</p>
                    <div className="text-sm font-medium text-slate-300">
                      {setting.timeZone}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Currency</p>
                    <div className="text-lg font-bold text-emerald-400">
                      {setting.currency}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openView(setting)}
                  className="hover:bg-blue-500/20 hover:text-blue-400 text-slate-400"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(setting)}
                  className="hover:bg-amber-500/20 hover:text-amber-400 text-slate-400"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(setting._id)}
                  className="hover:bg-red-500/20 hover:text-red-400 text-slate-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Company Settings</DialogTitle>
            <DialogDescription className="text-slate-400">
              Add new company-wide payroll settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="payDate">Pay Date</Label>
              <Input
                id="payDate"
                type="date"
                value={formData.payDate}
                onChange={(e) =>
                  setFormData({ ...formData, payDate: e.target.value })
                }
                className="bg-slate-950 border-slate-800 focus:border-emerald-500/50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timeZone">Time Zone</Label>
              <Select
                value={formData.timeZone}
                onValueChange={(value) =>
                  setFormData({ ...formData, timeZone: value })
                }
              >
                <SelectTrigger className="bg-slate-950 border-slate-800 focus:border-emerald-500/50">
                  <SelectValue placeholder="Select time zone" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white max-h-[300px]">
                  {TIME_ZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData({ ...formData, currency: value })
                }
              >
                <SelectTrigger className="bg-slate-950 border-slate-800 focus:border-emerald-500/50">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {CURRENCIES.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      {curr.code} - {curr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              className="border-slate-700 hover:bg-slate-800 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Create Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Company Settings</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update company-wide payroll settings
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-payDate">Pay Date</Label>
              <Input
                id="edit-payDate"
                type="date"
                value={formData.payDate}
                onChange={(e) =>
                  setFormData({ ...formData, payDate: e.target.value })
                }
                className="bg-slate-950 border-slate-800 focus:border-amber-500/50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-timeZone">Time Zone</Label>
              <Select
                value={formData.timeZone}
                onValueChange={(value) =>
                  setFormData({ ...formData, timeZone: value })
                }
              >
                <SelectTrigger className="bg-slate-950 border-slate-800 focus:border-amber-500/50">
                  <SelectValue placeholder="Select time zone" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white max-h-[300px]">
                  {TIME_ZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData({ ...formData, currency: value })
                }
              >
                <SelectTrigger className="bg-slate-950 border-slate-800 focus:border-amber-500/50">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {CURRENCIES.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      {curr.code} - {curr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              className="border-slate-700 hover:bg-slate-800 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Update Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Company Settings Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-4">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider">Pay Date</label>
                <p className="text-lg font-medium text-slate-200">
                  {selectedSetting?.payDate 
                    ? new Date(selectedSetting.payDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Not set"}
                </p>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider">Time Zone</label>
                <p className="text-lg font-medium text-slate-200">{selectedSetting?.timeZone}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider">Currency</label>
                <p className="text-2xl font-bold text-emerald-400">
                  {selectedSetting?.currency}
                </p>
              </div>
              {selectedSetting?.createdAt && (
                <div className="border-t border-slate-800 pt-4">
                  <label className="text-xs text-slate-500 uppercase tracking-wider">Created At</label>
                  <p className="text-sm text-slate-400">
                    {new Date(selectedSetting.createdAt).toLocaleString()}
                  </p>
                </div>
              )}
              {selectedSetting?.updatedAt && (
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider">Updated At</label>
                  <p className="text-sm text-slate-400">
                    {new Date(selectedSetting.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewOpen(false)}
              className="w-full border-slate-700 hover:bg-slate-800 text-slate-300"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

