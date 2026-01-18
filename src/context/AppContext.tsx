import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getDB, getSession, setSession, clearSession, audit, saveDB } from '../utils/database';

interface AppContextType {
  db: any;
  session: any;
  refreshDB: () => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  showToast: (message: string) => void;
  openModal: (content: ReactNode, options?: any) => void;
  closeModal: () => void;
  currentUser: any;
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

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [db, setDb] = useState<any>(getDB());
  const [session, setSessionState] = useState<any>(getSession());
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToastFlag, setShowToastFlag] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode>(null);
  const [modalOptions, setModalOptions] = useState<any>({});

  const refreshDB = () => {
    setDb(getDB());
  };

  const login = (email: string, password: string): boolean => {
    const database = getDB();
    const user = database.users.find((u: any) => 
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

    const newSession = {
      email: user.email,
      userId: user.id,
      role: user.role,
      orgId: user.orgId,
      at: new Date().toISOString(),
      selected: { senderOrgId: null, receiverOrgId: null }
    };

    setSession(newSession);
    setSessionState(newSession);
    audit("login", { email: user.email, role: user.role });
    refreshDB();
    return true;
  };

  const logout = () => {
    audit("logout", {});
    clearSession();
    setSessionState(null);
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

  const currentUser = session ? db.users.find((u: any) => u.id === session.userId) : null;

  const value = {
    db,
    session,
    refreshDB,
    login,
    logout,
    showToast,
    openModal,
    closeModal,
    currentUser
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      
      {/* Toast notification */}
      <div className={`toast ${showToastFlag ? 'show' : ''}`}>
        {toastMessage}
      </div>

      {/* Modal */}
      {modalContent && (
        <div 
          className="modalBack show" 
          onClick={(e) => {
            if ((e.target as HTMLElement).classList.contains('modalBack')) {
              closeModal();
            }
          }}
        >
          <div className="modal">
            <div className="card">
              {modalContent}
            </div>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};
