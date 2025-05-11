let firebaseApp;
let messaging;
const DISPLAY_BLOCK = "block";
const DISPLAY_NONE = "none";
const notificationHistory = [];

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
};

const YOUR_VAPID_KEY = "YOUR_VAPID_KEY";

function setDisplay(element, displayStyle) {
  if (element) element.style.display = displayStyle;
}

function updateMainTitle(title) {
  if (mainTitle) mainTitle.innerText = title;
}

function clearInputsAndErrors(inputs, errors) {
  inputs.forEach((input) => (input.value = ""));
  errors.forEach((error) => (error.textContent = ""));
}

const configInputs = document.getElementById("config-inputs");
const testingArea = document.getElementById("testing-area");
const messageContainer = document.getElementById("message-container");
const permissionButton = document.getElementById("permission-button");
const tokenDisplay = document.getElementById("token-display");
const continueButton = document.getElementById("continue-button");
const mainTitle = document.getElementById("main-title");
const getConfigButton = document.getElementById("get-config-button");
const resetButton = document.getElementById("reset-button");
const homeLink = document.getElementById("home-link");
const historyLink = document.getElementById("history-link");
const historyArea = document.getElementById("history-area");
const notificationHistoryBody = document.getElementById(
  "notification-history-body"
);
const backToTestButton = document.getElementById("back-to-test-button");

const apiKeyInput = document.getElementById("apiKey");
const authDomainInput = document.getElementById("authDomain");
const projectIdInput = document.getElementById("projectId");
const storageBucketInput = document.getElementById("storageBucket");
const messagingSenderIdInput = document.getElementById("messagingSenderId");
const appIdInput = document.getElementById("appId");
const measurementIdInput = document.getElementById("measurementId");
const vapidKeyInput = document.getElementById("vapidKey");

const apiKeyError = document.getElementById("apiKey-error");
const authDomainError = document.getElementById("authDomain-error");
const projectIdError = document.getElementById("projectId-error");
const storageBucketError = document.getElementById("storageBucket-error");
const messagingSenderIdError = document.getElementById(
  "messagingSenderId-error"
);
const appIdError = document.getElementById("appId-error");
const measurementIdError = document.getElementById("measurementId-error");
const vapidKeyError = document.getElementById("vapidKey-error");

const notificationToast = document.getElementById("notification-toast");
const toastTitleElement = document.getElementById("toast-title");
const toastBodyElement = document.getElementById("toast-body");
const toastCloseButton = document.getElementById("toast-close-button");

toastCloseButton.addEventListener("click", () => {
  notificationToast.classList.remove("show");
  notificationToast.classList.add("hide");
});

function showToast(title, body) {
  const toast = notificationToast;
  const toastTitleElement = document.getElementById("toast-title");
  const toastBodyElement = document.getElementById("toast-body");

  toastTitleElement.innerText = title;
  toastBodyElement.innerText = body;
  toast.classList.remove("hide");
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hide");
  }, 3000);
}

continueButton.addEventListener("click", () => {
  if (validateInputs()) {
    setDisplay(configInputs, DISPLAY_NONE);
    setDisplay(testingArea, DISPLAY_BLOCK);
    setDisplay(historyArea, DISPLAY_NONE);
    mainTitle.innerText = "Testing Firebase Messaging";
  }
});

getConfigButton.addEventListener("click", () => {
  const config = firebaseConfig;
  apiKeyInput.value = config.apiKey;
  authDomainInput.value = config.authDomain;
  projectIdInput.value = config.projectId;
  storageBucketInput.value = config.storageBucket;
  messagingSenderIdInput.value = config.messagingSenderId;
  appIdInput.value = config.appId;
  measurementIdInput.value = config.measurementId;
  vapidKeyInput.value = YOUR_VAPID_KEY;
});

resetButton.addEventListener("click", () => {
  resetApp();
});

homeLink.addEventListener("click", (event) => {
  event.preventDefault();
  resetApp();
});

historyLink.addEventListener("click", (event) => {
  event.preventDefault();
  setDisplay(configInputs, DISPLAY_NONE);
  setDisplay(testingArea, DISPLAY_NONE);
  setDisplay(historyArea, DISPLAY_BLOCK);
  updateMainTitle("Notification History");
  displayNotificationHistory();
});

backToTestButton.addEventListener("click", () => {
  setDisplay(configInputs, DISPLAY_NONE);
  setDisplay(testingArea, DISPLAY_BLOCK);
  setDisplay(historyArea, DISPLAY_NONE);
  updateMainTitle("Testing Firebase Messaging");
});

function resetApp() {
  clearInputsAndErrors(
    [
      apiKeyInput,
      authDomainInput,
      projectIdInput,
      storageBucketInput,
      messagingSenderIdInput,
      appIdInput,
      measurementIdInput,
      vapidKeyInput,
    ],
    [
      apiKeyError,
      authDomainError,
      projectIdError,
      storageBucketError,
      messagingSenderIdError,
      appIdError,
      measurementIdError,
      vapidKeyError,
    ]
  );

  setDisplay(configInputs, DISPLAY_BLOCK);
  setDisplay(testingArea, DISPLAY_NONE);
  setDisplay(historyArea, DISPLAY_NONE);
  updateMainTitle("Firebase Cloud Messaging Test");
  messageContainer.innerText = "Waiting for permission...";
  tokenDisplay.innerText = "";
  notificationHistory.length = 0;
  notificationHistoryBody.innerHTML = "";

  if (firebaseApp) {
    firebaseApp
      .delete()
      .then(() => console.log("Firebase App deleted."))
      .catch((err) => console.error("Error deleting Firebase App:", err));
    firebaseApp = null;
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration
          .unregister()
          .then((unregistered) =>
            console.log("Service worker unregistered:", unregistered)
          )
          .catch((error) =>
            console.error("Failed to unregister service worker:", error)
          );
      });
    });
  }
}

async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        "./firebase-messaging-sw.js"
      );
      console.log("Service Worker registered:", registration);
      // messaging.useServiceWorker(registration);

      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      messageContainer.innerText = `Service Worker registration failed: ${error.message}`;
    }
  } else {
    messageContainer.innerText =
      "Service workers are not supported in this browser.";
  }
  return null;
}

function validateInputs() {
  const inputs = [
    { input: apiKeyInput, error: apiKeyError, message: "API Key is required" },
    {
      input: authDomainInput,
      error: authDomainError,
      message: "Auth Domain is required",
    },
    {
      input: projectIdInput,
      error: projectIdError,
      message: "Project ID is required",
    },
    {
      input: storageBucketInput,
      error: storageBucketError,
      message: "Storage Bucket is required",
    },
    {
      input: messagingSenderIdInput,
      error: messagingSenderIdError,
      message: "Messaging Sender ID is required",
    },
    { input: appIdInput, error: appIdError, message: "App ID is required" },
    {
      input: measurementIdInput,
      error: measurementIdError,
      message: "Measurement ID is required",
    },
    {
      input: vapidKeyInput,
      error: vapidKeyError,
      message: "VAPID Key is required",
    },
  ];

  let isValid = true;
  inputs.forEach(({ input, error, message }) => {
    if (!input.value.trim()) {
      error.textContent = message;
      isValid = false;
    } else {
      error.textContent = "";
    }
  });

  return isValid;
}

permissionButton.addEventListener("click", () => {
  initializeFirebase();
});

async function initializeFirebase() {
  const firebaseConfig = {
    apiKey: apiKeyInput.value,
    authDomain: authDomainInput.value,
    projectId: projectIdInput.value,
    storageBucket: storageBucketInput.value,
    messagingSenderId: messagingSenderIdInput.value,
    appId: appIdInput.value,
    measurementId: measurementIdInput.value,
  };

  try {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    messaging = firebase.messaging(firebaseApp);

    messaging.onMessage((payload) => {
      console.log("Message received in foreground ", payload);

      const notificationTitle = payload.notification?.title;
      const notificationBody = payload.notification?.body;

      // Use Native toast
      if (notificationTitle || notificationBody) {
        showToast(notificationTitle, notificationBody);
      } else {
        showToast("Message", "Message Received");
      }

      // Add to notification history
      notificationHistory.push({
        title: notificationTitle || "Data message",
        body: notificationBody || "No data",
        timestamp: Date.now(),
      });

      // If on history page, update the view
      if (historyArea.style.display === "block") {
        displayNotificationHistory();
      }
    });

    const registration = await registerServiceWorker();
    if (registration) {
      messageContainer.innerText = "Waiting for permission...";
      tokenDisplay.innerText = "";

      requestNotificationPermission(registration);
    }
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    messageContainer.innerText =
      "Error initializing Firebase. Please check your configuration.";
  }
}

function requestNotificationPermission(registration) {
  // Add registration parameter
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      console.log("Notification permission granted.");
      getToken(registration); // Pass registration to getToken
    } else {
      console.log("Permission denied.");
      messageContainer.innerText = "Permission denied for notifications.";
    }
  });
}

function getToken(registration) {
  // Add registration parameter
  const vapidKey = vapidKeyInput.value;
  messaging
    .getToken({ vapidKey: vapidKey, serviceWorkerRegistration: registration })
    .then((currentToken) => {
      // Use it here
      if (currentToken) {
        console.log("Token is available:", currentToken);
        tokenDisplay.innerText = `Device Token: ${currentToken}`;
        messageContainer.innerText =
          "Token generated. Check console and provide token to send notification";
      } else {
        console.log("No token :(");
        messageContainer.innerText =
          "No token available. Allow permission to get token.";
      }
    })
    .catch((err) => {
      console.error("An error occurred while retrieving token.", err);
      messageContainer.innerText = `Error getting token: ${err.message}`;
    });
}

function displayNotificationHistory() {
  notificationHistoryBody.innerHTML = "";

  if (notificationHistory.length === 0) {
    createEmptyHistoryRow();
  } else {
    notificationHistory.forEach((notification) => {
      createHistoryRow(notification);
    });
  }
}

function createEmptyHistoryRow() {
  const row = notificationHistoryBody.insertRow();
  const messageCell = row.insertCell();
  messageCell.colSpan = 3;
  messageCell.textContent = "No notifications in history.";
  Object.assign(messageCell.style, {
    textAlign: "center",
    fontStyle: "italic",
    color: "#777",
  });
}

// Helper function to create a history row
function createHistoryRow(notification) {
  const row = notificationHistoryBody.insertRow();
  const titleCell = row.insertCell();
  const bodyCell = row.insertCell();
  const timestampCell = row.insertCell();

  titleCell.textContent = notification.title;
  bodyCell.textContent = notification.body;
  timestampCell.textContent = new Date(notification.timestamp).toLocaleString();
}
