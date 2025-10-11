import { RouterProvider, createBrowserRouter } from "react-router-dom";
import routes from "./routes";
import { ReduxProvider } from "./providers/ReduxProvider";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import OfflineIndicator from "./components/OfflineIndicator";
import AppInitializer from "./components/AppInitializer";

export default function App() {
  const router = createBrowserRouter(routes);
  
  // Get user ID from localStorage if available
  const userId = localStorage.getItem('userId') || undefined;
  
  return (
    <ReduxProvider>
      <AppInitializer userId={userId}>
        <RouterProvider router={router} />
        <PWAInstallPrompt />
        <OfflineIndicator />
      </AppInitializer>
    </ReduxProvider>
  );
}
