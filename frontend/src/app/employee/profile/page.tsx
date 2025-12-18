"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { useAuth } from "@/providers/auth-provider";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Save,
  X,
  Phone,
  MapPin,
  Briefcase,
  Building,
  Calendar,
  FileText,
  User,
  Shield,
  Award,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "../components/StatusBadge";
import { ChangeRequestDialog } from "../components/ChangeRequestDialog";
import { getMyProfile, updateMyProfile, getMyChangeRequests } from "../api";
import type { EmployeeProfile, UpdateSelfProfileDto, Position, Department, PayGrade, EmployeeProfileChangeRequest } from "../types";
import { getPopulatedValue } from "../api";
import { ProfileChangeStatus } from "../types";

export default function EmployeeProfilePage() {
  const { status, user, clearAuth } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [myRequests, setMyRequests] = useState<EmployeeProfileChangeRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Editable fields state
  const [editData, setEditData] = useState<UpdateSelfProfileDto>({
    mobilePhone: "",
    personalEmail: "",
    biography: "",
    profilePictureUrl: "",
    address: {
      city: "",
      streetAddress: "",
      country: "",
    },
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
      return;
    }

    if (status === "authenticated") {
      loadProfile();
    }
  }, [status, router]);

  const loadChangeRequests = async () => {
    try {
      setLoadingRequests(true);
      const result = await getMyChangeRequests(1, 10);
      setMyRequests(result.data || []);
    } catch (error) {
      console.error("Failed to load change requests:", error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getMyProfile();
      setProfile(data);
      // Also load change requests
      loadChangeRequests();
      // Initialize edit data
      setEditData({
        mobilePhone: data.mobilePhone || "",
        personalEmail: data.personalEmail || "",
        biography: data.biography || "",
        profilePictureUrl: data.profilePictureUrl || "",
        address: {
          city: data.address?.city || "",
          streetAddress: data.address?.streetAddress || "",
          country: data.address?.country || "",
        },
      });
    } catch (error) {
      console.error("Failed to load profile:", error);
      if (
        isAxiosError(error) &&
        (error.response?.status === 401 || error.response?.status === 403)
      ) {
        clearAuth();
        router.replace("/auth/login");
        toast.error("Session expired. Please sign in again.");
        return;
      }
      const message = isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "Failed to load profile";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    // Validate phone number
    if (editData.mobilePhone) {
      const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
      if (!phoneRegex.test(editData.mobilePhone)) {
        toast.error("Invalid phone number format");
        return;
      }
    }

    // Validate email
    if (editData.personalEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editData.personalEmail)) {
        toast.error("Invalid email format");
        return;
      }
    }

    try {
      setSaving(true);
      console.log("Saving profile with data:", editData);
      const updated = await updateMyProfile(editData);
      console.log("Received updated profile from API:", updated);

      // Update profile state with new data
      setProfile(updated);

      // Update editData state to reflect saved values
      setEditData({
        mobilePhone: updated.mobilePhone || "",
        personalEmail: updated.personalEmail || "",
        biography: updated.biography || "",
        profilePictureUrl: updated.profilePictureUrl || "",
        address: {
          city: updated.address?.city || "",
          streetAddress: updated.address?.streetAddress || "",
          country: updated.address?.country || "",
        },
      });

      setEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      if (
        isAxiosError(error) &&
        (error.response?.status === 401 || error.response?.status === 403)
      ) {
        clearAuth();
        router.replace("/auth/login");
        toast.error("Session expired. Please sign in again.");
        return;
      }
      const message = isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "Failed to update profile";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!profile) return;
    // Reset to current profile data
    setEditData({
      mobilePhone: profile.mobilePhone || "",
      personalEmail: profile.personalEmail || "",
      biography: profile.biography || "",
      profilePictureUrl: profile.profilePictureUrl || "",
      address: {
        city: profile.address?.city || "",
        streetAddress: profile.address?.streetAddress || "",
        country: profile.address?.country || "",
      },
    });
    setEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setEditData({
        ...editData,
        profilePictureUrl: base64String,
      });
      toast.success("Image uploaded successfully");
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
    };
    reader.readAsDataURL(file);
  };

  if (status !== "authenticated" || !user || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-slate-400">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-slate-400">Failed to load profile</p>
        </div>
      </div>
    );
  }

  const position = (profile.primaryPositionId || profile.positionId) as Position | undefined;
  const department = (profile.primaryDepartmentId || profile.departmentId) as Department | undefined;
  const payGrade = profile.payGradeId as PayGrade | undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold">My Profile</h1>
              <p className="text-slate-400 text-sm">
                View and update your information
              </p>
            </div>
          </div>
          {!editing ? (
            <div className="flex gap-2">
              <ChangeRequestDialog onSuccess={() => { loadProfile(); loadChangeRequests(); }} />
              <Button onClick={() => setEditing(true)} variant="secondary">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                variant="default"
                size="sm"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Summary */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <div className="flex flex-col items-center">
                  <Avatar className="w-32 h-32 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 mb-4">
                    {profile.profilePictureUrl ? (
                      <Image
                        src={profile.profilePictureUrl}
                        alt={profile.fullName ? `${profile.fullName} profile picture` : "Employee profile picture"}
                        width={128}
                        height={128}
                        unoptimized
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-4xl font-bold text-white">
                        {profile.firstName?.[0]}
                        {profile.lastName?.[0]}
                      </div>
                    )}
                  </Avatar>
                  <h2 className="text-2xl font-bold mb-1">
                    {profile.fullName}
                  </h2>
                  <p className="text-slate-400 text-sm mb-3">
                    ID: {profile.employeeId}
                  </p>
                  <StatusBadge status={profile.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {position && (
                  <div className="flex items-center gap-3 text-sm">
                    <Briefcase className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-slate-400">Position</p>
                      <p className="font-medium">
                        {getPopulatedValue(position, "title")}
                      </p>
                    </div>
                  </div>
                )}
                {department && (
                  <div className="flex items-center gap-3 text-sm">
                    <Building className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-slate-400">Department</p>
                      <p className="font-medium">
                        {getPopulatedValue(department, "name")}
                      </p>
                    </div>
                  </div>
                )}
                {payGrade && (
                  <div className="flex items-center gap-3 text-sm">
                    <Award className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-slate-400">Pay Grade</p>
                      <p className="font-medium">
                        {getPopulatedValue(payGrade, "gradeName")}
                      </p>
                    </div>
                  </div>
                )}
                {profile.dateOfHire && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-slate-400">Hire Date</p>
                      <p className="font-medium">
                        {new Date(profile.dateOfHire).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Personal Details */}
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5" />
                  Personal Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {profile.nationalId && (
                  <div>
                    <p className="text-slate-400 text-xs">National ID</p>
                    <p className="text-white font-mono">{profile.nationalId}</p>
                  </div>
                )}
                {profile.dateOfBirth && (
                  <div>
                    <p className="text-slate-400 text-xs">Date of Birth</p>
                    <p className="text-white">
                      {new Date(profile.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {profile.gender && (
                  <div>
                    <p className="text-slate-400 text-xs">Gender</p>
                    <p className="text-white">{profile.gender}</p>
                  </div>
                )}
                {profile.maritalStatus && (
                  <div>
                    <p className="text-slate-400 text-xs">Marital Status</p>
                    <p className="text-white">{profile.maritalStatus}</p>
                  </div>
                )}
                <p className="text-xs text-slate-500 pt-2 border-t border-white/10">
                  <Shield className="w-3 h-3 inline mr-1" />
                  Submit a change request to update
                </p>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            {profile.lastAppraisalRecord && (
              <Card className="bg-white/5 border-white/10 text-white mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Latest Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-slate-400 text-sm">Overall Rating</p>
                    <p className="text-lg font-semibold">
                      {profile.lastAppraisalRecord.overallRatingLabel || "—"}
                    </p>
                  </div>
                  {profile.lastAppraisalRecord.totalScore !== undefined && (
                    <div>
                      <p className="text-slate-400 text-sm">Score</p>
                      <p className="text-lg font-semibold">
                        {profile.lastAppraisalRecord.totalScore}
                      </p>
                    </div>
                  )}
                  {profile.lastAppraisalRecord.createdAt && (
                    <div>
                      <p className="text-slate-400 text-sm">Date</p>
                      <p className="text-sm">
                        {new Date(
                          profile.lastAppraisalRecord.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Editable Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Information
                  {editing && (
                    <span className="text-xs text-green-400 ml-2">
                      (Editable)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300 mb-2 block">
                      Personal Email
                    </Label>
                    {editing ? (
                      <Input
                        type="email"
                        value={editData.personalEmail}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            personalEmail: e.target.value,
                          })
                        }
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="your.email@example.com"
                      />
                    ) : (
                      <p className="text-white">
                        {profile.personalEmail || "—"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-slate-300 mb-2 block">
                      Mobile Phone
                    </Label>
                    {editing ? (
                      <Input
                        type="tel"
                        value={editData.mobilePhone}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            mobilePhone: e.target.value,
                          })
                        }
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="+1 234 567 8900"
                      />
                    ) : (
                      <p className="text-white">
                        {profile.mobilePhone || "—"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-slate-300 mb-2 block">
                      Work Email
                    </Label>
                    <p className="text-slate-400 text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      {profile.workEmail || "—"}
                      <span className="text-xs">(Read-only)</span>
                    </p>
                  </div>
                  <div>
                    <Label className="text-slate-300 mb-2 block">
                      Work Phone
                    </Label>
                    <p className="text-slate-400 text-sm">
                      {profile.workPhone || "—"}
                      <span className="text-xs ml-2">(Read-only)</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Address
                  {editing && (
                    <span className="text-xs text-green-400 ml-2">
                      (Editable)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300 mb-2 block">City</Label>
                    {editing ? (
                      <Input
                        value={editData.address?.city || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            address: {
                              ...editData.address,
                              city: e.target.value,
                            },
                          })
                        }
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="City"
                      />
                    ) : (
                      <p className="text-white">
                        {profile.address?.city || "—"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-slate-300 mb-2 block">
                      Country
                    </Label>
                    {editing ? (
                      <Input
                        value={editData.address?.country || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            address: {
                              ...editData.address,
                              country: e.target.value,
                            },
                          })
                        }
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="Country"
                      />
                    ) : (
                      <p className="text-white">
                        {profile.address?.country || "—"}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-slate-300 mb-2 block">
                      Street Address
                    </Label>
                    {editing ? (
                      <Input
                        value={editData.address?.streetAddress || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            address: {
                              ...editData.address,
                              streetAddress: e.target.value,
                            },
                          })
                        }
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="Street Address"
                      />
                    ) : (
                      <p className="text-white">
                        {profile.address?.streetAddress || "—"}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Biography */}
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Biography
                  {editing && (
                    <span className="text-xs text-green-400 ml-2">
                      (Editable)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <Textarea
                    value={editData.biography}
                    onChange={(e) =>
                      setEditData({ ...editData, biography: e.target.value })
                    }
                    className="bg-white/5 border-white/10 text-white min-h-[120px]"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-white whitespace-pre-wrap">
                    {profile.biography || "No biography added yet."}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Profile Picture Upload */}
            {editing && (
              <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Picture
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-slate-300 mb-2 block">
                      Upload Image (Max 2MB)
                    </Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="bg-white/5 border-white/10 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 cursor-pointer"
                    />
                  </div>
                  {editData.profilePictureUrl && (
                    <div className="mt-4">
                      <Label className="text-slate-300 mb-2 block">Preview</Label>
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-white/10">
                        <Image
                          src={editData.profilePictureUrl}
                          alt="Profile picture preview"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setEditData({ ...editData, profilePictureUrl: "" })
                        }
                        className="mt-2 text-red-400 hover:text-red-300"
                      >
                        Remove Image
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Employment Details (Read-only) */}
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Employment Details (Read-only)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {/* Personal Details */}
                  <div className="md:col-span-2">
                    <p className="text-slate-400 font-semibold mb-3 uppercase text-xs tracking-wider">
                      Personal Information
                    </p>
                  </div>
                  {profile.nationalId && (
                    <div>
                      <p className="text-slate-400">National ID</p>
                      <p className="text-white font-mono">{profile.nationalId}</p>
                    </div>
                  )}
                  {profile.dateOfBirth && (
                    <div>
                      <p className="text-slate-400">Date of Birth</p>
                      <p className="text-white">
                        {new Date(profile.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {profile.gender && (
                    <div>
                      <p className="text-slate-400">Gender</p>
                      <p className="text-white">{profile.gender}</p>
                    </div>
                  )}
                  {profile.maritalStatus && (
                    <div>
                      <p className="text-slate-400">Marital Status</p>
                      <p className="text-white">{profile.maritalStatus}</p>
                    </div>
                  )}

                  {/* Employment Information */}
                  <div className="md:col-span-2 mt-4">
                    <p className="text-slate-400 font-semibold mb-3 uppercase text-xs tracking-wider">
                      Employment Information
                    </p>
                  </div>
                  {position && (
                    <div>
                      <p className="text-slate-400">Position</p>
                      <p className="text-white font-medium">
                        {getPopulatedValue(position, "title")}
                      </p>
                    </div>
                  )}
                  {department && (
                    <div>
                      <p className="text-slate-400">Department</p>
                      <p className="text-white font-medium">
                        {getPopulatedValue(department, "name")}
                      </p>
                    </div>
                  )}
                  {profile.dateOfHire && (
                    <div>
                      <p className="text-slate-400">Hire Date</p>
                      <p className="text-white">
                        {new Date(profile.dateOfHire).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-slate-400">Employment Status</p>
                    <StatusBadge status={profile.status} />
                  </div>
                  <div>
                    <p className="text-slate-400">Contract Type</p>
                    <p className="text-white">{profile.contractType || "—"}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Work Type</p>
                    <p className="text-white">{profile.workType || "—"}</p>
                  </div>
                  {profile.contractStartDate && (
                    <div>
                      <p className="text-slate-400">Contract Start</p>
                      <p className="text-white">
                        {new Date(profile.contractStartDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {profile.contractEndDate && (
                    <div>
                      <p className="text-slate-400">Contract End</p>
                      <p className="text-white">
                        {new Date(profile.contractEndDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {profile.probationEndDate && (
                    <div>
                      <p className="text-slate-400">Probation End</p>
                      <p className="text-white">
                        {new Date(profile.probationEndDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {/* Compensation */}
                  {payGrade && (
                    <>
                      <div className="md:col-span-2 mt-4">
                        <p className="text-slate-400 font-semibold mb-3 uppercase text-xs tracking-wider">
                          Compensation
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Pay Grade</p>
                        <p className="text-white font-medium">
                          {getPopulatedValue(payGrade, "gradeName")}
                        </p>
                      </div>
                      {(payGrade as PayGrade).gradeLevel && (
                        <div>
                          <p className="text-slate-400">Grade Level</p>
                          <p className="text-white">
                            Level {(payGrade as PayGrade).gradeLevel}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Performance */}
                  {profile.lastAppraisalRecord && (
                    <>
                      <div className="md:col-span-2 mt-4">
                        <p className="text-slate-400 font-semibold mb-3 uppercase text-xs tracking-wider flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Latest Performance Appraisal
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Overall Rating</p>
                        <p className="text-white font-semibold">
                          {profile.lastAppraisalRecord.overallRatingLabel || "—"}
                        </p>
                      </div>
                      {profile.lastAppraisalRecord.totalScore !== undefined && (
                        <div>
                          <p className="text-slate-400">Total Score</p>
                          <p className="text-white font-semibold">
                            {profile.lastAppraisalRecord.totalScore}
                          </p>
                        </div>
                      )}
                      {profile.lastAppraisalRecord.createdAt && (
                        <div>
                          <p className="text-slate-400">Appraisal Date</p>
                          <p className="text-white">
                            {new Date(profile.lastAppraisalRecord.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-4 pt-4 border-t border-white/10">
                  <Shield className="w-3 h-3 inline mr-1" />
                  To change these fields, please submit a change request to HR.
                </p>
              </CardContent>
            </Card>

            {/* My Change Requests */}
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  My Change Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingRequests ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                    <p className="text-slate-400 mt-2 text-sm">Loading requests...</p>
                  </div>
                ) : myRequests.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">
                    No change requests submitted yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {myRequests.map((request) => (
                      <div
                        key={request._id}
                        className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              Request ID: {request.requestId}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              Submitted: {new Date(request.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge
                            variant={
                              request.status === ProfileChangeStatus.APPROVED
                                ? "default"
                                : request.status === ProfileChangeStatus.REJECTED
                                ? "destructive"
                                : "secondary"
                            }
                            className="ml-2"
                          >
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-300 mb-2">
                          {request.requestDescription || request.reason}
                        </p>
                        {request.fieldChanges && request.fieldChanges.length > 0 && (
                          <div className="text-xs text-slate-400 mt-2 space-y-1">
                            <p className="font-medium">Changes requested:</p>
                            {request.fieldChanges.map((change, idx) => {
                              // Helper to format values for display
                              const formatValue = (fieldName: string, value: any): string => {
                                if (!value || value === "—") return "—";
                                
                                // Convert department ID to name
                                if (fieldName === "primaryDepartmentId" && department) {
                                  // Check if this is the old value (current department)
                                  const deptId = typeof department === 'object' ? department._id : department;
                                  if (value === deptId) {
                                    return typeof department === 'object' ? department.name : String(value);
                                  }
                                }
                                
                                // Convert position ID to title
                                if (fieldName === "primaryPositionId" && position) {
                                  // Check if this is the old value (current position)
                                  const posId = typeof position === 'object' ? position._id : position;
                                  if (value === posId) {
                                    return typeof position === 'object' ? position.title : String(value);
                                  }
                                }
                                
                                return String(value);
                              };
                              
                              return (
                                <p key={idx} className="ml-2">
                                  • {change.fieldName}: {formatValue(change.fieldName, change.oldValue)} → {formatValue(change.fieldName, change.newValue)}
                                </p>
                              );
                            })}
                          </div>
                        )}
                        {request.processingComments && (
                          <div className="mt-2 p-2 rounded bg-white/5 border border-white/5">
                            <p className="text-xs text-slate-400">HR Comment:</p>
                            <p className="text-sm text-white mt-1">{request.processingComments}</p>
                          </div>
                        )}
                        {request.processedAt && (
                          <p className="text-xs text-slate-500 mt-2">
                            Reviewed: {new Date(request.processedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
