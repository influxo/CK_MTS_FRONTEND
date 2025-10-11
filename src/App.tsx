import { RouterProvider, createBrowserRouter } from "react-router-dom";
import routes from "./routes";
import { ReduxProvider } from "./providers/ReduxProvider";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import OfflineIndicator from "./components/OfflineIndicator";

export default function App() {
  const router = createBrowserRouter(routes);
  
  return (
    <ReduxProvider>
      <RouterProvider router={router} />
      <PWAInstallPrompt />
      <OfflineIndicator />
    </ReduxProvider>
  );
}
