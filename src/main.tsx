import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerFirebaseSW, listenForegroundMessages } from "@/lib/firebasePush";

// 1. Register Service Worker (background push support).
registerFirebaseSW();

// 2. Listen for foreground pushes — shows a browser Notification
//    when the app is open (FCM skips showNotification() in foreground).
listenForegroundMessages();

createRoot(document.getElementById("root")!).render(<App />);