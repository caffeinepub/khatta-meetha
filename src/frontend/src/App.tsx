import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Layout from "./components/Layout";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";

// Root route wraps everything in Layout
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
    </>
  ),
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: HomePage,
});

const menuRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/menu",
  component: MenuPage,
});

const adminRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([indexRoute, menuRoute, adminRoute]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </>
  );
}
