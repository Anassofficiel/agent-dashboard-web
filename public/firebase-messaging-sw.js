importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyBYv_kM4WlnjC6bmKcc2lWXcH4nVm_xZNY",
    authDomain: "notification-ef28b.firebaseapp.com",
    projectId: "notification-ef28b",
    storageBucket: "notification-ef28b.appspot.com",
    messagingSenderId: "540080213182",
    appId: "1:540080213182:web:1234bc65e64366850aa2ef"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

    const title =
        payload.notification?.title ||
        "WhatsApp AI Platform";

    const options = {
        body: payload.notification?.body,
        icon: "/icon-192.png",
        badge: "/badge-72.png",
        vibrate: [300, 150, 300],
        requireInteraction: true
    };

    self.registration.showNotification(
        title,
        options
    );

});

self.addEventListener(
    "notificationclick",
    (event) => {

        event.notification.close();

        event.waitUntil(
            clients.openWindow("/")
        );

    }
);