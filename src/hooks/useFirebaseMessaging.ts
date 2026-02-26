import { initializeAppHandler } from '@/lib/firebase';
import { getMessaging, getToken as getTokenFirebase, MessagePayload, Messaging, onMessage } from 'firebase/messaging';
import { useCallback, useEffect, useState } from 'react';

// Function to handle foreground messages
const onMessageListener = (messaging: Messaging) => {
  if (!messaging) {
    return new Promise((resolve) => {
      resolve(null);
    });
  }

  return new Promise((resolve) => {
    onMessage(messaging, (payload: MessagePayload) => {
      console.log('Message received in foreground:', payload);
      resolve(payload);
    });
  });
};

const getToken = async (messaging: Messaging) => {

  if (!messaging) {
    console.log('Firebase messaging not available');
    return null;
  }

  try {
    const token = await getTokenFirebase(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    });

    if (token) {
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('No registration token available.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
};


export const useFirebaseMessaging = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [notification, setNotification] = useState<MessagePayload | null>(null);
  const [messaging, setMessaging] = useState<Messaging | null>(null);
  const [userRole] = useState<string | null>(null);


  const [callData, setCallData] = useState<{
    app_id: string;
    channel_name: string;
    token: string;
  } | null>(null);



  const registerServiceWorker = useCallback(async () => {
    if ('Notification' in window && "serviceWorker" in navigator) {


      const app = initializeAppHandler();

      if (!app) return;

      const messaging: Messaging = getMessaging(app);

      if (!messaging) return;

      setMessaging(p => messaging);

      const fcmToken = await getToken(messaging);

      if (!fcmToken) return;

      setToken(fcmToken);

      onMessageListener(messaging)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((payload: any) => {
          console.log('Message received in foreground:', payload);



          setNotification(payload);




        })
        .catch((error) => {
          console.error('Error in onMessageListener:', error);
        });



    }
  }, []);

  useEffect(() => {
    // Check if the browser supports notifications
    if ('Notification' in window && 'serviceWorker' in navigator) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSupported(true);

      // Request notification permission
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            registerServiceWorker();
          } else {
            console.log('Notification permission denied');
          }
        });
      } else if (Notification.permission === 'granted') {
        registerServiceWorker();
      }
    } else {
      console.log('This browser does not support notifications');
    }
  }, [registerServiceWorker]);



  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      console.log('Notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await registerServiceWorker();
        return true;
      } else {
        console.log('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  };

  const clearNotification = () => {
    setNotification(null);
  };

  const getFCMToken = async () => {
    if (!messaging || !userRole) return null;
    return await getToken(messaging);
  };


  const clearCallData = () => {
    setCallData(null);
  };

  return {
    token,
    isSupported,
    setToken,
    requestPermission,
    notification,
    setNotification,
    clearNotification,
    getFCMToken,
    callData,
    clearCallData
  };
};
