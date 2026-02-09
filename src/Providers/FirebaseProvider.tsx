import { MessagePayload } from "firebase/messaging";
import React, { createContext, useContext } from "react";
import { useFirebaseMessaging } from "../hooks/useFirebaseMessaging";

const FirebaseContext = createContext<{
  token: string | null;
  isSupported: boolean;
  notification: MessagePayload | null;
  setToken: (token: string | null) => void;
  clearNotification: () => void;
  requestPermission: () => Promise<boolean>;
  getFCMToken: () => Promise<string | null>;
}>({
  token: null,
  isSupported: false,
  notification: null,
  setToken: () => {},
  clearNotification: () => {},
  requestPermission: () => Promise.resolve(false),
  getFCMToken: () => Promise.resolve(null),
});

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
};

export const FirebaseProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {
    token,
    isSupported,
    notification,
    setToken,
    clearNotification,
    requestPermission,
    getFCMToken,
  
  } = useFirebaseMessaging();

  const value = {
    token,
    isSupported,
    notification,
    setToken,
    clearNotification,
    requestPermission,
    getFCMToken,
   
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

export default FirebaseProvider;
