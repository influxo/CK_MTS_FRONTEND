import { RouterProvider, createBrowserRouter } from "react-router-dom";
import routes from "./routes";
import { ReduxProvider } from "./providers/ReduxProvider";

export default function App() {
  const router = createBrowserRouter(routes);
  
  return (
    <ReduxProvider>
      <RouterProvider router={router} />
    </ReduxProvider>
  );
}
