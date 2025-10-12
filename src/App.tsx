import { RouterProvider, createBrowserRouter } from "react-router-dom";
import routes from "./routes";
import { ReduxProvider } from "./providers/ReduxProvider";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import { LanguageProvider } from "./contexts/LanguageContext";

export default function App() {
  const router = createBrowserRouter(routes);
  
  return (
    <ReduxProvider>
      <LanguageProvider>
        <RouterProvider router={router} />
        <PWAInstallPrompt />
      </LanguageProvider>
    </ReduxProvider>
  );
}
