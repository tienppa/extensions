importScripts(
  "https://www.gstatic.com/firebasejs/9.19.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.19.1/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/firebase-logo.svg",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

messaging.onMessage((payload) => {
  console.log("Message received in foreground ", payload);
  const notificationTitle = payload.notification.title;
  const notificationBody = payload.notification.body;

  if (notificationTitle || notificationBody) {
    new Notification(notificationTitle, {
      body: notificationBody,
    });
  } else {
    console.log("Received data payload:", payload.data);
    document.getElementById("message-container").innerText =
      "Message Received! (No notification data)";
  }
});