import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { registerPWA } from "./pwa";
import { Toaster } from "./components/ui/feedback/sonner";

// Register the PWA
registerPWA();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Toaster />
  </StrictMode>
);
