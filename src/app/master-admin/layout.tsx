"use client";
import { getAuthProfileApi } from "@/apis/ApiCalls";
import { MasterAdminHeader, Sidebar } from "@/components/MasterAdmin";
import { updateLoginUser } from "@/store/slices/Auth/authSlice";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { AdminProfileData } from "./types/profile";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [profile, setProfile] = useState<AdminProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getAuthProfileApi();
                if (response?.data?.success) {
                    setProfile(response.data.data);
                    dispatch(updateLoginUser(response.data.data as AdminProfileData));
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
                toast.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);


    return (
        <div className="min-h-screen flex">
            <Sidebar
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />
            <main className="flex-1 p-6 pb-10 overflow-auto">
                <div className="md:ml-0 ml-0">
                    <MasterAdminHeader
                        setIsMobileMenuOpen={setIsMobileMenuOpen}
                        profile={profile}
                        loading={loading}
                    />
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;