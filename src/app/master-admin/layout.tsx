"use client";
import { Sidebar, MasterAdminHeader } from "@/components/MasterAdmin";
import { useState, useEffect } from "react";
import { getAuthProfileApi } from "@/apis/ApiCalls";
import { AdminProfileData } from "./types/profile";
import toast from "react-hot-toast";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [profile, setProfile] = useState<AdminProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getAuthProfileApi();
                if (response?.data?.success) {
                    setProfile(response.data.data);
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