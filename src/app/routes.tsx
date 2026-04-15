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
import { AdminDashboard } from "./pages/admin/AdminDashboard";
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
        path: "admin/dashboard",
        element: <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>,
      },
      { path: "*", Component: NotFound },
    ],
  },
]);

