import { RouterProvider, createBrowserRouter } from "react-router-dom";
import routes from "./routes";
import { ReduxProvider } from "./providers/ReduxProvider";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import { Toaster } from "sonner";

export default function App() {
  const router = createBrowserRouter(routes);
  
  return (
    <ReduxProvider>
      <RouterProvider router={router} />
      <PWAInstallPrompt />
      <Toaster position="top-right" richColors />
    </ReduxProvider>
  );
}
