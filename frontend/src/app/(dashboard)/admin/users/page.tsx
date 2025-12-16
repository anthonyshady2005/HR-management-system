"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
    Users,
    Search,
    MoreVertical,
    Shield,
    UserX,
    Check,
    X,
    Loader2,
    AlertTriangle
} from "lucide-react";

// Enum definition (matching backend)
enum SystemRole {
    DEPARTMENT_EMPLOYEE = 'department employee',
    DEPARTMENT_HEAD = 'department head',
    HR_MANAGER = 'HR Manager',
    HR_EMPLOYEE = 'HR Employee',
    PAYROLL_SPECIALIST = 'Payroll Specialist',
    PAYROLL_MANAGER = 'Payroll Manager',
    SYSTEM_ADMIN = 'System Admin',
    LEGAL_POLICY_ADMIN = 'Legal & Policy Admin',
    RECRUITER = 'Recruiter',
    FINANCE_STAFF = 'Finance Staff',
    JOB_CANDIDATE = 'Job Candidate',
    HR_ADMIN = 'HR Admin',
}

interface User {
    id: string;
    employeeNumber: string;
    name: string;
    personalEmail: string;
    workEmail?: string;
    status: string;
    department?: { name: string; code: string };
    position?: { title: string; code: string };
}

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // Modal States
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

    // Role Management State
    const [userRoles, setUserRoles] = useState<SystemRole[]>([]);
    const [rolesLoading, setRolesLoading] = useState(false);

    const API_URL = "http://localhost:3000"; // Should be env var

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/employee-profile/search`, {
                params: { name: searchQuery, limit: 50 },
                withCredentials: true
            });
            setUsers(res.data.employees);
        } catch (err: any) {
            console.error("Failed to fetch users", err);
            setError("Failed to load users. Ensure you have admin permissions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [searchQuery]); // Debounce usually recommended, keeping simple for now

    const openRoleModal = async (user: User) => {
        setSelectedUser(user);
        setIsRoleModalOpen(true);
        setRolesLoading(true);
        try {
            const res = await axios.get(`${API_URL}/employee-profile/${user.id}/roles`, {
                withCredentials: true
            });
            // res.data likely returns { roles: [...], ... } or just array? 
            // Checking service: return this.profileService.getEmployeeRoles(employeeId)
            // Service returns just the role document usually. 
            // Wait, getEmployeeRoles service method wasn't shown fully but likely returns role doc.
            // Let's assume it returns { roles: string[] }
            setUserRoles(res.data.roles || []);
        } catch (err) {
            console.error("Failed to fetch roles", err);
            setUserRoles([]);
        } finally {
            setRolesLoading(false);
        }
    };

    const handleSaveRoles = async (newRoles: SystemRole[]) => {
        if (!selectedUser) return;
        try {
            await axios.post(`${API_URL}/employee-profile/${selectedUser.id}/roles`, {
                roles: newRoles
            }, { withCredentials: true });
            setIsRoleModalOpen(false);
            // Optionally show success toast
        } catch (err) {
            console.error("Failed to save roles", err);
            alert("Failed to update roles");
        }
    };

    const handleDeactivateUser = async () => {
        if (!selectedUser) return;
        try {
            await axios.post(`${API_URL}/employee-profile/${selectedUser.id}/deactivate`, {
                status: "INACTIVE", // or TERMINATED
                reason: "Admin action"
            }, { withCredentials: true });
            setIsDeactivateModalOpen(false);
            fetchUsers(); // Refresh list
        } catch (err) {
            console.error("Failed to deactivate user", err);
            alert("Failed to deactivate user");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">User Management</h1>
                <p className="text-slate-400">Manage system access, roles, and user status.</p>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                </div>
                {/* Could add filters here */}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10 text-slate-400">
                                <th className="px-6 py-4 font-medium">Employee</th>
                                <th className="px-6 py-4 font-medium">Contact</th>
                                <th className="px-6 py-4 font-medium">Department / Position</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                        Loading users...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{user.name}</div>
                                                    <div className="text-xs text-slate-400">#{user.employeeNumber}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-300">
                                            <div>{user.workEmail || user.personalEmail}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-300">
                                            <div>{user.department?.name || "-"}</div>
                                            <div className="text-xs text-slate-500">{user.position?.title || "-"}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                    'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                                }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openRoleModal(user)}
                                                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                                                    title="Manage Roles"
                                                >
                                                    <Shield className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedUser(user); setIsDeactivateModalOpen(true); }}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                                                    title="Deactivate User"
                                                >
                                                    <UserX className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Role Modal */}
            {isRoleModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Manage Roles</h2>
                            <button onClick={() => setIsRoleModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <p className="text-slate-400 mb-4">Assign roles for <span className="text-white font-medium">{selectedUser.name}</span></p>

                            {rolesLoading ? (
                                <div className="text-center py-8 text-slate-400">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                    Loading roles...
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {Object.values(SystemRole).map((role) => (
                                        <label key={role} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${userRoles.includes(role)
                                                ? 'bg-emerald-500/10 border-emerald-500/50'
                                                : 'bg-white/5 border-white/10 hover:border-white/20'
                                            }`}>
                                            <span className="text-sm font-medium text-slate-200">{role}</span>
                                            <input
                                                type="checkbox"
                                                checked={userRoles.includes(role)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setUserRoles([...userRoles, role]);
                                                    } else {
                                                        setUserRoles(userRoles.filter(r => r !== role));
                                                    }
                                                }}
                                                className="w-5 h-5 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-black/40"
                                            />
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end gap-3">
                            <button
                                onClick={() => setIsRoleModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleSaveRoles(userRoles)}
                                className="px-4 py-2 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Deactivate Modal */}
            {isDeactivateModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl">
                        <div className="p-6">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 mb-4">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Deactivate User?</h2>
                            <p className="text-slate-400">
                                Are you sure you want to deactivate <span className="text-white font-medium">{selectedUser.name}</span>?
                                This will restrict their access to the system.
                            </p>
                        </div>
                        <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end gap-3">
                            <button
                                onClick={() => setIsDeactivateModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeactivateUser}
                                className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                            >
                                Deactivate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

