"use client";
import { getAuthProfileApi } from "@/apis/ApiCalls";
import { MasterAdminHeader, Sidebar } from "@/components/MasterAdmin";
import { updateLoginUser } from "@/store/slices/Auth/authSlice";
import defaultQueryKeys from "@/utils/adminQueryKeys";
import { checkResponse } from "@/utils/commonFunc";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { AdminProfileData } from "./types/profile";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


    const dispatch = useDispatch();

    const { data: profile, isLoading: isLoadingProfile } = useQuery({
        queryKey: defaultQueryKeys.profile,
        queryFn: async () => {
            const res = await getAuthProfileApi();
            if (!checkResponse({ res })) return null;
            const raw = res.data as { data?: AdminProfileData; success?: boolean };
            const profile = raw?.data ?? null;
            dispatch(updateLoginUser(profile as AdminProfileData));
            return profile && typeof profile === "object" ? profile : null;
        },
    });


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
                        profile={profile as AdminProfileData | null}
                        loading={isLoadingProfile}
                    />
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;