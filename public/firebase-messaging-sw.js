// Import Firebase scripts for service worker
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: "",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message",
    payload
  );

  // Customize notification here
  const notificationTitle = payload.notification?.title || "New Message";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new message",
    icon: "/images/logo.png",
    badge: "/images/logo.png",
    data: payload.data || {}, // Important: store the payload data
    actions: [
      {
        action: "open",
        title: "Open App",
      },
      {
        action: "close",
        title: "Close",
      },
    ],
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// Handle notification click event - MUST be at top level
self.addEventListener("notificationclick", (event) => {
  console.log("🔔 Notification click received!");
  console.log("Action:", event.action);
  console.log("Notification data:", event.notification.data);

  event.notification.close();

  const action = event.action;
  const payload = event.notification.data;

  if (action === "open" || action === "") {
    // Build URL from payload data
    let url = "/";
    const encodedToken = encodeURIComponent(payload.token);
    const encodedChannel = encodeURIComponent(payload.channel_name);
    const encodedAppId = encodeURIComponent(payload.app_id);
    if (payload && payload.app_id && payload.channel_name && payload.token) {
      url = `/doctor-video-call?appId=${encodedAppId}&channel=${encodedChannel}&token=${encodedToken}`;
    }

    console.log("Opening URL:", url);

    // Focus existing window or open new one
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((windowClients) => {
        for (let client of windowClients) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  } else if (action === "close") {
    console.log("Notification closed by user");
  }
});

// Handle notification close event
self.addEventListener("notificationclose", (event) => {
  console.log("Notification closed:", event.notification);
});

// Service worker installation event
self.addEventListener("install", (event) => {
  console.log("Service Worker installed");
  self.skipWaiting(); // Activate immediately
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");
  return self.clients.claim(); // Take control immediately
});
