import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { UserDashboard } from "./pages/user/UserDashboard";
import { BookService } from "./pages/user/BookService";
import { TrackService } from "./pages/user/TrackService";
import { Shop } from "./pages/user/Shop";
import { OrderProducts } from "./pages/user/OrderProducts";
import { TechnicianDashboard } from "./pages/technician/TechnicianDashboard";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminOverview } from "./pages/admin/AdminOverview";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminTechnicians } from "./pages/admin/AdminTechnicians";
import { AdminServices } from "./pages/admin/AdminServices";
import { AdminOrders } from "./pages/admin/AdminOrders";
import { AdminProducts } from "./pages/admin/AdminProducts";
import { NotFound } from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      {
        path: "user/dashboard",
        element: <ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>,
      },
      {
        path: "user/book-service",
        element: <ProtectedRoute role="user"><BookService /></ProtectedRoute>,
      },
      {
        path: "user/track-service",
        element: <ProtectedRoute role="user"><TrackService /></ProtectedRoute>,
      },
      {
        path: "user/shop",
        element: <ProtectedRoute role="user"><Shop /></ProtectedRoute>,
      },
      {
        path: "user/order/:orderId",
        element: <ProtectedRoute role="user"><OrderProducts /></ProtectedRoute>,
      },
      {
        path: "technician/dashboard",
        element: <ProtectedRoute role="technician"><TechnicianDashboard /></ProtectedRoute>,
      },
      {
        path: "admin",
        element: <ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>,
        children: [
          { index: true, path: "dashboard", element: <AdminOverview /> },
          { path: "users", element: <AdminUsers /> },
          { path: "technicians", element: <AdminTechnicians /> },
          { path: "services", element: <AdminServices /> },
          { path: "orders", element: <AdminOrders /> },
          { path: "products", element: <AdminProducts /> },
        ],
      },
      { path: "*", Component: NotFound },
    ],
  },
]);

