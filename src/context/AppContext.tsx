/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface ModalOptions {
  locked?: boolean;
  maxWidth?: string;
}

interface AppContextType {
  login: (email: string, password: string) => boolean;
  logout: () => void;
  showToast: (message: string) => void;
  openModal: (content: ReactNode, options?: ModalOptions) => void;
  closeModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

// Mock users for demo login
const MOCK_USERS = [
  { 
    id: 'sys-1', 
    email: 'sysadmin@rcn.local', 
    password: 'Admin123!', 
    role: 'SYSTEM_ADMIN', 
    enabled: true,
    orgId: null 
  },
  { 
    id: 'org-1', 
    email: 'orgadmin@demo.com', 
    password: 'Admin123!', 
    role: 'ORG_ADMIN', 
    enabled: true,
    orgId: 'org-1' 
  },
  { 
    id: 'staff-1', 
    email: 'staff@demo.com', 
    password: 'Admin123!', 
    role: 'STAFF', 
    enabled: true,
    orgId: 'org-1' 
  },
];

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToastFlag, setShowToastFlag] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode>(null);
  const [modalOptions, setModalOptions] = useState<any>({});

  const login = (email: string, password: string): boolean => {
    const user = MOCK_USERS.find((u: any) => 
      u.email.toLowerCase() === email.toLowerCase() && u.enabled
    );
    
    if (!user) {
      showToast("User not found or disabled.");
      return false;
    }

    const actual = user.password || "Admin123!";
    if (password !== actual) {
      showToast("Incorrect password.");
      return false;
    }

    // Route based on role
    if (user.role === 'SYSTEM_ADMIN' || !user.orgId) {
      router.push('/master-admin/dashboard');
    } else if(user.role === 'STAFF') {
      router.push('/staff-portal');
    } else if(user.role === 'ORG_ADMIN') {
      router.push('/org-portal');
    }
    return true;
  };

  const logout = () => {
    router.push('/login');
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setShowToastFlag(true);
    setTimeout(() => setShowToastFlag(false), 2600);
  };

  const openModal = (content: ReactNode, options = {}) => {
    setModalContent(content);
    setModalOptions(options);
  };

  const closeModal = () => {
    if (modalOptions.locked) {
      showToast("Please complete the required action.");
      return;
    }
    setModalContent(null);
    setModalOptions({});
  };

  const value = {
    login,
    logout,
    showToast,
    openModal,
    closeModal,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      
      {/* Toast notification */}
      <div className={`fixed right-4 bottom-4 z-60 bg-rcn-dark-bg text-rcn-dark-text border border-white/15 px-3 py-2.5 rounded-2xl shadow-rcn max-w-[360px] text-sm transition-all duration-300 ${
        showToastFlag ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}>
        {toastMessage}
      </div>

      {/* Modal */}
      {modalContent && (
        <div 
          className="fixed inset-0 bg-black/55 flex items-center justify-center p-5 z-50" 
          onClick={(e) => {
            if ((e.target as HTMLElement).classList.contains('bg-black/55')) {
              closeModal();
            }
          }}
        >
          <div className="max-w-[900px] w-full">
            <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4 max-h-[80vh] overflow-auto">
              {modalContent}
            </div>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};
