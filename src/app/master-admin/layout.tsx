"use client";
import { Sidebar, MasterAdminHeader } from "@/components/MasterAdmin";
import { useState } from "react";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


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
                    />
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;